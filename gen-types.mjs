// @ts-check
import fs from 'node:fs'
import { createRequire } from 'node:module'

const req = createRequire(import.meta.url)
const collections = req('@iconify/json/collections.json')

fs.writeFileSync(
  'types.ts',
  `export const collectionNames = [
  ${Object.keys(collections)
    .sort()
    .map(v => JSON.stringify(v))
    .join(', ')}
] as const
/** All the available icon collections when you have \`@iconify/json\` installed  */
export type CollectionNames = typeof collectionNames[number]
`,
)
