<template>
  <div v-if="isWallet" class="mt-[100px] flex justify-center items-center">
    <div class="w-1/2 rounded-lg border-white bg-slate-700 p-5">
      <form class="space-y-4" @submit.prevent="createGameSession">

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
            @update-options="addOptions"
        />

        <DefaultButton
            text="Create Game Session"
            type="submit"
            :center="true"
            :loading="isSubmitting"
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
import {useGetData} from "~~/composables/useGetData.js";
import {useWalletStore} from "~~/stores/wallet_store.js";

const walletStore = useWalletStore();

const isWallet = ref(true);

const addOptions = (event) => {
  options.value = event;
}

const { handleSubmit, errors, setErrors, isSubmitting, defineField } = useForm({
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
      useToast('Game Session Created!', 'green');
    } else {
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
