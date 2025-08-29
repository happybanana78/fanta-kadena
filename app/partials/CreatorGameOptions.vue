<template>
  <div>
    <div class="mb-8 space-y-4">
      <div
          v-for="option in game.options"
          :key="option"
          class="flex items-center justify-between cursor-pointer bg-slate-800 text-white px-3 py-2 rounded-lg shadow-sm hover:shadow-md hover:scale-102 transition duration-150"
          @click="!submittingResult ? selectedOption = option : null"
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
          text="Submit Result"
          :scale="true"
          :disabled="!selectedOption || submittingResult"
          :action="submitResult"
          :loading="submittingResult"
          background-color="bg-green-700"
          hover-color="hover:bg-green-600"
      />
      <DefaultButton
          text="Back"
          :scale="true"
          background-color="bg-slate-500"
          hover-color="hover:bg-slate-400"
          :action="goBack"
          :disabled="submittingResult"
      />
    </div>
  </div>
</template>

<script setup>
import DefaultButton from "~/components/form/buttons/DefaultButton.vue";
import {useToast} from "~~/composables/useToast.js";
import {useSettingsStore} from "~~/stores/settings_store.js";

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

const settingsStore = useSettingsStore();

const submittingResult = ref(false);

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

const submitResult = async () => {
  submittingResult.value = true;

  try {
    const response = await $fetch('/api/games/submit-result', {
      method: 'POST',
      body: {
        id: props.game.id,
        account: props.account,
        option: props.game.options.indexOf(selectedOption.value),
        gasSettings: settingsStore.gas,
      },
    });

    if (response.ok) {
      resetOptionState();
      useToast('Submitted successfully!', 'green');
    } else {
      generalError.value = response?.error?.message ?? 'Error during result submission.';
      useToast('Error during result submission', 'red');
    }
  } catch (error) {
    useToast('Error during result submission', 'red');
  } finally {
    submittingResult.value = false;
  }
}

const emit = defineEmits(['toggle-options']);
</script>

<style scoped></style>
