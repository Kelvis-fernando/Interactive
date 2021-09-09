import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators';

import { contentmanager, retry } from '@/services/axios';
import store from '../../../index';

export interface IAssetFormat {
  ID: number;
  TYPE: string;
  EXTENSION: string;
  GROUP: string;
  CREATED_AT: Date;
}

@Module({ dynamic: true, store, name: 'assets/formats', namespaced: true })
export default class Assets extends VuexModule {
  _list: IAssetFormat[] = [];

  get list(): IAssetFormat[] {
    return this._list;
  }

  @Mutation
  set(payload: IAssetFormat[]): void {
    this._list = payload;
  }

  @Action
  async index(): Promise<IAssetFormat[]> {
    const response = await retry<IAssetFormat[]>({
      axios: contentmanager,
      url: '/assets/formats',
    });

    this.set(response.data);

    return response.data;
  }
}
