<template>
  <div>
    <div class="mb-8 space-y-4">
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

    <div class="flex justify-end space-x-4">
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
</template>

<script setup>
import DefaultButton from "~/components/form/buttons/DefaultButton.vue";
import {useToast} from "~~/composables/useToast.js";

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

const voting = ref(false);

const selectedOption = ref(null);

const generalError = ref('');

const goBack = () => {
  resetOptionState();
}

const resetOptionState = () => {
  selectedOption.value = null;
  generalError.value = '';
  emit('toggle-options');
}

const vote = async () => {
  voting.value = true;

  try {
    const response = await $fetch('/api/games/votes/vote', {
      method: 'POST',
      body: {
        id: props.game.id,
        account: props.account,
        option: props.game.options.indexOf(selectedOption.value),
        fee: props.game.fee,
      },
    });

    if (response.ok) {
      resetOptionState();
      useToast('Voted successfully!', 'green');
    } else {
      generalError.value = response?.error?.message ?? 'Error during vote.';
      useToast('Error during vote', 'red');
    }
  } catch (error) {
    console.log(error);
    useToast('Error during vote', 'red');
  } finally {
    voting.value = false;
  }
}

const emit = defineEmits(['toggle-options']);
</script>

<style scoped></style>
