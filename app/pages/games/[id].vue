<template>
  <div v-if="!loading && walletStore.connected" class="mt-[100px] flex justify-center items-center">
    <div v-if="game" class="w-full max-w-4xl rounded-2xl shadow-2xl bg-slate-700/80 backdrop-blur-md border border-slate-600 p-8 animate-fadeIn">
      <!-- Game Header -->
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-white text-3xl font-bold">{{ game.name }}</h1>
        <div class="flex items-center space-x-4">
          <Timer
              v-if="game.status.id === 'pending_result'"
              text="Result publish:"
              :target-date="game.publish_expiration"
              class="text-lg font-semibold"
          />
          <Timer
              v-if="game.status.id === 'voting_result'"
              text="Time left to vote:"
              :target-date="game.result_voting_expiration"
              class="text-lg font-semibold"
          />
          <span
              class="px-3 py-1 rounded-lg text-sm font-semibold"
              :class="{
                'bg-green-700 text-white': game.status.id === 'active' || game.status.id === 'ended',
                'bg-red-700 text-white': game.status.id === 'refunded_no_players' || game.status.id === 'refunded_quorum_not_reached' || game.status.id === 'refunded_creator_no_publish',
                'bg-yellow-600 text-black': game.status.id === 'voting_result' || game.status.id === 'pending_result',
              }"
          >
          {{ game.status.name }}
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
          <p class="text-slate-300">{{ useParseDate({date: game.expiration}) }}</p>
          <Timer
              v-if="game.status.id === 'active'"
              text="Time left:"
              :target-date="game.expiration"
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
          v-if="showOptions && game.status.id === 'pending_result' && game.creator_account === currentAccount"
          :game="game"
          :account="currentAccount"
          @toggle-options="showOptions = false"
      />

      <PlayerGameOptions
          v-if="showOptions && game.status.id === 'active' && game.creator_account !== currentAccount"
          :game="game"
          :account="currentAccount"
          @toggle-options="showOptions = false"
          @vote-success="alreadyVoted = true"
      />

      <div v-if="alreadyVoted && game.status.id === 'active'" class="flex flex-col items-center mt-2 mb-6">
        <p class="text-xl font-bold">You Already Voted For This Game</p>
      </div>

      <ResultVoteCard
          :game="game"
          :account="currentAccount"
          :already-voted-result="alreadyVotedResult"
          @vote-success="init"
      />

      <!-- Action Buttons -->
      <PlayerActionButtons
          v-if="!showOptions && game.creator_account !== currentAccount"
          :game="game"
          :account="currentAccount"
          :already-voted="alreadyVoted"
          @show-options="showOptions = true"
      />

      <CreatorActionButtons
          v-if="!showOptions && game.creator_account === currentAccount"
          :game="game"
          :account="currentAccount"
          @show-options="init"
      />
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
import PlayerActionButtons from "~/partials/PlayerActionButtons.vue";
import CreatorActionButtons from "~/partials/CreatorActionButtons.vue";
import ResultVoteCard from "~/partials/ResultVoteCard.vue";

const route = useRoute();

const walletStore = useWalletStore();

const game = ref(null);

const mounting = ref(true);

const loading = ref(true);

const showOptions = ref(false);

const currentAccount = ref(null);

const alreadyVoted = ref(false);

const alreadyVotedResult = ref(false);

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
        session_id: route.params.id,
      }
    });

    if (response.ok) {
      alreadyVoted.value = true;
    }
  } catch (error) {
    console.log(error);
  }
}

const loadResultVote = async () => {
  try {
    const response = await $fetch('/api/games/votes/result/single', {
      params: {
        account: currentAccount.value,
        session_id: route.params.id,
      }
    });

    if (response.ok) {
      alreadyVotedResult.value = true;
    }
  } catch (error) {
    console.log(error);
  }
}

const init = async () => {
  loading.value = true;
  showOptions.value = false;

  await loadGame();

  currentAccount.value = walletStore.account;
  alreadyVoted.value = false;
  alreadyVotedResult.value = false;

  if (game.value.creator_account !== currentAccount.value) {
    await loadVote();
    await loadResultVote();
  }

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
