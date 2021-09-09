import { Module, VuexModule, Mutation } from 'vuex-module-decorators';

import {
  auth,
  api,
  idexchange,
  contentmanager,
  message,
  engagement,
  datarefinery,
} from '@/services/axios';

import store from '@/store';

import { IUser } from '../user';

export interface IDefaultHeaders {
  Authorization?: string;
  'HEADER-CID'?: string;
}

export interface ILoginResponse {
  token: string;
  user: IUser;
}

@Module({ dynamic: true, store, name: 'axios', namespaced: true })
export default class Axios extends VuexModule {
  _defaultHeaders: IDefaultHeaders = {
    Authorization: undefined,
    'HEADER-CID': undefined,
  };

  get headers(): IDefaultHeaders | undefined {
    return this._defaultHeaders;
  }

  @Mutation
  setHeaders(payload: IDefaultHeaders): void {
    this._defaultHeaders = payload;

    auth.defaults.headers = payload;
    api.defaults.headers = payload;
    idexchange.defaults.headers = payload;
    contentmanager.defaults.headers = payload;
    message.defaults.headers = payload;
    engagement.defaults.headers = payload;
    datarefinery.defaults.headers = payload;
  }

  @Mutation
  destroy(): void {
    this._defaultHeaders = {
      Authorization: undefined,
      'HEADER-CID': undefined,
    };
  }
}
