<template>
  <div class="bg-slate-700/80 border border-slate-600 rounded-xl shadow-lg p-6 space-y-2 hover:shadow-xl transition duration-200">
    <h4 class="text-white text-lg font-semibold">{{ name || 'Game Name' }}</h4>
    <p class="text-slate-300 text-sm">{{ description || 'This is a placeholder description for the game.' }}</p>
    <div class="text-slate-400 text-sm">
      <p><span class="font-medium text-white">Expiration:</span> {{ expiration || 'YYYY-MM-DD' }}</p>
      <p><span class="font-medium text-white">Participation Fee:</span> {{ fee || '0.00' }} KDA</p>
      <p><span class="font-medium text-white">Status:</span> {{ status || 'Active' }}</p>
    </div>
    <div class="flex justify-end mt-3">
      <nuxt-link
          :to="`/games/${id}`"
          class="text-indigo-400 hover:text-indigo-300 text-sm font-semibold"
      >
        View Game
      </nuxt-link>
    </div>
  </div>
</template>

<script setup>
defineProps({
  id: {
    type: String,
  },
  name: {
    type: String,
  },
  description: {
    type: String,
  },
  expiration: {
    type: String,
  },
  fee: {
    type: String,
  },
  status: {
    type: String,
  },
});
</script>

<style scoped></style>
