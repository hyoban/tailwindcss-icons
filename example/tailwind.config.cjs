const {
  iconsPlugin,
  dynamicIconsPlugin,
  getIconCollections,
} = require('../dist/index.mjs')

module.exports = {
  content: ['./index.html'],
  plugins: [
    iconsPlugin({
      scale: 10,
      strokeWidth: 1,
      collections: getIconCollections(['lucide', 'tabler']),
    }),
    dynamicIconsPlugin({ scale: 10 }),
  ],
}
