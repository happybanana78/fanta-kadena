// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  runtimeConfig: {
    ENVIRONMENT: process.env.ENVIRONMENT || 'local',

    KADENA_NETWORK_ID: process.env.KADENA_NETWORK_ID || 'development',
    KADENA_CHAIN_ID: process.env.KADENA_CHAIN_ID || '1',
    KADENA_HOST: process.env.KADENA_HOST || 'http://localhost:8080/chainweb/0.0/development/chain/1/pact',
    MODULE_NAME: process.env.MODULE_NAME,

    GAS_PAYER_ACCOUNT: process.env.GAS_PAYER_ACCOUNT,
    GAS_PAYER_PUBKEY: process.env.GAS_PAYER_PUBKEY,

    public: {
      GAME_CREATOR_LOCK_AMOUNT: process.env.GAME_CREATOR_LOCK_AMOUNT || '10',
      PLAYER_REWARD_LOCK_TIME: process.env.PLAYER_REWARD_LOCK_TIME || '30',
      RESULT_VOTING_QUORUM: process.env.RESULT_VOTING_QUORUM || '80',
      GRACE_DAYS: process.env.GRACE_DAYS || '1',
    },
  },

  css: ['~/assets/css/main.css'],

  vite: {
    plugins: [
      tailwindcss(),
    ],
  },

  modules: ['@nuxt/ui', '@pinia/nuxt'],
});