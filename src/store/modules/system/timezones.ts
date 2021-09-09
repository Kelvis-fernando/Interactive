import { api, retry } from '@/services/axios';
import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators';

import store from '@/store';

export interface ITimezone {
  ID: number;
  NAME: string;
  DESCRIPTION: string;
  CREATED_AT: string;
  UPDATED_AT: string;
}

@Module({ dynamic: true, store, name: 'timezones', namespaced: true })
export default class Timezones extends VuexModule {
  _list: ITimezone[] = [];
  _current: { name: string; gmt: string } | null = null;

  get list(): ITimezone[] {
    return this._list;
  }

  get current(): { name: string; gmt: string } | null {
    return this._current;
  }

  get gmt(): string {
    return this._current?.gmt || '';
  }

  @Mutation
  set(payload: ITimezone[]): void {
    this._list = payload;
  }

  @Mutation
  setCurrent(payload: { name: string; gmt: string }): void {
    this._current = payload;
  }

  @Action
  async index(): Promise<ITimezone[]> {
    const response = await retry<ITimezone[]>({
      axios: api,
      url: '/timezones',
    });

    this.set(response.data);

    return response.data;
  }
}
