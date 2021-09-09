import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators';

import store from '@/store';

import { api, retry } from '@/services/axios';
export interface INotification {
  ID: number;
  NAME: string;
  CONTENT: string;
  READ: boolean;
  CREATED_AT: Date;
  UPDATED_AT: Date;
}

@Module({ dynamic: true, store, name: 'notifications', namespaced: true })
export default class Notifications extends VuexModule {
  _list: INotification[] = [];
  _current?: INotification;

  get list(): INotification[] {
    return this._list;
  }

  get current(): INotification | undefined {
    return this._current;
  }

  @Mutation
  set(payload: INotification[]): void {
    this._list = payload;
  }

  @Mutation
  setCurrent(payload: INotification): void {
    this._current = payload;
  }

  @Action
  async index(): Promise<INotification[]> {
    const response = await retry<INotification[]>({
      axios: api,
      url: '/notifications',
    });

    this.set(response.data);

    return response.data;
  }

  @Action
  async setAllAsRead(): Promise<INotification[]> {
    this._list = this._list.map(n => ({
      ...n,
      read: true,
    }));

    const response = await retry<INotification[]>({
      axios: api,
      url: '/notifications/allread',
      options: {
        method: 'POST',
      },
    });

    this.set(response.data);

    return response.data;
  }
}
