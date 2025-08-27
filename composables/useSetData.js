import nuxtStorage from 'nuxt-storage';

export const useSetData = (key, data) => {
    nuxtStorage.localStorage.setData(key, data, 48, 'h');
}
