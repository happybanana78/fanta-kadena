<template>
  <div>
    <div v-if="generalError" class="flex justify-center mt-2 mb-6">
      <p class="text-red-400 text-sm font-medium">{{ generalError }}</p>
    </div>

    <div v-if="game.creator_refunded" class="flex flex-col items-center mt-2 mb-6">
      <p class="text-xl font-bold">You Already Unlocked Your Funds</p>
    </div>

    <div class="flex justify-end space-x-4">
      <DefaultButton
          v-if="game.status.id === 'pending_result'"
          text="Publish Result"
          :scale="true"
          background-color="bg-green-700"
          hover-color="hover:bg-green-600"
          :disabled="game.status.id === 'voting_result'"
          :action="() => emit('show-options')"
      />
      <DefaultButton
          v-if="(game.status.id === 'refunded_no_players' || game.status.id === 'refunded_no_quorum' || game.status.id === 'ended') && !game.creator_refunded"
          text="Unlock Funds"
          :scale="true"
          background-color="bg-red-700"
          hover-color="hover:bg-red-600"
          :loading="unlocking"
          :disabled="unlocking"
          :action="unlockFunds"
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
</template>

<script setup>
import {useSettingsStore} from "~~/stores/settings_store.js";
import {useToast} from "~~/composables/useToast.js";

import DefaultButton from "~/components/form/buttons/DefaultButton.vue";

const settingsStore = useSettingsStore();

const props = defineProps({
  game: {
    type: Object,
    default: {},
    required: true,
  },
  account: {
    type: String,
    default: '',
    required: true,
  },
});

const unlocking = ref(false);

const generalError = ref('');

const unlockFunds = async () => {
  unlocking.value = true;

  try {
    const response = await $fetch('/api/games/creator-unlock', {
      method: 'POST',
      body: {
        id: props.game.id,
        account: props.account,
        gasSettings: settingsStore.gas,
        checkForEnding: props.game.status.id === 'ended',
      },
    });

    if (response.ok) {
      emit('funds-unlocked');
      useToast('Funds unlocked successfully!', 'green');
    } else {
      generalError.value = response?.error?.message ?? 'Error during funds unlock.';
      useToast('Error during funds unlock', 'red');
    }
  } catch (error) {
    useToast('Error during funds unlock', 'red');
  } finally {
    unlocking.value = false;
  }
}

const emit = defineEmits(['show-options', 'funds-unlocked']);
</script>

<style scoped></style>
