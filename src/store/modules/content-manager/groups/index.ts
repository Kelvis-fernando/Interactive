import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators';
import { AxiosRequestConfig } from 'axios';

import { contentmanager, retry } from '@/services/axios';

import store from '@/store';

import { IUser } from '../../user';

export interface IGroup {
  ID: number;
  NAME: string;
  OWNER: boolean;
  USER: IUser;
  CREATED_AT: Date;
  UPDATED_AT: Date;
}

@Module({
  dynamic: true,
  store,
  name: 'content-manager/groups',
  namespaced: true,
})
export default class Groups extends VuexModule {
  _list: IGroup[] = [];
  _current: IGroup | null = null;

  get list(): IGroup[] {
    return this._list;
  }

  get current(): IGroup | null {
    return this._current;
  }

  @Mutation
  set(data: IGroup[]): void {
    this._list = data;
  }

  @Mutation
  setCurrent(payload: IGroup): void {
    this._current = payload;
  }

  @Action
  async index(): Promise<IGroup[]> {
    const response = await retry<IGroup[]>({
      axios: contentmanager,
      url: '/groups',
    });

    this.set(response.data);

    return response.data;
  }

  @Action
  async create(
    data: Record<string, any>,
    options?: AxiosRequestConfig,
  ): Promise<IGroup> {
    const response = await retry<IGroup>({
      axios: contentmanager,
      url: '/groups',
      options: {
        ...options,
        method: 'POST',
        data,
      },
    });

    this.setCurrent(response.data);

    return response.data;
  }

  @Action
  async show(id: number): Promise<IGroup> {
    const response = await retry<IGroup>({
      axios: contentmanager,
      url: `/groups/${id}`,
    });

    this.setCurrent(response.data);

    return response.data;
  }

  @Action
  async update(
    data: Record<string, any>,
    options?: AxiosRequestConfig,
  ): Promise<IGroup> {
    const { id, ...rest } = data;
    const response = await retry<IGroup>({
      axios: contentmanager,
      url: `/groups/${id}`,
      options: {
        ...options,
        method: 'PUT',
        data: rest,
      },
    });

    this.setCurrent(response.data);

    return response.data;
  }

  @Action
  async delete(criteria: number[]): Promise<void> {
    await retry<IGroup[]>({
      axios: contentmanager,
      url: '/groups',
      options: {
        method: 'DELETE',
        data: {
          criteria,
        },
      },
    });
  }
}
