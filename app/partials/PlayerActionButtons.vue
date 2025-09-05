<template>
  <div>
    <div v-if="generalError" class="flex justify-center mt-2 mb-6">
      <p class="text-red-400 text-sm font-medium">{{ generalError }}</p>
    </div>

    <div v-if="alreadyRefunded" class="flex flex-col items-center mt-2 mb-6">
      <p class="text-xl font-bold">You Already Claimed Your Refund</p>
    </div>

    <div class="flex justify-end space-x-4">
      <DefaultButton
          v-if="!alreadyVoted && !game.is_expired"
          text="Join Game"
          :scale="true"
          :action="() => emit('show-options')"
      />
      <DefaultButton
          v-if="(game.status.id === 'refunded_creator_no_publish' || game.status.id === 'refunded_no_quorum') && !alreadyRefunded"
          text="Claim Refund"
          :scale="true"
          background-color="bg-red-700"
          hover-color="hover:bg-red-600"
          :loading="refunding"
          :disabled="refunding"
          :action="claimRefund"
      />
      <DefaultButton
          v-if="game.status.id === 'ended' && isWinner"
          text="Claim Reward"
          :scale="true"
          background-color="bg-green-700"
          hover-color="hover:bg-green-600"
          :loading="rewarding"
          :disabled="rewarding"
          :action="claimReward"
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
import {useToast} from "~~/composables/useToast.js";
import {useSettingsStore} from "~~/stores/settings_store.js";

import DefaultButton from "~/components/form/buttons/DefaultButton.vue";

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
  alreadyVoted: {
    type: Boolean,
    required: true,
  },
  alreadyRefunded: {
    type: Boolean,
    required: true,
  },
  isWinner: {
    type: Boolean,
    required: true,
  },
});

const settingsStore = useSettingsStore();

const refunding = ref(false);

const rewarding = ref(false);

const generalError = ref('');

const claimRefund = async () => {
  refunding.value = true;

  try {
    const response = await $fetch('/api/games/claim-refund', {
      method: 'POST',
      body: {
        id: props.game.id,
        account: props.account,
        fee: props.game.fee,
        slashCreator: props.game.status.id === 'refunded_creator_no_publish',
        gasSettings: settingsStore.gas,
        checkForEnding: props.game.status.id === 'ended',
      },
    });

    if (response.ok) {
      emit('refund-claimed');
      useToast('Refund claimed successfully!', 'green');
    } else {
      generalError.value = response?.error?.message ?? 'Error during refund claim.';
      useToast('Error during refund claim', 'red');
    }
  } catch (error) {
    useToast('Error during refund claim', 'red');
  } finally {
    refunding.value = false;
  }
}

const claimReward = async () => {
  rewarding.value = true;

  try {
    const response = await $fetch('/api/games/claim-reward', {
      method: 'POST',
      body: {
        id: props.game.id,
        account: props.account,
        fee: props.game.fee,
        winners: props.game.total_winners,
        gasSettings: settingsStore.gas,
        checkForEnding: props.game.status.id === 'ended',
      },
    });

    if (response.ok) {
      emit('reward-claimed');
      useToast('Reward claimed successfully!', 'green');
    } else {
      generalError.value = response?.error?.message ?? 'Error during reward claim.';
      useToast('Error during reward claim', 'red');
    }
  } catch (error) {
    useToast('Error during reward claim', 'red');
  } finally {
    rewarding.value = false;
  }
}

const emit = defineEmits(['show-options', 'refund-claimed', 'reward-claimed']);
</script>

<style scoped></style>
