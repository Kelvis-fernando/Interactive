import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators';

import { api, retry } from '@/services/axios';

import router from '@/router';

import store from '@/store';

export interface ICompany {
  BILLING_ADDRESS: string;
  BILLING_CITY: string;
  BILLING_COMPLEMENT: string;
  BILLING_NEIGHBORHOOD: string;
  BILLING_STATE: string;
  BILLING_ZIPCODE: string;
  CID: string;
  CNPJ: string;
  CORPORATE_NAME: string;
  COUNTRY: {
    ID: number;
    NAME: string;
    OFFICIAL_NAME: string;
    ABBREVIATION: string;
  };
  CURRENCY: {
    ID: number;
    NAME: string;
    SYMBOL: string;
    ISO_CODE: string;
  };
  DOMAIN: string;
  FANTASY_NAME: string;
  INDUSTRY: {
    ID: number;
    NAME: string;
  };
  INSCRICAO_ESTADUAL: string;
  NAME: string;
  REFERENCE: string;
  ROLE: string;
  TAX_TYPE: string;
  TIMEZONE: {
    ID: number;
    NAME: string;
    DESCRIPTION: string;
  };
  CREATED_AT: string;
  UPDATED_AT: string;
}

@Module({ dynamic: true, store, name: 'companies', namespaced: true })
export default class Companies extends VuexModule {
  _list: ICompany[] = [];
  _current: ICompany | null = null;

  get list(): ICompany[] {
    return this._list;
  }

  get current(): ICompany | null {
    return this._current;
  }

  @Mutation
  set(company: ICompany[]): void {
    this._list = company;
  }

  @Mutation
  setCurrent(company?: ICompany): void {
    const { path } = router.currentRoute;
    if (path === '/companies/choose-company') {
      store.commit('auth/setLoadingSession', true);
    }

    const token = store.getters['auth/token'];

    // store.reset({
    //   self: false,
    //   nested: false,
    //   modules: {
    //     auth: { self: true },
    //     axios: { self: true },
    //     companies: { self: true },
    //     axios: { self: true },
    //     system: { self: true },
    //   },
    // });

    console.log(store.state);

    if (company) {
      this._current = company;
      store.commit('axios/setHeaders', {
        Authorization: `Bearer ${token}`,
        'HEADER-CID': company.CID,
      });

      const menusUrl = store.getters['system/menusUrl'] as string[];
      store.dispatch('system/getMenus').then(() => {
        if (menusUrl.length === 0) {
          this._current = null;

          store.commit('axios/setHeaders', {
            Authorization: `Bearer ${store.getters['auth/token']}`,
          });
        } else {
          if (
            (path === '/companies/settings' && company?.ROLE !== 'Owner') ||
            !menusUrl.some(p => !!path.match(p))
          ) {
            router.push(menusUrl[0]);
          }
        }

        store.commit('auth/setLoadingSession', false);
      });
    }

    store.commit('auth/setLoadingSession', false);
  }

  @Action
  async getCompanies(): Promise<ICompany[]> {
    const response = await retry<ICompany[]>({
      axios: api,
      url: '/companies',
    });

    this.set(response.data);
    return response.data;
  }

  @Action
  async create(payload: Record<string, any>): Promise<ICompany> {
    const response = await retry<ICompany>({
      axios: api,
      url: '/companies',
      options: {
        method: 'POST',
        data: payload,
      },
    });

    this.setCurrent(response.data);
    return response.data;
  }

  @Action
  async show(payload: ICompany): Promise<ICompany | undefined> {
    const { path } = router.currentRoute;

    // const response = await retry<ICompany | undefined>({
    //   axios: api,
    //   url: `/companies/${payload}`,
    // });

    if (path === '/companies/choose-company') {
      store.commit('auth/setLoadingSession', true, { root: true });
    }

    if (payload) {
      this.setCurrent(payload);
      store.commit(
        'axios/setHeaders',
        {
          ...store.getters['axios/headers'],
          'HEADER-CID': payload.CID,
        },
        { root: true },
      );

      const menusUrl = store.getters['system/menusUrl'] as string[];

      store.dispatch('system/getMenus').then(() => {
        if (menusUrl.length === 0) {
          this.setCurrent(undefined);
          store.commit(
            'axios/setHeaders',
            {
              Authorization: `Bearer ${store.getters['auth/token']}`,
            },
            { root: true },
          );
        } else {
          if (
            (path === '/companies/settings' && payload?.ROLE !== 'Owner') ||
            !menusUrl.some(p => !!path.match(p))
          ) {
            router.push(menusUrl[0]);
          }
        }

        store.commit('auth/setLoadingSession', false, { root: true });
      });
    }

    return payload;
  }
}
