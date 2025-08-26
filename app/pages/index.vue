<template>
  <div v-if="walletStore.connected" class="flex justify-center items-center">
    <div class="w-full max-w-xl rounded-2xl shadow-2xl bg-slate-700/80 backdrop-blur-md border border-slate-600 p-8 animate-fadeIn">
      <h2 class="text-white text-2xl font-bold mb-4 text-center">Create a New Game</h2>
      <hr class="border-slate-600 mb-6" />
      <div class="flex justify-center">
        <nuxt-link
            class="flex items-center space-x-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-5 py-3 rounded-xl shadow-md transition-all ease-out duration-200 hover:scale-105"
            to="/new"
        >
          <UIcon name="ic:baseline-add-circle-outline" class="size-6" />
          <span>New Game</span>
        </nuxt-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import {useWalletStore} from "~~/stores/wallet_store.js";

const walletStore = useWalletStore();
</script>

<style scoped></style>
