<template>
  <div v-if="game.status.id === 'voting_result'" class="flex flex-col items-center mt-2 mb-6 bg-slate-800 rounded-xl p-4 shadow-md border-2 border-green-700">
    <p class="text-xl font-bold">Published Result:</p>
    <span class="text-lg font-semibold text-green-600">{{ game.options[game.correct] }}</span>

    <div v-if="generalError" class="flex justify-center mt-2">
      <p class="text-red-400 text-sm font-medium">{{ generalError }}</p>
    </div>

    <div v-if="alreadyVotedResult" class="flex flex-col items-center mt-2">
      <p class="text-xl font-bold">You Already Voted</p>
    </div>

    <div v-if="!alreadyVotedResult" class="flex items-center space-x-4 mt-3">
      <DefaultButton
          text="Accept"
          :scale="true"
          :value="true"
          background-color="bg-green-700"
          hover-color="hover:bg-green-600"
          :action="vote"
          :loading="votingYes"
          :disabled="votingYes || votingNo"
      />
      <DefaultButton
          text="Reject"
          :scale="true"
          :value="false"
          background-color="bg-red-700"
          hover-color="hover:bg-red-600"
          :action="vote"
          :loading="votingNo"
          :disabled="votingYes || votingNo"
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
  alreadyVotedResult: {
    type: Boolean,
    default: false,
    required: true,
  },
});

const settingsStore = useSettingsStore();

const votingYes = ref(false);

const votingNo = ref(false);

const generalError = ref('');

const vote = async (isRight) => {
  if (isRight) {
    votingYes.value = true;
    votingNo.value = false;
  } else {
    votingYes.value = false;
    votingNo.value = true;
  }

  try {
    const response = await $fetch('/api/games/votes/result/vote', {
      method: 'POST',
      body: {
        id: props.game.id,
        account: props.account,
        right: isRight,
        gasSettings: settingsStore.gas,
      },
    });

    if (response.ok) {
      emit('vote-success');
      useToast('Result voted successfully!', 'green');
    } else {
      generalError.value = response?.error?.message ?? 'Error during result vote.';
      useToast('Error during result vote', 'red');
    }
  } catch (error) {
    useToast('Error during result vote', 'red');
  } finally {
    votingYes.value = false;
    votingNo.value = false;
  }
}

const emit = defineEmits(['vote-success']);
</script>

<style scoped></style>
