import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/index.ts'],
  dts: true,
  format: ['cjs', 'esm'],
  publint: true,
  // attw: {
  //   profile: 'node16',
  // },
})
