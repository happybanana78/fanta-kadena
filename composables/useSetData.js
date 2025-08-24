import nuxtStorage from 'nuxt-storage';

export const useSetData = (key, data) => {
    nuxtStorage.localStorage.setData(key, data, 8, 'h');
}
