<template>
  <div v-if="walletStore.connected" class="mt-[100px] flex justify-center items-center">
    <div class="w-full max-w-2xl rounded-2xl shadow-2xl bg-slate-700/80 backdrop-blur-md border border-slate-600 p-8 animate-fadeIn">
      <h2 class="text-3xl font-bold text-center text-white mb-6">Create a Game Session</h2>
      <form class="space-y-6" @submit.prevent="createGameSession">

        <!-- Game name -->
        <DefaultInput
            id="game_name"
            label="Game Name"
            name="name"
            v-model="name"
            placeholder="Type game name..."
            type="text"
            :error="errors.name"
        />

        <!-- Game description -->
        <DefaultInput
            id="game_description"
            label="Game Description"
            name="description"
            v-model="description"
            placeholder="Type game description..."
            type="text"
            :error="errors.description"
        />

        <!-- Game Expiration -->
        <DefaultInput
            id="game_expiration"
            label="Expiration"
            name="expiration"
            v-model="expiration"
            type="date"
            :error="errors.expiration"
        />

        <!-- Participation fee -->
        <DefaultInput
            id="game_participation_fee"
            label="Participation Fee"
            name="participation_fee"
            v-model="participationFee"
            type="number"
            :error="errors.participation_fee"
        />

        <!-- Game options -->
        <MultiAddInput
            id="game_options"
            label="Game Options"
            name="options"
            placeholder="Type game option..."
            type="text"
            v-model="options"
            :error="errors.options"
        />

        <div v-if="generalError" class="flex justify-center mt-2">
          <p class="text-red-400 text-sm font-medium">{{ generalError }}</p>
        </div>

        <DefaultButton
            text="Create Game Session"
            type="submit"
            :center="true"
            :loading="isSubmitting"
            :scale="true"
            :fade="false"
            class="mt-12"
        />
      </form>
    </div>
  </div>
</template>

<script setup>
import { useToast } from "~~/composables/useToast.js";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { createGameSchema } from "~~/shared/schemas/game/create.js";

import DefaultInput from "~/components/form/inputs/DefaultInput.vue";
import MultiAddInput from "~/components/form/inputs/MultiAddInput.vue";
import DefaultButton from "~/components/form/buttons/DefaultButton.vue";
import {useWalletStore} from "~~/stores/wallet_store.js";

const walletStore = useWalletStore();

const generalError = ref('');

const { handleSubmit, errors, setErrors, isSubmitting, defineField, resetForm } = useForm({
  validationSchema: toTypedSchema(createGameSchema),
  initialValues: {
    account: '',
    name: '',
    description: '',
    expiration: '',
    participation_fee: 0.1,
    options: [],
  },
});

const [account] = defineField('account');
const [name] = defineField('name');
const [description] = defineField('description');
const [expiration] = defineField('expiration');
const [participationFee] = defineField('participation_fee');
const [options] = defineField('options');

const createGameSession = handleSubmit(async (vals) => {
  try {
    const response = await $fetch('/api/game/create', {
      method: 'POST',
      body: vals,
    });

    if (response.ok) {
      resetForm();
      useToast('Game Session Created!', 'green');
    } else {
      generalError.value = response?.error?.message ?? 'Error during game session creation';
      useToast('Error during game session creation', 'red');
    }
  } catch (err) {
    const fieldErrors = err?.data?.data ?? {};
    setErrors(fieldErrors);
    useToast('Error during game session creation', 'red');
  }
});

watchEffect(() => {
  if (errors.value.account && Object.keys(errors.value).length === 1) {
    useToast(errors.value.account, 'red');
  }
});

onMounted(() => {
  account.value = walletStore.account;
});
</script>

<style scoped></style>
