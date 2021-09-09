import Vue from 'vue';
import Vuetify from 'vuetify/lib';

import '@/assets/icons/header-icons/header-icons.css';

Vue.use(Vuetify);

export default new Vuetify({
  icons: {
    iconfont: 'md',
  },
  theme: {
    themes: {
      light: {
        primary: '#000000',
        secondary: '#424242',
        accent: '#82B1FF',
        error: '#FF0000',
        info: '#2196F3',
        success: '#FA4600',
        warning: '#FFC107',
        dark: '#000000',
      },
      dark: {
        primary: '#000000',
        secondary: '#424242',
        accent: '#82B1FF',
        error: '#FF5252',
        info: '#2196F3',
        success: '#FA4600',
        warning: '#FFC107',
        dark: '#000000',
      },
    },
  },
});
