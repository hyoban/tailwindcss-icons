// Credits: https://iconify.design/docs/articles/cleaning-up-icons/#parsing-an-entire-icon-set
import { promises as fs } from 'node:fs'

import {
  cleanupSVG,
  deOptimisePaths,
  importDirectory,
  isEmptyColor,
  parseColors,
  runSVGO,
} from '@iconify/tools'
import { compareColors, stringToColor } from '@iconify/utils/lib/colors'

(async () => {
  const source = 'svg'
  const prefix = 'test'
  const target = 'htdocs/assets/test.json'

  // Load icon set
  const iconSet = await importDirectory(source, {
    // Set prefix for imported icon set to 'test'
    prefix,
  })

  // Parse all icons
  await iconSet.forEach((name, type) => {
    if (type !== 'icon') {
      // Do not parse aliases
      return
    }

    // Get SVG instance for icon
    const svg = iconSet.toSVG(name)

    // Clean up and validate icon
    // This will throw an exception if icon is invalid
    cleanupSVG(svg)

    // Change color to `currentColor`
    // Skip this step if icon has hardcoded palette
    const blackColor = stringToColor('black')
    const whiteColor = stringToColor('white')
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
  })

  // Save icon set
  const iconSetContent = iconSet.export()
  await fs.writeFile(
    target,
    JSON.stringify(iconSetContent, null, '\t'),
    'utf8',
  )
})()
