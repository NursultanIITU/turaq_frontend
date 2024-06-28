// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  css: ["@/assets/scss/global.scss"],
  runtimeConfig: {
    public: {
      apiUrl: process.env.API_URL,
    },
  },
  app: {
    head: {
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { name: "HandheldFriendly", content: "true" },
        { name: "MobileOptimized", content: "width" },
        { name: "apple-mobile-web-app-capable", content: "yes" },
      ],
      htmlAttrs: { dir: "ltr", lang: "ru" },
      // link: [{ rel: 'icon', type: 'image/png', href: "favicon.png" }]
    },
  },
  modules: [
    "@nuxtjs/i18n",
    "@pinia/nuxt",
    "vue-yandex-maps/nuxt",
    "@sidebase/nuxt-auth",
    "nuxt-gtag",
    "yandex-metrika-module-nuxt3",
    "@zadigetvoltaire/nuxt-gtm",
  ],
  yandexMetrika: {
    id: process.env.YANDEX_ID,
    webvisor: true,
    // consoleLog: true,
    clickmap: true,
    // useCDN: false,
    trackLinks: true,
    accurateTrackBounce: true,
  },
  gtag: {
    id: process.env.GOOGLE_ID,
  },
  gtm: {
    id: process.env.GOOGLE_GTM || "GTM-PTBWJHR8", // Your GTM single container ID, array of container ids ['GTM-xxxxxx', 'GTM-yyyyyy'] or array of objects [{id: 'GTM-xxxxxx', queryParams: { gtm_auth: 'abc123', gtm_preview: 'env-4', gtm_cookies_win: 'x'}}, {id: 'GTM-yyyyyy', queryParams: {gtm_auth: 'abc234', gtm_preview: 'env-5', gtm_cookies_win: 'x'}}], // Your GTM single container ID or array of container ids ['GTM-xxxxxx', 'GTM-yyyyyy']
    // queryParams: {
    //   // Add URL query string when loading gtm.js with GTM ID (required when using custom environments)
    //   gtm_auth: 'AB7cDEf3GHIjkl-MnOP8qr',
    //   gtm_preview: 'env-4',
    //   gtm_cookies_win: 'x',
    // },
    // defer: false, // Script can be set to `defer` to speed up page load at the cost of less accurate results (in case visitor leaves before script is loaded, which is unlikely but possible). Defaults to false, so the script is loaded `async` by default
    // compatibility: false, // Will add `async` and `defer` to the script tag to not block requests for old browsers that do not support `async`
    // nonce: '2726c7f26c', // Will add `nonce` to the script tag
    // enabled: true, // defaults to true. Plugin can be disabled by setting this to false for Ex: enabled: !!GDPR_Cookie (optional)
    // debug: true, // Whether or not display console logs debugs (optional)
    // loadScript: true, // Whether or not to load the GTM Script (Helpful if you are including GTM manually, but need the dataLayer functionality in your components) (optional)
    // enableRouterSync: true, // Pass the router instance of your app to automatically sync with router (optional)
    // ignoredViews: ['homepage'], // Don't trigger events for specified router names (optional)
    // trackOnNextTick: false, // Whether or not call trackView in Vue.nextTick
    // devtools: true, // (optional)
  },
  yandexMaps: {
    apikey: "3e257536-e664-4050-ad1d-44b011d2781c",
    servicesApikeys: {
      suggest: "668396eb-b589-4b9a-9d99-c90c16e79cad",
    },
  },
  i18n: {
    defaultLocale: "ru",
    locales: [
      { code: "ru", name: "Русский", file: "lang/i18n.js" },
      { code: "kk", name: "Қазақша", file: "lang/i18n.js" },
    ],
    // locales: [
    //   { code: "ru", name: "Ru", file: 'i18n.js' },
    // ],
    // lazy: true,
    // langDir: 'lang',
  },
  build: {
    transpile: ["vuetify"],
  },
  pinia: {
    storesDirs: ["./stores/**", "./custom-folder/stores/**"],
  },
  imports: {
    dirs: [
      "composables",
      "composables/*/index.{ts,js,mjs,mts}",
      "composables/**",
    ],
  },
  auth: {
    baseURL: process.env.API_URL,
    provider: {
      type: "local",
      endpoints: {
        signIn: { path: "/auth/verify-code", method: "post" },
        signOut: { path: "/logout", method: "post" },
        signUp: { path: "/register", method: "post" },
        getSession: { path: "/profile", method: "get" },
      },
      token: {
        signInResponseTokenPointer: "/access_token",
        type: "Bearer",
        headerName: "Authorization",
      },
    },
  },

  devtools: { enabled: false },
  ssr: false,
});
