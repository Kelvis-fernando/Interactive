import { Store } from 'vuex';
import VueRouter, { Route } from 'vue-router';
import { Dictionary } from 'vue-router/types/router';

export interface SyncOptions {
  moduleName: string;
}

export interface State {
  name?: string | null;
  path?: string;
  hash?: string;
  query?: Dictionary<string | (string | null)[] | null | undefined>;
  params?: Dictionary<string>;
  fullPath: string;
  meta?: any;
  from?: Omit<State, 'from'>;
}

export interface Transition {
  to: Route;
  from: Route;
}

export function sync(
  store: Store<any>,
  router: VueRouter,
  options?: SyncOptions,
): () => void {
  const moduleName = (options || {}).moduleName || 'route';

  store.registerModule(moduleName, {
    namespaced: true,
    state: cloneRoute(router.currentRoute),
    getters: {
      name: state => state.name,
    },
    mutations: {
      routeChange(_state: State, transition: Transition): void {
        store.state[moduleName] = cloneRoute(transition.to, transition.from);
      },
    },
  });

  let isTimeTraveling = false;
  let currentPath: string;

  const storeUnwatch = store.watch(
    state => state[moduleName],
    (route: Route) => {
      const { fullPath } = route;
      if (fullPath === currentPath) return;
      if (currentPath != null) {
        isTimeTraveling = true;
        router.push(route as any);
      }
      currentPath = fullPath;
    },
    { sync: true } as any,
  );

  const afterEachUnHook = router.afterEach((to, from) => {
    if (isTimeTraveling) {
      isTimeTraveling = false;
      return;
    }
    currentPath = to.fullPath;
    store.commit(`${moduleName}/routeChange`, { to, from });
  });

  return function unsync(): void {
    if (afterEachUnHook !== null) afterEachUnHook();
    if (storeUnwatch !== null) storeUnwatch();
    store.unregisterModule(moduleName);
  };
}

function cloneRoute(to: Route, from?: Route): State {
  const clone: State = {
    name: to.name,
    path: to.path,
    hash: to.hash,
    query: to.query,
    params: to.params,
    fullPath: to.fullPath,
    meta: to.meta,
  };

  if (from) clone.from = cloneRoute(from);

  return Object.freeze(clone);
}
