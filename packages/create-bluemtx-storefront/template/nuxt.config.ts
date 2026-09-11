export default defineNuxtConfig({
  compatibilityDate: '2026-09-10',
  runtimeConfig: {
    public: {
      commerceBaseUrl: process.env.NUXT_PUBLIC_COMMERCE_BASE_URL || '',
      storeSlug: process.env.NUXT_PUBLIC_STORE_SLUG || '',
    },
  },
})
