<template>
  <div v-if="!loading" class="mt-[100px] flex justify-center items-center">
    <div v-if="game" class="w-full max-w-4xl rounded-2xl shadow-2xl bg-slate-700/80 backdrop-blur-md border border-slate-600 p-8 animate-fadeIn">
      <!-- Game Header -->
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-white text-3xl font-bold">{{ game.name }}</h1>
        <span
            class="px-3 py-1 rounded-lg text-sm font-semibold"
            :class="{
            'bg-green-600 text-white': game.status === 'Active',
            'bg-red-600 text-white': game.status === 'Ended',
            'bg-yellow-500 text-black': game.status === 'Pending'
          }"
        >
          {{ game.status }}
        </span>
      </div>

      <!-- Game Description -->
      <p class="text-slate-300 text-base mb-6">
        {{ game.description }}
      </p>

      <!-- Game Info Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div class="bg-slate-800 rounded-xl p-4 shadow-md">
          <h3 class="text-white font-semibold mb-2">Expiration</h3>
          <p class="text-slate-300">{{ game.expiration }}</p>
        </div>
        <div class="bg-slate-800 rounded-xl p-4 shadow-md">
          <h3 class="text-white font-semibold mb-2">Participation Fee</h3>
          <p class="text-slate-300">{{ game.fee }} KDA</p>
        </div>
        <div class="bg-slate-800 rounded-xl p-4 shadow-md">
          <h3 class="text-white font-semibold mb-2">Players</h3>
          <p class="text-slate-300">{{ game.total_voters }} joined</p>
        </div>
        <div class="bg-slate-800 rounded-xl p-4 shadow-md">
          <h3 class="text-white font-semibold mb-2">Created By</h3>
          <p
              class="text-slate-300 truncate text-ellipsis cursor-pointer"
              @click="useCopyToClipboard(game.creator_account)"
          >
            {{ game.creator_account }}
          </p>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex justify-end space-x-4">
        <DefaultButton
            text="Join Game"
            :scale="true"
        />
        <DefaultButton
            text="Back to Games"
            :scale="true"
            background-color="bg-slate-500"
            hover-color="hover:bg-slate-400"
            link="/"
        />
      </div>
    </div>

    <div v-else>
      <p class="text-slate-400 text-2xl">Game not found.</p>
      <DefaultButton
        text="Back to games"
        link="/"
        class="mt-2"
      />
    </div>
  </div>

  <PageLoader v-else/>
</template>

<script setup>
import DefaultButton from "~/components/form/buttons/DefaultButton.vue";
import PageLoader from "~/components/loaders/PageLoader.vue";
import {useCopyToClipboard} from "~~/composables/useCopyToClipboard.js";

const route = useRoute();

const game = ref(null);

const loading = ref(true);

const loadGame = async () => {
  try {
    const response = await $fetch('/api/game/single', {
      params: {
        id: route.params.id,
      }
    });

    if (response.ok) {
      game.value = response.data;
    }
  } catch (error) {
    console.log(error);
  } finally {
    loading.value = false;
  }
}

onMounted(async () => {
  await loadGame();
});

// const game = {
//   name: 'Space Explorer',
//   description: 'Embark on an intergalactic adventure and compete for rewards.',
//   expiration: '2025-12-31',
//   participationFee: '10.00',
//   status: 'Active',
//   players: ['Alice', 'Bob', 'Charlie'],
//   creator: 'GameMaster42'
// }
</script>

<style scoped></style>
