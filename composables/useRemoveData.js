import nuxtStorage from 'nuxt-storage';

export const useRemoveData = (key) => {
    nuxtStorage.localStorage.removeItem(key);
}
