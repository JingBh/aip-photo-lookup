import packageMeta from './package.json'

export default {
  // Global page headers (https://go.nuxtjs.dev/config-head)
  head: {
    title: process.env.title,
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: process.env.description }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  },

  // Global CSS (https://go.nuxtjs.dev/config-css)
  css: [
    '~/assets/scss/app.scss'
  ],

  // Plugins to run before rendering page (https://go.nuxtjs.dev/config-plugins)
  plugins: [
  ],

  env: {
    title: process.env.PAGE_TITLE || packageMeta.name,
    description: process.env.PAGE_DESCRIPTION || packageMeta.description
  },

  // Auto import components (https://go.nuxtjs.dev/config-components)
  components: true,

  // Modules for dev and build (recommended) (https://go.nuxtjs.dev/config-modules)
  buildModules: [
    // https://go.nuxtjs.dev/typescript
    '@nuxt/typescript-build'
  ],

  // Modules (https://go.nuxtjs.dev/config-modules)
  modules: [
    // https://go.nuxtjs.dev/bootstrap
    'bootstrap-vue/nuxt',
    // https://go.nuxtjs.dev/axios
    '@nuxtjs/axios'
  ],

  // Axios module configuration (https://go.nuxtjs.dev/config-axios)
  axios: {},

  // BootstrapVue module configuration (https://bootstrap-vue.org/docs#nuxtjs-module)
  bootstrapVue: {
    bootstrapVue: {
      bootstrapCSS: false,
      bootstrapVueCSS: false
    },
    componentPlugins: [
      'AspectPlugin',
      'ButtonPlugin',
      'FormFilePlugin',
      'FormGroupPlugin',
      'ImagePlugin',
      'LayoutPlugin'
    ]
  },

  // Build Configuration (https://go.nuxtjs.dev/config-build)
  build: {
  }
}
