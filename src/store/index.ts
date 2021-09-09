import Vue from 'vue';
import Vuex, { Store } from 'vuex';

import { createStore as createExtendedStore } from 'vuex-extensions';

Vue.use(Vuex);

const store = createExtendedStore(Store);

export default store;
