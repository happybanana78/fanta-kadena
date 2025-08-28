import nuxtStorage from 'nuxt-storage';

export const useGetData = async (key) => {
    return await nuxtStorage.localStorage.getData(key);
}
