<template>
  <UApp>
    <main class="flex justify-center items-center min-h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-black pb-20">
      <div class="w-full">
        <div class="absolute top-0 w-full flex items-center justify-between">
          <nuxt-link to="/" class="ml-4 text-2xl">FANTA KADENA</nuxt-link>
          <ConnectWallet/>
        </div>
        <slot />
      </div>
    </main>
  </UApp>
</template>

<script setup>
import ConnectWallet from "~/components/ConnectWallet.vue";
</script>

<style>
@keyframes fadeIn {
  0% { opacity: 0; transform: translateY(10px); }
  100% { opacity: 1; transform: translateY(0); }
}

.animate-fadeIn {
  animation: fadeIn 0.4s ease-out;
}
</style>
