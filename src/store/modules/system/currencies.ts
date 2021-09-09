import { api, retry } from '@/services/axios';
import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators';

import store from '@/store';

export interface ICurrency {
  ID: number;
  NAME: string;
  DESCRIPTION: string;
  CREATED_AT: string;
  UPDATED_AT: string;
}

@Module({ dynamic: true, store, name: 'currencies', namespaced: true })
export default class Currencies extends VuexModule {
  _list: ICurrency[] = [];
  _current: ICurrency | null = null;

  get list(): ICurrency[] {
    return this._list;
  }

  get current(): ICurrency | null {
    return this._current;
  }

  @Mutation
  set(payload: ICurrency[]): void {
    this._list = payload;
  }

  @Mutation
  setCurrent(payload: ICurrency): void {
    this._current = payload;
  }

  @Action
  async index(): Promise<ICurrency[]> {
    const response = await retry<ICurrency[]>({
      axios: api,
      url: '/currencies',
    });

    this.set(response.data);

    return response.data;
  }
}
