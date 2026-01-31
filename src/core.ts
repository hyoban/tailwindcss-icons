import fs from "fs"
import { createRequire } from "module"
import path from "path"
import { getIconCSS, getIconData } from "@iconify/utils"

import { callerPath } from "./utils"

import type { CollectionNames } from "../types"
import type { IconifyIcon, IconifyJSON } from "@iconify/types"

export type GenerateOptions = {
  /**
   * Scale relative to the current font size (1em).
   *
   * @default 1
   */
  scale?: number
  /**
   * Extra CSS properties applied to the generated CSS.
   *
   * @default `{}`
   */
  extraProperties?: Record<string, string>

  /**
   * Stroke width applied to the generated CSS.
   *
   * @default `undefined`
   */
  strokeWidth?: number

  /**
   * Default size unit
   *
   * @default em
   */
  sizeUnit?: string
}

declare const TSUP_FORMAT: "esm" | "cjs"
const req =
  typeof TSUP_FORMAT === "undefined" || TSUP_FORMAT === "cjs"
    ? require
    : createRequire(import.meta.url)

export const localResolve = (cwd: string, id: string) => {
  try {
    const resolved = req.resolve(id, { paths: [cwd] })
    return resolved
  } catch {
    return null
  }
}

export const isPackageExists = (id: string) => {
  const p = callerPath()
  const cwd = p ? path.dirname(p) : process.cwd()
  return Boolean(localResolve(cwd, id))
}

export function getIconCollections<T extends CollectionNames>(
  include: T[] | "all",
): Record<T, IconifyJSON> | Record<string, never> {
  const p = callerPath()
  const cwd = p ? path.dirname(p) : process.cwd()

  const pkgPath = localResolve(cwd, "@iconify/json/package.json")
  if (!pkgPath) {
    if (Array.isArray(include)) {
      return include.reduce(
        (result, name) => {
          const jsonPath = localResolve(cwd, `@iconify-json/${name}/icons.json`)
          if (!jsonPath) {
            throw new Error(
              `Icon collection "${name}" not found. Please install @iconify-json/${name} or @iconify/json`,
            )
          }
          return {
            ...result,
            [name]: req(jsonPath),
          }
        },
        {} as Record<T, IconifyJSON>,
      )
    }
    return {} as Record<string, never>
  }
  const pkgDir = path.dirname(pkgPath)
  const files = fs.readdirSync(path.join(pkgDir, "json"))
  const collections: Record<string, IconifyJSON> = {}
  for (const file of files) {
    if (
      include === "all" ||
      (include as string[]).includes(file.replace(".json", ""))
    ) {
      const json: IconifyJSON = req(path.join(pkgDir, "json", file))
      collections[json.prefix] = json
    }
  }
  return collections
}

export const generateIconComponent = (
  data: IconifyIcon,
  options: GenerateOptions,
) => {
  if (options.strokeWidth) {
    const strokeWidthRegex = /stroke-width="\d+"/g
    const match = data.body.match(strokeWidthRegex)
    const noStrokeWidth = !match
    const isAllStrokeWidthAreEqual =
      match && match.every((strokeWidth) => strokeWidth === match[0])
    if (isAllStrokeWidthAreEqual) {
      data.body = data.body.replace(
        strokeWidthRegex,
        `stroke-width="${options.strokeWidth}"`,
      )
    }
    if (noStrokeWidth) {
      data.body = `<g stroke-width="${options.strokeWidth}">${data.body}</g>`
    }
  }

  const css = getIconCSS(data, {})
  const rules: Record<string, string> = {}
  const sizeUnit: string = options.sizeUnit || 'em'
  css.replace(/^\s+([^:]+):\s*(.+);$/gm, (_, prop, value) => {
    if (prop === "width" || prop === "height") {
      rules[prop] = `${options.scale}${sizeUnit}`
    } else {
      rules[prop] = value
    }
    return ""
  })
  if (options.extraProperties) {
    Object.assign(rules, options.extraProperties)
  }
  return rules
}

export const generateComponent = (
  {
    name,
    icons,
  }: {
    name: string
    icons: IconifyJSON
  },
  options: GenerateOptions,
) => {
  const data = getIconData(icons, name)
  if (!data) return null
  return generateIconComponent(data, options)
}
