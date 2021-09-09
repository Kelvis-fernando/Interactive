import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators';

import { AxiosResponse } from 'axios';

import { auth, retry } from '@/services/axios';
import router from '@/router';

import store from '../../index';

import { IUser } from '../user';

export interface ILoginRequest {
  email: string;
  password: string;
  remember: boolean;
}

export interface ILoginResponse {
  token: string;
  user: IUser;
}

export interface ISessionResponse {
  token: string;
  user: IUser;
}

@Module({ dynamic: true, store, name: 'auth', namespaced: true })
export default class Auth extends VuexModule {
  _loading = false;
  _loadingSession = false;
  _session: string | null = null;
  _error = false;

  get token(): string | null {
    return this._session;
  }

  get isLoading(): boolean {
    return this._loading;
  }

  get isLoadingSession(): boolean {
    return this._loadingSession;
  }

  get hasError(): boolean {
    return this._error;
  }

  @Mutation
  setLoadingSession(payload: boolean): void {
    this._loadingSession = payload;
  }

  @Mutation
  request(): void {
    this._loading = true;
    this._error = false;
  }

  @Mutation
  success(payload: string | null): void {
    this._loading = false;
    this._session = payload;
    this._error = false;
  }

  @Mutation
  failure(): void {
    this._loading = false;
    this._session = null;
    this._error = true;
  }

  @Mutation
  remove(): void {
    this._loading = false;
    this._session = null;
    this._error = false;
  }

  @Mutation
  async destroySession(): Promise<any> {
    const reset = new Promise(resolve => {
      store.reset();
      resolve;
    });

    await reset;
    // store.reset().then(() => {
    router.push('/auth/login');
    // });
  }

  @Action
  async hasSession(): Promise<IUser> {
    return await retry<ISessionResponse>({ axios: auth, url: '/session' })
      .then(response => {
        this.setLoadingSession(false);

        const cid = store.getters['axios/headers']['HEADER-CID'];
        if (cid && store.getters['companies/current']) {
          store.dispatch('system/getMenus');
        }

        if (response.data.token) {
          this.success(response.data.token);
          store.dispatch(
            'axios/setHeaders',
            {
              ...store.getters['axios/headers'],
              Authorization: `Bearer ${response.data.token}`,
            },
            { root: true },
          );
        }
        return response.data.user;
      })
      .catch(error => {
        this.setLoadingSession(false);
        this.destroySession();
        return error;
      });
  }

  @Action
  async loginRequest(payload: ILoginRequest): Promise<IUser | void> {
    this.request();

    try {
      const response = await retry<ILoginResponse>({
        axios: auth,
        url: '/auth/Login',
        options: {
          method: 'POST',
          data: payload,
        },
      });

      this.success(response.data.token);
      store.commit(
        'axios/setHeaders',
        {
          Authorization: `Bearer ${response.data.token}`,
        },
        { root: true },
      );
      store.commit('user/set', response.data.user, { root: true });
      store.commit('system/setMenuOpen', true);
      router.push('/companies/choose-company');
      return response.data.user;
    } catch (error) {
      this.failure();
    }
  }

  @Action
  async forgotPassword(payload: string): Promise<AxiosResponse | void> {
    this.request();

    try {
      const response = await retry<ILoginResponse>({
        axios: auth,
        url: '/auth/forgot-password',
        options: {
          method: 'POST',
          data: payload,
        },
      });
      return response;
    } catch (error) {
      this.failure();
    }
  }
}
