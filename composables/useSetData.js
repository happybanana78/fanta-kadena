import nuxtStorage from 'nuxt-storage';

export const useSetData = async (key, data) => {
    await nuxtStorage.localStorage.setData(key, data, 48, 'h');
}
