// @ts-ignore
import { useRuntimeConfig } from "nuxt/app";

const {
    token,
} = useAuth()

export const useApi = () => {
    const config = useRuntimeConfig().public.apiUrl;

    const nuxt = useNuxtApp().vueApp.$nuxt;
    const { locale } = nuxt.$i18n;

    async function $api(
        path: string,
        method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
        body?: any
    ): Promise<any> {
        try {
            const url = config + path;
            const options = {
                method,
                body: ['POST', 'PUT'].includes(method) ? body instanceof FormData ? body : JSON.stringify(body) : undefined,
                headers: {
                    ...((method === 'POST' || method === 'PUT') && !(body instanceof FormData) && { 'Content-Type': 'application/json' }),
                    'Accept-Language': locale.value,
                    'Authorization': token.value
                }
            };

            return await $fetch(url, options);
        } catch (error) {
            console.error('API call error:', error);
            throw error;
        }
    }

    async function $apiOther(
        path: string,
        method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
        body?: any
    ): Promise<any> {
        try {
            const url = path;
            const options = {
                method,
                body: ['POST', 'PUT'].includes(method) ? JSON.stringify(body) : undefined,
                headers: {
                    ...((method === 'POST' || method === 'PUT') && { 'Content-Type': 'application/json' }),
                    'Accept-Language': locale.value,
                }
            };

            return await $fetch(url, options);
        } catch (error) {
            console.error('API call error:', error);
            throw error;
        }
    }

    return { $api, $apiOther };
};