import 'reflect-metadata';
import Vue from 'vue';

import App from './App.vue';

import { version } from '../package.json';

import vuetify from '@/plugins/vuetify';
import Logger from '@/plugins/logger';
import { sync } from '@/plugins/vuex-router-sync';
import VuexPersist from '@/plugins/vuex-persist';
import i18n from '@/i18n';
import router from '@/router';
import store from '@/store';
import '@/store/modules';
import '@/components';

import './registerServiceWorker';

sync(store, router);

const persist = new VuexPersist();
persist.plugin(store);

let logLevel = 'error';

switch (process.env.NODE_ENV) {
  case 'production':
    logLevel = 'error';
    break;

  case 'staging':
    logLevel = 'warn';
    Vue.config.devtools = true;
    break;

  case 'development':
    logLevel = 'debug';
    Vue.config.devtools = true;
    break;

  default:
    logLevel = 'error';
    break;
}

Vue.config.productionTip = false;
Vue.prototype.$version = version;

Vue.use(Logger, { logLevel });

new Vue({
  vuetify,
  i18n,
  router,
  store,
  render: h => h(App),
}).$mount('#app');
