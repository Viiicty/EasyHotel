import { createReactNavigationPlugin } from '@tarojs/plugin-platform-react'

const config = {
  plugins: [
    createReactNavigationPlugin({
      autoBuildNav: true
    })
  ]
}

module.exports = config
