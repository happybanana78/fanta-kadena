import nuxtStorage from 'nuxt-storage';

export const useGetData = (key) => {
    return nuxtStorage.localStorage.getData(key);
}
