import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators';
import { AxiosRequestConfig } from 'axios';

import { contentmanager, retry } from '@/services/axios';

import store from '@/store';
import './formats';

import { IUser } from '../../user';
import { IAssetFormat } from './formats';

export interface IAsset {
  ID: number;
  NAME: string;
  DESCRIPTION: string;
  LENGHT: number;
  SIZE_HORIZONTAL: number;
  SIZE_VERTIVAL: number;
  PUBLIC: boolean;
  URL?: string;
  THUMBNAIL?: string;
  FORMAT: IAssetFormat;
  USER: IUser;
  CREATED_AT: Date;
  UPDATED_AT: Date;
}

export type AssetGroup = 'image' | 'audio' | 'video' | 'data';
type AssetGroupState = '_image' | '_audio' | '_video' | '_data';

export type AssetState = {
  items: IAsset[];
  total: number;
  offset: number;
};

@Module({
  dynamic: true,
  store,
  name: 'content-manager/assets',
  namespaced: true,
})
export default class Assets extends VuexModule {
  _current: IAsset | null = null;
  _image: AssetState = {
    items: [],
    total: 0,
    offset: 0,
  };
  _video: AssetState = {
    items: [],
    total: 0,
    offset: 0,
  };
  _audio: AssetState = {
    items: [],
    total: 0,
    offset: 0,
  };
  _data: AssetState = {
    items: [],
    total: 0,
    offset: 0,
  };

  get all(): Record<AssetGroup, AssetState> {
    return {
      image: this._image,
      video: this._video,
      audio: this.audio,
      data: this.data,
    };
  }

  get image(): AssetState {
    return this._image;
  }

  get video(): AssetState {
    return this._video;
  }

  get audio(): AssetState {
    return this._audio;
  }

  get data(): AssetState {
    return this._data;
  }

  get current(): IAsset | null {
    return this._current;
  }

  @Mutation
  set({ group, data }: { group: AssetGroupState; data: IAsset[] }): void {
    this[group].items = data;
  }

  @Mutation
  setCurrent(payload: IAsset): void {
    this._current = payload;
  }

  @Action
  async index(payload: AssetGroup): Promise<IAsset[]> {
    const response = await retry<IAsset[]>({
      axios: contentmanager,
      url: '/assets',
      options: {
        params: {
          group: payload,
          offset: this[payload].offset,
        },
      },
    });

    let data = response.data;

    if (payload === 'image' || payload === 'video') {
      data = response.data.map(item => ({
        ...item,
        DIMENSIONS: `${item.SIZE_HORIZONTAL}px x ${item.SIZE_VERTIVAL}px`,
      }));
    }

    this.set({ group: `_${payload}` as AssetGroupState, data });

    return response.data;
  }

  @Action
  async create(data: IAsset, options?: AxiosRequestConfig): Promise<IAsset> {
    const response = await retry<IAsset>({
      axios: contentmanager,
      url: '/assets',
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
  async show(id: number): Promise<IAsset> {
    const response = await retry<IAsset>({
      axios: contentmanager,
      url: `/assets/${id}`,
    });

    this.setCurrent(response.data);

    return response.data;
  }

  @Action
  async update(data: IAsset, options?: AxiosRequestConfig): Promise<IAsset> {
    const { ID, ...rest } = data;
    const response = await retry<IAsset>({
      axios: contentmanager,
      url: `/assets/${ID}`,
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
    await retry<IAsset[]>({
      axios: contentmanager,
      url: '/assets',
      options: {
        method: 'DELETE',
        data: {
          criteria,
        },
      },
    });
  }
}
