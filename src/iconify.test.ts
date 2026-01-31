import path from 'node:path'

import { describe, expect, it } from 'vitest'

import { importSvgCollection, importSvgCollections } from './iconify'

const assetsPath = path.resolve(__dirname, 'assets')

function omitLastModified<T extends { lastModified?: number }>(obj: T): Omit<T, 'lastModified'> {
  const { lastModified: _, ...rest } = obj
  return rest
}

describe('importSvgCollection', () => {
  it('should import SVG collection', async () => {
    const result = await importSvgCollection({
      source: path.join(assetsPath, 'vender/line'),
    })

    expect(omitLastModified(result)).toMatchInlineSnapshot(`
      {
        "icons": {
          "alert-triangle": {
            "body": "<path fill="none" stroke="#f79009" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.25" d="M8 5.333V8m0 2.666h.006M6.86 1.906l-5.647 9.427a1.334 1.334 0 0 0 1.14 2h11.293a1.333 1.333 0 0 0 1.14-2L9.14 1.906a1.333 1.333 0 0 0-2.28 0"/>",
          },
          "arrow-narrow-left": {
            "body": "<path fill="none" stroke="#155eef" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.363 8H2.696m0 0l4 4m-4-4l4-4"/>",
            "width": 17,
          },
          "arrow-up-right": {
            "body": "<path fill="none" stroke="#667085" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.25" d="m4.083 9.917l5.834-5.834m0 0H4.083m5.834 0v5.834"/>",
            "height": 14,
            "width": 14,
          },
          "thumbs-down": {
            "body": "<g fill="none"><g clip-path="url(#svgID0)"><path stroke="#667085" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M11.333 1.334v7.333m3.334-2.133V3.467c0-.746 0-1.12-.146-1.405a1.33 1.33 0 0 0-.582-.583c-.286-.145-.659-.145-1.406-.145H5.412c-.974 0-1.462 0-1.855.178a2 2 0 0 0-.85.73c-.236.36-.31.842-.458 1.805L1.9 6.314c-.195 1.27-.293 1.905-.104 2.4a2 2 0 0 0 .88 1.025c.46.262 1.102.262 2.387.262H5.6c.373 0 .56 0 .703.072a.67.67 0 0 1 .291.292c.073.142.073.329.073.702v1.956c0 .908.736 1.644 1.644 1.644a.55.55 0 0 0 .5-.325l2.24-5.041c.103-.23.154-.344.234-.428a.7.7 0 0 1 .256-.166c.11-.04.235-.04.486-.04h.506c.747 0 1.12 0 1.406-.145c.25-.128.454-.332.582-.583c.146-.285.146-.658.146-1.405"/></g><defs><clipPath id="svgID0"><path fill="#fff" d="M0 0h16v16H0z"/></clipPath></defs></g>",
          },
        },
        "prefix": "line",
      }
    `)
  })

  it('should import SVG collection without subdirectories', async () => {
    const result = await importSvgCollection({
      source: path.join(assetsPath, 'vender'),
      includeSubDirs: false,
    })

    expect(omitLastModified(result)).toMatchInlineSnapshot(`
      {
        "icons": {
          "copy": {
            "body": "<path fill="none" stroke="#667085" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10.667 2.666H12A1.333 1.333 0 0 1 13.333 4v9.333A1.333 1.333 0 0 1 12 14.666H4a1.333 1.333 0 0 1-1.333-1.333V4A1.333 1.333 0 0 1 4 2.666h1.333M6 1.333h4c.368 0 .666.298.666.667v1.333A.667.667 0 0 1 10 4H6a.667.667 0 0 1-.667-.667V2c0-.369.299-.667.667-.667"/>",
          },
        },
        "prefix": "vender",
      }
    `)
  })
})

function omitLastModifiedFromCollections(
  collections: Record<string, { lastModified?: number }>,
): Record<string, Omit<typeof collections[string], 'lastModified'>> {
  return Object.fromEntries(
    Object.entries(collections).map(([key, value]) => [key, omitLastModified(value)]),
  )
}

