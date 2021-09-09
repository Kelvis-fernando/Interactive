import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators';

import axios, { api, retry } from '@/services/axios';

import store from '@/store';

import './axios';
import './countries';
import './currencies';
import './industries';
import './notifications';
import './timezones';

export type ViewModeKeys =
  | 'dashboards'
  | 'dataEngineering'
  | 'databases'
  | 'contactLists'
  | 'relationalTables'
  | 'segments'
  | 'compliance'
  | 'websites'
  | 'forms'
  | 'apps'
  | 'email'
  | 'push'
  | 'sms'
  | 'experiments'
  | 'automation'
  | 'personalization'
  | 'contentTypes'
  | 'groups'
  | 'assets';

export type ViewMode = 'list' | 'card';

export type ViewModeParams = {
  key: ViewModeKeys;
  mode: ViewMode;
};

export interface ILanguage {
  key: 'en-us' | 'pt-br' | 'es';
  name: string;
}

export interface IMenu {
  id: number;
  icon?: string;
  name: string;
  url: string;
  status: boolean;
  children: IMenu[];
}

type Languages = 'en-us' | 'pt-br' | 'es';

export type StatusMessages = Record<Languages, Record<string, any>>;

@Module({ dynamic: true, store, name: 'system', namespaced: true })
export default class System extends VuexModule {
  _loading = false;
  _locale: ILanguage = {
    key: 'en-us',
    name: 'english',
  };
  _alertMessage: string | null = null;
  _loadingMenu = false;
  _sidebarOpen = true;
  _menus: IMenu[] = [];
  _viewModes: Record<ViewModeKeys, ViewMode> = {
    dashboards: 'list',
    dataEngineering: 'list',
    databases: 'list',
    contactLists: 'list',
    relationalTables: 'list',
    segments: 'list',
    compliance: 'list',
    websites: 'list',
    forms: 'list',
    apps: 'list',
    email: 'list',
    push: 'list',
    sms: 'list',
    experiments: 'list',
    automation: 'list',
    personalization: 'list',
    contentTypes: 'list',
    groups: 'list',
    assets: 'list',
  };

  get viewMode(): Record<ViewModeKeys, ViewMode> {
    return this._viewModes;
  }

  get locale(): ILanguage {
    return this._locale;
  }

  get languages(): ILanguage[] {
    return [
      {
        key: 'es',
        name: 'spanish',
      },
      {
        key: 'pt-br',
        name: 'portuguese',
      },
      {
        key: 'en-us',
        name: 'english',
      },
    ];
  }

  get isLoading(): boolean {
    return this._loading;
  }

  get alert(): string | null {
    return this._alertMessage;
  }

  get isLoadingMenus(): boolean {
    return this._loadingMenu;
  }

  get isMenuOpen(): boolean {
    return this._sidebarOpen;
  }

  get menus(): IMenu[] {
    return this._menus;
  }

  get menusUrl(): string[] {
    return [
      ...this._menus.reduce<string[]>((acc, item) => {
        item.children.forEach(child => {
          if (child.status) acc.push(child.url);
        });
        return acc;
      }, []),
      '/user/settings',
      '/companies/settings',
    ];
  }

  get routes(): string[] {
    return [
      ...this._menus.reduce<string[]>((acc, item) => {
        item.children.forEach(child => {
          if (child.status) acc.push(child.url);
        });
        return acc;
      }, []),
      '/auth/login',
      '/auth/sign-up',
      '/email/unsubscribe',
      '/companies/choose-company',
      '/companies/create-company',
      '/companies/settings',
      '/user/settings',
    ];
  }

  @Mutation
  setLocale(payload: ILanguage): void {
    const htmlTag = document.querySelector('html');
    if (htmlTag) htmlTag.setAttribute('lang', payload.key);
    this._locale = payload;
  }

  @Mutation
  setLoading(payload: boolean): void {
    if (!payload) {
      setTimeout(() => {
        this._loading = payload;
      }, 250);
      return;
    }

    this._loading = payload;
  }

  @Mutation
  setAlert(payload: string | null): void {
    this._alertMessage = payload;
  }

  @Mutation
  setLoadingMenu(payload: boolean): void {
    this._loadingMenu = payload;
  }

  @Mutation
  setMenus(payload: IMenu[]): void {
    this._menus = payload;
  }

  @Mutation
  setMenuOpen(payload: boolean): void {
    this._sidebarOpen = payload;
  }

  @Mutation
  setViewMode({ key, mode }: ViewModeParams): void {
    this._viewModes[key] = mode;
  }

  @Action
  getStatusMessage(): Promise<StatusMessages[]> {
    return retry<StatusMessages[]>({
      axios,
      url: 'https://cdn.headerinteractive.com/dx/status',
    })
      .then(response => {
        this.setAlert(null);

        response.data.forEach(item => {
          this.setAlert(item[this._locale.key].message);
        });

        return response.data;
      })
      .catch(() => {
        this.setAlert(null);
        return [];
      });
  }

  @Action
  getMenus(): Promise<any> {
    return retry<IMenu[]>({ axios: api, url: '/users/menus' })
      .then(response => {
        this.setLoadingMenu(false);
        this.setMenus(response.data);
        return response.data;
      })
      .catch(error => {
        this.setLoadingMenu(false);
        throw error;
      });
  }
}
