<template>
  <div v-if="!loading && walletStore.connected" class="mt-[100px] flex justify-center items-center">
    <div v-if="game" class="w-full max-w-4xl rounded-2xl shadow-2xl bg-slate-700/80 backdrop-blur-md border border-slate-600 p-8 animate-fadeIn">
      <!-- Game Header -->
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-white text-3xl font-bold">{{ game.name }}</h1>
        <div class="flex items-center space-x-4">
          <Timer
              v-if="game.is_expired"
              text="Result publish:"
              :target-date="game.publish_expiration"
              class="text-lg font-semibold"
          />
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
      </div>

      <!-- Game Description -->
      <p class="text-slate-300 text-base mb-6">
        {{ game.description }}
      </p>

      <!-- Game Info Grid -->
      <div v-if="!showOptions" class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div class="bg-slate-800 rounded-xl p-4 shadow-md">
          <h3 class="text-white font-semibold mb-2">Voting Expiration</h3>
          <p class="text-slate-300">{{ useParseDate(game.expiration, false) }}</p>
          <Timer
              v-if="new Date() < new Date(game.expiration)"
              text="Time left:"
              :target-date="new Date(game.expiration).toString()"
              text-class="text-white"
              countdown-class="text-green-600"
          />
          <p v-else>Time left: <span class="text-green-600">voting ended</span></p>
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

      <CreatorGameOptions
          v-if="showOptions && game.is_expired && game.creator_account === currentAccount"
          :game="game"
          :account="currentAccount"
          @toggle-options="showOptions = false"
      />

      <PlayerGameOptions
          v-if="showOptions && !game.is_expired && game.creator_account !== currentAccount"
          :game="game"
          :account="currentAccount"
          @toggle-options="showOptions = false"
      />

      <div v-if="alreadyVoted" class="flex flex-col items-center mt-2 mb-6">
        <p class="text-xl font-bold">You Already Voted For This Game</p>
      </div>

      <!-- Action Buttons -->
      <div v-if="!showOptions" class="flex justify-end space-x-4">
        <DefaultButton
            v-if="!alreadyVoted && !game.is_expired"
            text="Join Game"
            :scale="true"
            :action="() => showOptions = true"
        />
        <DefaultButton
            v-if="game.is_expired && game.creator_account === currentAccount"
            text="Publish Result"
            :scale="true"
            background-color="bg-green-700"
            hover-color="hover:bg-green-600"
            :action="() => showOptions = true"
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
import {useCopyToClipboard} from "~~/composables/useCopyToClipboard.js";
import {useWalletStore} from "~~/stores/wallet_store.js";
import Timer from "~/components/Timer.vue";
import {useParseDate} from "~~/composables/useParseDate.js";

import DefaultButton from "~/components/form/buttons/DefaultButton.vue";
import PageLoader from "~/components/loaders/PageLoader.vue";
import CreatorGameOptions from "~/partials/CreatorGameOptions.vue";
import PlayerGameOptions from "~/partials/PlayerGameOptions.vue";

const route = useRoute();

const walletStore = useWalletStore();

const game = ref(null);

const mounting = ref(true);

const loading = ref(true);

const showOptions = ref(false);

const currentAccount = ref(null);

const alreadyVoted = ref(false);

const loadGame = async () => {
  try {
    const response = await $fetch('/api/games/single', {
      params: {
        id: route.params.id,
      }
    });

    if (response.ok) {
      game.value = response.data;
    }
  } catch (error) {
    console.log(error);
  }
}

const loadVote = async () => {
  try {
    const response = await $fetch('/api/games/votes/single', {
      params: {
        account: currentAccount.value,
      }
    });

    if (response.ok) {
      alreadyVoted.value = true;
    }
  } catch (error) {
    console.log(error);
  }
}

const init = async () => {
  loading.value = true;

  await loadGame();

  currentAccount.value = walletStore.account;
  alreadyVoted.value = false;

  await loadVote();

  loading.value = false;
}

watch(() => walletStore.connected, async (newValue) => {
  if (!mounting.value && newValue) {
    await init();
  }
});

onMounted(async () => {
  await init();
  mounting.value = false;
});
</script>

<style scoped></style>
