// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    devtools         : {enabled: true},
    extends          : ['@nuxt/ui-pro'],
    modules          : ["@nuxt/ui"],
    compatibilityDate: "2024-09-18",

    runtimeConfig: {
        public: {
            assetUrl: process.env.NUXT_ASSET_URL
        }
    }
})