// Credits: https://iconify.design/docs/articles/cleaning-up-icons/#parsing-an-entire-icon-set
import fs from 'node:fs/promises'
import path from 'node:path'

import type { IconSet } from '@iconify/tools'
import {
  cleanupSVG,
  deOptimisePaths,
  importDirectory,
  isEmptyColor,
  parseColors,
  runSVGO,
} from '@iconify/tools'
import type { IconifyJSON } from '@iconify/types'
import { compareColors, stringToColor } from '@iconify/utils/lib/colors'

export type ImportSvgCollectionOptions = {
  /** SVG directory path */
  source: string
  /**
   * Whether to include SVG files from subdirectories
   * @default true
   */
  includeSubDirs?: boolean
}

export type ImportSvgCollectionsOptions = {
  /** SVG root directory path */
  source: string
}

/**
 * Process icons in an icon set with color handling and optimization
 */
async function processIconSet(iconSet: IconSet): Promise<void> {
  // Track icons to remove due to processing errors
  const iconsToRemove: string[] = []

  await iconSet.forEach((name, type) => {
    if (type !== 'icon') {
      // Do not parse aliases
      return
    }

    // Get SVG instance for icon
    const svg = iconSet.toSVG(name)
    if (!svg) {
      return
    }

    try {
      // Clean up and validate icon
      // This will throw an exception if icon is invalid
      cleanupSVG(svg)

      // Change color to `currentColor`
      // Skip this step if icon has hardcoded palette
      const blackColor = stringToColor('black')!
      const whiteColor = stringToColor('white')!
      parseColors(svg, {
        defaultColor: 'currentColor',
        callback: (attr, colorStr, color) => {
          if (!color) {
            // Color cannot be parsed!
            throw new Error(`Invalid color: "${colorStr}" in attribute ${attr}`)
          }

          if (isEmptyColor(color)) {
            // Color is empty: 'none' or 'transparent'. Return as is
            return color
          }

          // Change black to 'currentColor'
          if (compareColors(color, blackColor)) {
            return 'currentColor'
          }

          // Remove shapes with white color
          if (compareColors(color, whiteColor)) {
            return 'remove'
          }

          throw new Error(`Unexpected color "${colorStr}" in attribute ${attr}`)
        },
      })

      // Optimise
      runSVGO(svg)

      // Update paths for compatibility with old software
      deOptimisePaths(svg)

      // SVG instance is detached from icon set, so changes to
      // icon are not stored in icon set automatically.

      // Update icon in icon set
      iconSet.fromSVG(name, svg)
    }
    catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      console.warn(`[importSvgCollection] Skipping icon "${name}": ${message}`)
      iconsToRemove.push(name)
    }
  })

  for (const name of iconsToRemove) {
    iconSet.remove(name)
  }
}

/**
 * Import an SVG icon collection from a directory.
 *
 * Processes all SVG files in the specified directory, applying cleanup,
 * color normalization, and optimization. Invalid icons are skipped with
 * a warning rather than failing the entire import.
 *
 * @example
 * ```ts
 * import { importSvgCollection } from '@egoist/tailwindcss-icons/iconify'
 *
 * // Prefix is derived from directory name
 * const icons = await importSvgCollection({
 *   source: './my-icons',
 * })
 * // icons.prefix === 'my-icons'
 * ```
 */
export async function importSvgCollection(
  options: ImportSvgCollectionOptions,
): Promise<IconifyJSON> {
  const { source, includeSubDirs = true } = options

  // Derive prefix from directory name
  const prefix = path.basename(source)

  const iconSet = await importDirectory(source, {
    prefix,
    ignoreImportErrors: 'warn',
    includeSubDirs,
  })

  await processIconSet(iconSet)

  return iconSet.export()
}

/**
 * Find all directories that directly contain SVG files
 */
async function findSvgDirectories(rootDir: string): Promise<string[]> {
  const result: string[] = []

  async function traverse(dir: string): Promise<void> {
    const entries = await fs.readdir(dir, { withFileTypes: true })

    let hasSvgFiles = false
    const subdirs: string[] = []

    for (const entry of entries) {
      if (entry.isFile() && entry.name.endsWith('.svg')) {
        hasSvgFiles = true
      }
      else if (entry.isDirectory()) {
        subdirs.push(path.join(dir, entry.name))
      }
    }

    if (hasSvgFiles) {
      result.push(dir)
    }

    // Recursively traverse subdirectories
    for (const subdir of subdirs) {
      await traverse(subdir)
    }
  }

  await traverse(rootDir)
  return result
}

/**
 * Import multiple SVG icon collections from a directory tree.
 *
 * Scans the directory tree and creates separate icon sets for each directory
 * that directly contains SVG files. Subdirectories are traversed recursively,
 * but each collection only includes SVG files directly in that directory
 * (not nested further).
 *
 * @example
 * ```ts
 * import { importSvgCollections } from '@egoist/tailwindcss-icons/iconify'
 *
 * // Directory structure:
 * // icons/
 * //   arrows/
 * //     left.svg
 * //     right.svg
 * //   alerts/
 * //     warning.svg
 *
 * const collections = await importSvgCollections({
 *   source: './icons',
 * })
 * // Result: { arrows: IconifyJSON, alerts: IconifyJSON }
 * ```
 */
export async function importSvgCollections(
  options: ImportSvgCollectionsOptions,
): Promise<Record<string, IconifyJSON>> {
  const { source } = options

  const svgDirs = await findSvgDirectories(source)

  const collections: Record<string, IconifyJSON> = {}

  for (const dir of svgDirs) {
    const prefix = path.basename(dir)

    const iconSet = await importDirectory(dir, {
      prefix,
      ignoreImportErrors: 'warn',
      includeSubDirs: false,
    })

    await processIconSet(iconSet)

    const exported = iconSet.export()

    if (Object.keys(exported.icons).length > 0) {
      collections[prefix] = exported
    }
  }

  return collections
}
