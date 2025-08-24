<template>
  <div v-if="isWallet" class="mt-[300px] flex justify-center items-center">
    <div class="w-[600px] rounded-lg border-white bg-slate-700 p-5">
      <h2 class="text-white text-xl">Create new game</h2>
      <hr/>
      <div class="flex justify-center">
        <nuxt-link
            class="flex items-center space-x-4 mt-6 bg-white text-slate-900 p-2 rounded-lg hover:bg-slate-300 transition-all ease-in duration-200"
            to="/new"
        >
          New Game
        </nuxt-link>
      </div>
    </div>
  </div>
</template>

<script setup>
const isWallet = ref(true);
</script>
