<template>
  <div>
    <div class="flex justify-end px-5">
      <DefaultButton
          v-if="!walletStore.connected"
          text="Connect Wallet"
          :action="toggleDrawer"
          class="mt-6"
      />
    </div>

    <div class="flex justify-end px-5">
      <DefaultButton
          v-if="walletStore.connected"
          :is-slot="true"
          :action="disconnect"
          class="mt-6"
      >
        Connected <span class='ml-2'>{{ walletStore.account.slice(0, 10) }}...</span>
      </DefaultButton>
    </div>

    <div
      class="overflow-y-auto fixed top-0 right-0 z-40 p-4 w-full max-w-xs h-screen bg-white transition-transform dark:bg-gray-800"
      :class="{
        'translate-x-full': !showDrawer
      }"
      tabindex="-1"
    >
      <h4 class="mb-1.5 leading-none text-xl font-semibold text-gray-900 dark:text-white">Select Wallet</h4>
      <button
        type="button"
        class="text-gray-400 cursor-pointer bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 absolute top-2.5 right-2.5 inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white"
        @click="toggleDrawer"
      >
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
        <span class="sr-only">Close menu</span>
      </button>

      <!-- ChainWeaver -->
      <DefaultButton
        v-if="walletStore.wallet !== 'chainweaver'"
        text="ChainWeaver"
        :full="true"
        value="chainweaver"
        :action="setWallet"
      />

      <DefaultInput
        v-if="walletStore.wallet === 'chainweaver'"
        id="chainweaver-wallet"
        placeholder="Enter your k:... account"
        v-model="walletStore.account"
        class="mt-6"
        @keydown.enter="saveWallet"
      />
    </div>
  </div>
</template>

<script setup>
import DefaultButton from "~/components/form/buttons/DefaultButton.vue";
import DefaultInput from "~/components/form/inputs/DefaultInput.vue";
import {useSetData} from "~~/composables/useSetData.js";
import {useGetData} from "~~/composables/useGetData.js";
import {useRemoveData} from "~~/composables/useRemoveData.js";
import {useWalletStore} from "~~/stores/wallet_store.js";

const walletStore = useWalletStore();

const showDrawer = ref(false);

const toggleDrawer = () => {
  showDrawer.value = !showDrawer.value;
}

const setWallet = (wallet) => {
  walletStore.wallet = wallet;
}

const saveWallet = () => {
  useSetData('wallet', {
    name: walletStore.wallet,
    account: walletStore.account,
  });

  walletStore.connected = true;
  showDrawer.value = false;
}

const disconnect = () => {
  walletStore.connected = false;
  walletStore.wallet = null;
  walletStore.account = '';
  useRemoveData('wallet');
}

onMounted(() => {
  const data = useGetData('wallet');

  if (data) {
    walletStore.wallet = data.name;
    walletStore.account = data.account;
    walletStore.connected = true;
  }
});
</script>

<style scoped></style>
