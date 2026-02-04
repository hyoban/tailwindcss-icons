import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/index.ts', 'src/iconify.ts'],
  dts: true,
  publint: true,
  // attw: {
  //   profile: 'node16',
  // },
})
