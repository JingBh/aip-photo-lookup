import packageMeta from './package.json'

export default {

  target: 'server',

  modern: true,

  // Global page headers (https://go.nuxtjs.dev/config-head)
  head: {
    title: process.env.title,
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: packageMeta.description }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  },

  // Global CSS (https://go.nuxtjs.dev/config-css)
  css: [
    'tippy.js/dist/tippy.css',
    'tippy.js/animations/scale.css',
    '~/assets/scss/app.scss'
  ],

  // Plugins to run before rendering page (https://go.nuxtjs.dev/config-plugins)
  plugins: [
  ],

  // Runtime config (https://nuxtjs.org/guide/runtime-config)
  publicRuntimeConfig: {
    title: process.env.PAGE_TITLE || packageMeta.name
  },

  serverMiddleware: [
    '~/lib/server'
  ],

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
    '@nuxtjs/axios',
    // https://auth.nuxtjs.org/
    '@nuxtjs/auth'
  ],

  router: {
    middleware: [
      'auth'
    ]
  },

  // Axios module configuration (https://go.nuxtjs.dev/config-axios)
  axios: {
    retry: { retries: 3 }
  },

  // Auth module configuration (https://auth.nuxtjs.org/api/options.html)
  auth: {
    strategies: {
      github: {
        client_id: process.env.GITHUB_ID,
        client_secret: process.env.GITHUB_SECRET,
        userinfo_endpoint: false,
        scope: ['read:user', 'user:email']
      }
    }
  },

  // BootstrapVue module configuration (https://bootstrap-vue.org/docs#nuxtjs-module)
  bootstrapVue: {
    bootstrapVue: {
      bootstrapCSS: false,
      bootstrapVueCSS: false
    },
    componentPlugins: [
      'AspectPlugin',
      'ButtonPlugin',
      'CardPlugin',
      'FormFilePlugin',
      'FormGroupPlugin',
      'IconsPlugin',
      'ImagePlugin',
      'LayoutPlugin',
      'LinkPlugin',
      'OverlayPlugin',
      'SpinnerPlugin'
    ]
  },

  // Build Configuration (https://go.nuxtjs.dev/config-build)
  build: {
  }
}
