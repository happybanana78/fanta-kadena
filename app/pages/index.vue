<template>
  <div v-if="walletStore.connected && !loading" class="flex flex-col justify-center items-center space-y-8 animate-fadeIn">
    <!-- New Game Card -->
    <div class="w-full max-w-xl rounded-2xl shadow-2xl bg-slate-700/80 backdrop-blur-md border border-slate-600 p-8">
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

    <!-- Active Games List -->
    <div class="w-full max-w-4xl space-y-4">
      <h3 class="text-white text-xl font-semibold mb-4">Active Games</h3>
      <div v-if="games.length > 0" class="grid md:grid-cols-2 gap-6">
        <GameCard
            v-for="game in games"
            :key="game.id"
            :id="game.id"
            :name="game.name"
            :description="game.description"
            :expiration="game.expiration"
            :fee="game.fee"
            :status="game.status.name"
        />
      </div>
      <p v-else class="text-slate-400 text-sm">No active games found.</p>
    </div>
  </div>

  <PageLoader v-else/>
</template>

<script setup>
import GameCard from "~/components/cards/GameCard.vue";
import {useWalletStore} from "~~/stores/wallet_store.js";
import PageLoader from "~/components/loaders/PageLoader.vue";

const walletStore = useWalletStore();

const games = ref([]);

const loading = ref(true);

const loadGames = async () => {
  try {
    const response = await $fetch('/api/games/load', {
      params: {
        expired: true,
      }
    });

    if (response.ok) {
      games.value = response.data;
    }
  } catch (error) {
    console.log(error);
  } finally {
    loading.value = false;
  }
}

onMounted(async () => {
  await loadGames();
});
</script>

<style scoped></style>
