import type { IconifyJSON } from '@iconify/types'

import type { CollectionNames } from '../types'
import { collectionNames } from '../types'
import type { GenerateOptions } from './core'
import { generateComponent, getIconCollections } from './core'

const cache = new Map<CollectionNames, IconifyJSON>()

function getIconCollection(name: CollectionNames) {
  const cached = cache.get(name)
  if (cached)
    return cached

  const collection = getIconCollections([name])[name]
  if (collection)
    cache.set(name, collection)
  return collection
}

export function getDynamicCSSRules(
  icon: string,
  options: GenerateOptions,
): Record<string, string> {
  const nameParts = icon.split(/--|:/)
  if (nameParts.length !== 2) {
    throw new Error(`Invalid icon name: "${icon}"`)
  }

  const prefix = nameParts[0]
  const name = nameParts[1]!
  if (!collectionNames.includes(prefix as CollectionNames)) {
    throw new Error(`Invalid collection name: "${prefix}"`)
  }

  const icons = getIconCollection(prefix as CollectionNames)

  const generated = generateComponent(
    {
      icons,
      name,
    },
    options,
  )
  if (!generated) {
    throw new Error(`Invalid icon name: "${icon}"`)
  }

  return generated
}
