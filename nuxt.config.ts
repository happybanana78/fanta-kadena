// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  runtimeConfig: {
    KADENA_NETWORK_ID: process.env.KADENA_NETWORK_ID,
    KADENA_CHAIN_ID: process.env.KADENA_CHAIN_ID,
    KADENA_HOST: process.env.KADENA_HOST,

    GAS_PAYER_ACCOUNT: process.env.GAS_PAYER_ACCOUNT,
    GAS_PAYER_PUBKEY: process.env.GAS_PAYER_PUBKEY,
    GAS_PAYER_PRIVKEY: process.env.GAS_PAYER_PRIVKEY,
  },

  css: ['~/assets/css/main.css'],

  vite: {
    plugins: [
      tailwindcss(),
    ],
  },

  modules: [
    '@nuxt/ui',
  ],
});