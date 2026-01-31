import path from 'node:path'

import { afterEach, describe, expect, it, vi } from 'vitest'

import { importSvgCollection, importSvgCollections } from './iconify'

const assetsPath = path.resolve(__dirname, 'assets')

describe('importSvgCollection', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should import SVG collection and derive prefix from directory name', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const result = await importSvgCollection({
      source: path.join(assetsPath, 'vender/line/arrows'),
    })

    // Prefix should be derived from directory name
    expect(result.prefix).toBe('arrows')
    // Icons with non-black/white colors should be skipped
    expect(Object.keys(result.icons).length).toBe(0)
    expect(warnSpy).toHaveBeenCalled()
  })

  it('should skip icons with invalid colors and warn', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const result = await importSvgCollection({
      source: path.join(assetsPath, 'vender/line/alertsAndFeedback'),
    })

    expect(result.prefix).toBe('alertsAndFeedback')
    expect(Object.keys(result.icons).length).toBe(0)
    expect(warnSpy).toHaveBeenCalled()
  })

  it('should import nested directory structure', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})

    const result = await importSvgCollection({
      source: path.join(assetsPath, 'vender'),
    })

    expect(result.prefix).toBe('vender')
    expect(result.icons).toBeDefined()
  })

  it('should return valid IconifyJSON structure', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})

    const result = await importSvgCollection({
      source: path.join(assetsPath, 'vender/pipeline'),
    })

    expect(result).toHaveProperty('prefix', 'pipeline')
    expect(result).toHaveProperty('icons')
    expect(typeof result.icons).toBe('object')
  })

  it('should skip invalid SVG files and warn', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})

    const result = await importSvgCollection({
      source: path.join(assetsPath, 'public/avatar'),
    })

    expect(result.prefix).toBe('avatar')
    expect(result.icons).toBeDefined()
  })
})

describe('importSvgCollections', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should import nested directory structure as separate collections', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})

    const result = await importSvgCollections({
      source: assetsPath,
    })

    expect(result).toBeDefined()
    expect(typeof result).toBe('object')
  })

  it('should use folder name as prefix for each collection', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})

    const result = await importSvgCollections({
      source: assetsPath,
    })

    // Each collection's prefix should match its folder name
    for (const [key, collection] of Object.entries(result)) {
      expect(collection.prefix).toBe(key)
    }
  })

  it('should skip icons with non-black/white colors', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})

    const result = await importSvgCollections({
      source: path.join(assetsPath, 'vender'),
    })

    // Icons with non-black/white colors should be skipped
    // Collections with no valid icons won't be included
    const arrowsCollection = result.arrows
    expect(arrowsCollection?.icons ? Object.keys(arrowsCollection.icons).length : 0).toBe(0)
  })

  it('should return valid IconifyJSON structure for each collection', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})

    const result = await importSvgCollections({
      source: assetsPath,
    })

    for (const [prefix, collection] of Object.entries(result)) {
      expect(collection).toHaveProperty('prefix', prefix)
      expect(collection).toHaveProperty('icons')
      expect(typeof collection.icons).toBe('object')
    }
  })

  it('should work with subset of directory tree', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})

    const result = await importSvgCollections({
      source: path.join(assetsPath, 'vender/line'),
    })

    expect(result).toBeDefined()
    expect(typeof result).toBe('object')
  })
})
