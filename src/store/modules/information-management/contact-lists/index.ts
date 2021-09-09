import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators';

import { api, retry } from '@/services/axios';
import store from '../../../index';

import { IDatabase } from '../databases';

@Module({
  dynamic: true,
  store,
  name: 'information-management/contact-lists',
  namespaced: true,
})
export default class ContactLists extends VuexModule {
  _list: IDatabase[] = [];
  _current: IDatabase | null = null;

  get list(): IDatabase[] {
    return this._list;
  }

  get current(): IDatabase | null {
    return this._current;
  }

  @Mutation
  set(payload: IDatabase[]): void {
    this._list = payload;
  }

  @Mutation
  setCurrent(payload: IDatabase | null): void {
    this._current = payload;
  }

  @Action
  async index(): Promise<IDatabase[]> {
    const response = await retry<IDatabase[]>({
      axios: api,
      url: '/information-management/contact-lists',
    });

    this.set(response.data);

    return response.data;
  }

  @Action
  async create(data: IDatabase): Promise<IDatabase> {
    const response = await retry<IDatabase>({
      axios: api,
      url: '/information-management/contact-lists',
      options: {
        method: 'POST',
        data,
      },
    });

    this.setCurrent(response.data);

    return response.data;
  }

  @Action
  async show(data: number): Promise<IDatabase> {
    const response = await retry<IDatabase>({
      axios: api,
      url: `/information-management/contact-lists/${data}`,
    });

    this.setCurrent(response.data);

    return response.data;
  }

  @Action
  async update(data: IDatabase): Promise<IDatabase> {
    const { ID, ...rest } = data;
    const response = await retry<IDatabase>({
      axios: api,
      url: `/information-management/contact-lists/${ID}`,
      options: {
        method: 'PUT',
        data: rest,
      },
    });

    this.setCurrent(response.data);

    return response.data;
  }

  @Action
  async delete(criteria: number[]): Promise<void> {
    await retry<IDatabase[]>({
      axios: api,
      url: '/information-management/contact-lists',
      options: {
        method: 'DELETE',
        data: {
          criteria,
        },
      },
    });
  }
}
