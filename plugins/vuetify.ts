import { createVuetify } from 'vuetify';
import { defineNuxtPlugin } from "nuxt/app";

import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';

import 'vuetify/styles/main.sass'
import '@mdi/font/css/materialdesignicons.css'

interface Theme {
    dark: boolean,
    colors: Record<string, string>
}

const Theme: Theme = {
    dark: false,
    colors: {
        background: '#E0E7F4',
        'chip-card': '#F5F8FF',
        'primary-blue': '#6594F1',
        'on-primary-blue': '#1C1C1C',
        primary: '#256AF2',
        'body-color': '#1C1C1C',
        'body-color-2': '#434343',
        'link': '#115EF7',
        secondary: '#2C2D2E',
        gray: '#8C8C8C',
        'darker-gray': '#7E7E7E',
        success: '#00F6361A',
        loading: '#FFF6DF',
        green: '#11BC18'
    }
}

export default defineNuxtPlugin((nuxtApp): void => {
    const vuetify = createVuetify({
        components,
        directives,
        theme: {
            defaultTheme: 'Theme',
            themes: {
                Theme,
            }
        },
    })

    nuxtApp.vueApp.use(vuetify);
});