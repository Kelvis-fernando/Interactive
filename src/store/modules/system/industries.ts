import { api, retry } from '@/services/axios';
import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators';

import store from '@/store';

export interface IIndustry {
  ID: number;
  NAME: string;
  DESCRIPTION: string;
  CREATED_AT: string;
  UPDATED_AT: string;
}

@Module({ dynamic: true, store, name: 'industries', namespaced: true })
export default class Industries extends VuexModule {
  _list: IIndustry[] = [];
  _current: IIndustry | null = null;

  get list(): IIndustry[] {
    return this._list;
  }

  get current(): IIndustry | null {
    return this._current;
  }

  @Mutation
  set(payload: IIndustry[]): void {
    this._list = payload;
  }

  @Mutation
  setCurrent(payload: IIndustry): void {
    this._current = payload;
  }

  @Action
  async index(): Promise<IIndustry[]> {
    const response = await retry<IIndustry[]>({
      axios: api,
      url: '/industries',
    });

    this.set(response.data);

    return response.data;
  }
}
