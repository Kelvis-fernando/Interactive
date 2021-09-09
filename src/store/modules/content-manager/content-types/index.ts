import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators';
import { AxiosRequestConfig } from 'axios';

import { contentmanager, retry } from '@/services/axios';

import store from '@/store';

import { IUser } from '../../user';
import { IAssetFormat } from '../assets/formats';

export interface IContentType {
  ID: number;
  NAME: string;
  SIZE_VERTICAL: number;
  SIZE_HORIZONTAL: number;
  LENGTH_MAX: number;
  DYNAMIC: boolean;
  HASH: string;
  ROWS: number;
  CHANNEL: {
    ID: number;
    NAME: string;
  };
  REFERENCE: {
    ID: number;
    NAME: string;
  };
  FORMATS: IAssetFormat[];
  OWNER: boolean;
  USER: IUser;
  CREATED_AT: Date;
  UPDATED_AT: Date;
}

type ContentTypeState =
  | '_web'
  | '_social'
  | '_email'
  | '_mobile'
  | '_sms'
  | '_mirror';

@Module({
  dynamic: true,
  store,
  name: 'content-manager/content-types',
  namespaced: true,
})
export default class ContentTypes extends VuexModule {
  _web: IContentType[] = [];
  _social: IContentType[] = [];
  _email: IContentType[] = [];
  _mobile: IContentType[] = [];
  _sms: IContentType[] = [];
  _mirror: IContentType[] = [];
  _current: IContentType | null = null;

  get web(): IContentType[] {
    return this._web;
  }

  get current(): IContentType | null {
    return this._current;
  }

  @Mutation
  set({ type, data }: { type: ContentTypeState; data: IContentType[] }): void {
    this[type] = data;
  }

  @Mutation
  setCurrent(payload: IContentType): void {
    this._current = payload;
  }

  @Action
  async index(payload: {
    id: number;
    channel: string;
  }): Promise<IContentType[]> {
    const response = await retry<IContentType[]>({
      axios: contentmanager,
      url: '/content-types',
      options: {
        params: {
          channel: payload.id,
        },
      },
    });

    this.set({
      type: `_${payload.channel}` as ContentTypeState,
      data: response.data,
    });

    return response.data;
  }

  @Action
  async create(
    data: Record<string, any>,
    options?: AxiosRequestConfig,
  ): Promise<IContentType> {
    const response = await retry<IContentType>({
      axios: contentmanager,
      url: '/content-types',
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
  async show(id: number): Promise<IContentType> {
    const response = await retry<IContentType>({
      axios: contentmanager,
      url: `/content-types/${id}`,
    });

    this.setCurrent(response.data);

    return response.data;
  }

  @Action
  async update(
    data: Record<string, any>,
    options?: AxiosRequestConfig,
  ): Promise<IContentType> {
    const { id, ...rest } = data;
    const response = await retry<IContentType>({
      axios: contentmanager,
      url: `/content-types/${id}`,
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
    await retry<IContentType[]>({
      axios: contentmanager,
      url: '/content-types',
      options: {
        method: 'DELETE',
        data: {
          criteria,
        },
      },
    });
  }
}
