import Vue from 'vue';
import VueRouter, { Route, NavigationGuardNext, RouteConfig } from 'vue-router';

import store from '@/store';

import paths, { Path } from './paths';

const isLocal = window.location.href.match(/(localhost)/g);

function session(to: Route, from: Route, next: NavigationGuardNext) {
  store.commit('auth/setLoadingSession', false);

  const token = store.getters['auth/token'];
  if (!token && !to.meta.guest) {
    store.commit('auth/destroySession');
    return next('/auth/login');
  }

  if (token && !to.meta.guest) store.dispatch('auth/hasSession');

  setInterval(() => {
    const token = store.getters['auth/token'];
    if (token && !to.meta.guest) store.dispatch('auth/hasSession');
  }, 1000 * 60 * 10);

  return next();
}

function route({ name, path, meta, children, component }: Path): RouteConfig {
  return {
    path,
    name,
    meta,
    beforeEnter: session,
    component: () => import(`@/views${component}.vue`),
    children: children && children.map(route),
  };
}

const router = new VueRouter({
  mode: 'history',
  routes: paths.map(route),
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition;
    if (to.hash) return { selector: to.hash };
    return { x: 0, y: 0 };
  },
});

Vue.use(VueRouter);

router.beforeEach(async (to, from, next) => {
  await store.restored;

  if (!isLocal) {
    // const sendEventObject = (window as any)['HeaderDXObject'] || 'dx';
    // sendEventObject.push(function () {
    //   (sendEventObject as any).custom('pageView');
    // });
  }

  if (to.meta.public || to.meta.guest) return next();
  const token = store.getters['auth/token'];

  if (!token && !to.meta.guest) {
    return next(from.name === 'login' ? false : '/auth/login');
  }

  const currentCompany = store.getters['companies/current'];

  if (token && to.meta.guest) {
    store.dispatch('system/getStatusMessage');
    if (!currentCompany) return next('/companies/choose-company');
    return next(store.getters['system/menusUrl'][0]);
  }

  if (
    to.path.match('/companies/settings') &&
    currentCompany &&
    currentCompany.ROLE !== 'Owner'
  ) {
    store.dispatch('system/getStatusMessage');
    return next(store.getters['system/menusUrl'][0]);
  }

  const routes: string[] = store.getters['system/routes'];
  if (routes.every(menu => !to.path.match(menu))) {
    store.dispatch('system/getStatusMessage');
    return next(store.getters['system/menusUrl'][0]);
  }

  store.dispatch('system/getStatusMessage');

  store.commit('axios/setHeaders', store.getters['axios/headers']);

  return next();
});

export default router;
