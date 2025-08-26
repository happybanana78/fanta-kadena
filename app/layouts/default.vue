<template>
  <UApp>
    <main class="flex justify-center items-center min-h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-black pb-20">
      <div class="w-full">
        <ConnectWallet/>
        <slot />
      </div>
    </main>
  </UApp>
</template>

<script setup>
import ConnectWallet from "~/components/ConnectWallet.vue";
</script>

<style></style>
