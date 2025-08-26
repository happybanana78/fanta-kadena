export const useWalletStore = defineStore('walletStore', {
    state: () => ({
        connected: false,
        wallet: null,
        account: '',
    }),
    actions: {
        //
    },
});
