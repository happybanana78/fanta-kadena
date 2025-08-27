<template>
  <div v-if="!loading && walletStore.connected" class="mt-[100px] flex justify-center items-center">
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
      <div v-if="!showOptions" class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
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

      <div
          v-if="showOptions"
          class="mb-8 space-y-4"
      >
        <div
            v-for="option in game.options"
            :key="option"
            class="flex items-center justify-between cursor-pointer bg-slate-800 text-white px-3 py-2 rounded-lg shadow-sm hover:shadow-md hover:scale-102 transition duration-150"
            @click="!voting ? selectedOption = option : null"
        >
          <span class="text-sm font-medium">{{ option }}</span>
          <UIcon
              v-if="selectedOption === option"
              name="ic:baseline-check-circle"
              class="size-5 text-green-600"
          />
        </div>

        <div v-if="generalError" class="flex justify-center mt-2">
          <p class="text-red-400 text-sm font-medium">{{ generalError }}</p>
        </div>
      </div>

      <!-- Action Buttons -->
      <div v-if="!showOptions" class="flex justify-end space-x-4">
        <DefaultButton
            text="Join Game"
            :scale="true"
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

      <div v-if="showOptions" class="flex justify-end space-x-4">
        <DefaultButton
            text="Vote"
            :scale="true"
            :disabled="!selectedOption || voting"
            :action="vote"
            :loading="voting"
        />
        <DefaultButton
            text="Back"
            :scale="true"
            background-color="bg-slate-500"
            hover-color="hover:bg-slate-400"
            :action="goBack"
            :disabled="voting"
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
import {useToast} from "~~/composables/useToast.js";
import {useWalletStore} from "~~/stores/wallet_store.js";

import DefaultButton from "~/components/form/buttons/DefaultButton.vue";
import PageLoader from "~/components/loaders/PageLoader.vue";

const route = useRoute();

const walletStore = useWalletStore();

const game = ref(null);

const loading = ref(true);

const voting = ref(false);

const showOptions = ref(false);

const selectedOption = ref(null);

const currentAccount = ref(null);

const generalError = ref('');

const vote = async () => {
  voting.value = true;

  try {
    const response = await $fetch('/api/game/vote', {
      method: 'POST',
      body: {
        account: currentAccount.value,
        option: selectedOption.value,
      },
    });

    if (response.ok) {
      useToast('Voted successfully!', 'green');
    } else {
      generalError.value = response?.error?.message ?? 'Error during vote.';
      useToast('Error during vote', 'red');
    }
  } catch (err) {
    useToast('Error during vote', 'red');
  } finally {
    voting.value = false;
    resetOptionState();
  }
}

const goBack = () => {
  resetOptionState();
}

const resetOptionState = () => {
  showOptions.value = false;
  selectedOption.value = null;
}

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
  currentAccount.value = walletStore.account;
  await loadGame();
});
</script>

<style scoped></style>
