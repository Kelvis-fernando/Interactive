import { api, retry } from '@/services/axios';
import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators';

import store from '@/store';

export interface ICountry {
  ID: number;
  NAME: string;
  OFFICIAL_NAME: string;
  ABBREVIATION: string;
}

@Module({ dynamic: true, store, name: 'countries', namespaced: true })
export default class Countries extends VuexModule {
  _list: ICountry[] = [];
  _current: ICountry | null = null;

  get list(): ICountry[] {
    return this._list;
  }

  get current(): ICountry | null {
    return this._current;
  }

  @Mutation
  set(payload: ICountry[]): void {
    this._list = payload;
  }

  @Mutation
  setCurrent(payload: ICountry): void {
    this._current = payload;
  }

  @Action
  async index(): Promise<ICountry[]> {
    const response = await retry<ICountry[]>({
      axios: api,
      url: '/countries',
    });

    this.set(response.data);

    return response.data;
  }
}
