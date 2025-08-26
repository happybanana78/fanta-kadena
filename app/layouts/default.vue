<template>
  <UApp>
    <main class="bg-slate-900 w-full h-screen mb-20">
      <ConnectWallet/>
      <slot />
    </main>
  </UApp>
</template>

<script setup>
import ConnectWallet from "~/components/ConnectWallet.vue";
</script>