describe('importSvgCollections', () => {
  it('should import nested directory structure as separate collections', async () => {
    const result = await importSvgCollections({
      source: assetsPath,
    })

    expect(omitLastModifiedFromCollections(result)).toMatchInlineSnapshot(`
      {
        "public-avatar": {
          "icons": {
            "user": {
              "body": "<g fill="none"><g clip-path="url(#svgID0)"><rect width="512" height="512" fill="#b2ddff" rx="256"/><circle cx="256" cy="196" r="84" fill="#fff" opacity=".68"/><ellipse cx="256" cy="583.5" fill="#fff" opacity=".68" rx="266" ry="274.5"/></g><defs><clipPath id="svgID0"><rect width="512" height="512" fill="#fff" rx="256"/></clipPath></defs></g>",
              "height": 512,
              "width": 512,
            },
          },
          "prefix": "public-avatar",
        },
        "vender": {
          "icons": {
            "copy": {
              "body": "<path fill="none" stroke="#667085" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10.667 2.666H12A1.333 1.333 0 0 1 13.333 4v9.333A1.333 1.333 0 0 1 12 14.666H4a1.333 1.333 0 0 1-1.333-1.333V4A1.333 1.333 0 0 1 4 2.666h1.333M6 1.333h4c.368 0 .666.298.666.667v1.333A.667.667 0 0 1 10 4H6a.667.667 0 0 1-.667-.667V2c0-.369.299-.667.667-.667"/>",
            },
          },
          "prefix": "vender",
        },
        "vender-line-alertsAndFeedback": {
          "icons": {
            "alert-triangle": {
              "body": "<path fill="none" stroke="#f79009" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.25" d="M8 5.333V8m0 2.666h.006M6.86 1.906l-5.647 9.427a1.334 1.334 0 0 0 1.14 2h11.293a1.333 1.333 0 0 0 1.14-2L9.14 1.906a1.333 1.333 0 0 0-2.28 0"/>",
            },
            "thumbs-down": {
              "body": "<g fill="none"><g clip-path="url(#svgID0)"><path stroke="#667085" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M11.333 1.334v7.333m3.334-2.133V3.467c0-.746 0-1.12-.146-1.405a1.33 1.33 0 0 0-.582-.583c-.286-.145-.659-.145-1.406-.145H5.412c-.974 0-1.462 0-1.855.178a2 2 0 0 0-.85.73c-.236.36-.31.842-.458 1.805L1.9 6.314c-.195 1.27-.293 1.905-.104 2.4a2 2 0 0 0 .88 1.025c.46.262 1.102.262 2.387.262H5.6c.373 0 .56 0 .703.072a.67.67 0 0 1 .291.292c.073.142.073.329.073.702v1.956c0 .908.736 1.644 1.644 1.644a.55.55 0 0 0 .5-.325l2.24-5.041c.103-.23.154-.344.234-.428a.7.7 0 0 1 .256-.166c.11-.04.235-.04.486-.04h.506c.747 0 1.12 0 1.406-.145c.25-.128.454-.332.582-.583c.146-.285.146-.658.146-1.405"/></g><defs><clipPath id="svgID0"><path fill="#fff" d="M0 0h16v16H0z"/></clipPath></defs></g>",
            },
          },
          "prefix": "vender-line-alertsAndFeedback",
        },
        "vender-line-arrows": {
          "icons": {
            "arrow-narrow-left": {
              "body": "<path fill="none" stroke="#155eef" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.363 8H2.696m0 0l4 4m-4-4l4-4"/>",
              "width": 17,
            },
            "arrow-up-right": {
              "body": "<path fill="none" stroke="#667085" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.25" d="m4.083 9.917l5.834-5.834m0 0H4.083m5.834 0v5.834"/>",
              "height": 14,
              "width": 14,
            },
          },
          "prefix": "vender-line-arrows",
        },
        "vender-pipeline": {
          "icons": {
            "input-field": {
              "body": "<g fill="#354052"><path fill-rule="evenodd" d="M11.333 1.667a.667.667 0 0 0-1.333 0v12.666a.667.667 0 1 0 1.333 0v-1h1.334a2 2 0 0 0 2-2V4.667a2 2 0 0 0-2-2h-1.334zM12.667 12h-1.334V4h1.334c.368 0 .666.298.666.667v6.666a.667.667 0 0 1-.666.667" clip-rule="evenodd"/><path d="M8.667 13.333V12H3.333a.667.667 0 0 1-.666-.667V4.667c0-.369.298-.667.666-.667h5.334V2.667H3.333a2 2 0 0 0-2 2v6.666a2 2 0 0 0 2 2z"/><path d="M8.667 5.249a1 1 0 0 0-.106-.004l-.046.002c-.53.02-1.028.267-1.363.68l-.572.708l-.138-.413a1.25 1.25 0 0 0-1.235-.847l-.726.028a.667.667 0 0 0 .052 1.333l.666-.026l.386 1.155l-1.108 1.37a.5.5 0 0 1-.377.186l-.047.002a.667.667 0 1 0 .052 1.332l.047-.002a1.84 1.84 0 0 0 1.362-.68l.573-.708l.138.413a1.25 1.25 0 0 0 1.257.846l1.185-.087V9.2l-1.2.088l-.386-1.153l1.108-1.37a.5.5 0 0 1 .377-.186l.047-.002l.054-.004z"/></g>",
            },
          },
          "prefix": "vender-pipeline",
        },
      }
    `)
  })
})
