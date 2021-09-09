import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators';

import { auth, retry } from '@/services/axios';

import router from '@/router';

import store from '@/store';
import { ICountry } from '../system/countries';
import { ITimezone } from '../system/timezones';

export interface IRegister {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  timezone_id: number;
  country_id: number;
  notifications: boolean;
  acceptedTerms: boolean;
}

export interface IRegisterResponse {
  token: string;
  user: IUser;
}

export interface IUser {
  HUID: string;
  EMAIL: string;
  FIRST_NAME: string;
  LAST_NAME: string;
  BIRTHDAY: string | null;
  GENDER: 'F' | 'M' | 'NA';
  LANGUAGE_CODE: string;
  MOBILE: string;
  PHONE_NUMBER: string | null;
  TIMEZONE: ITimezone;
  COUNTRY: ICountry;
  CREATED_AT: string;
  UPDATED_AT: string;
}

export interface IUserLogged {
  huid: string;
  email: string;
  first_name: string;
  last_name: string;
}

@Module({ dynamic: true, store, name: 'user', namespaced: true })
export default class User extends VuexModule {
  _userProfile: IUserLogged | null = null;

  get profile(): IUserLogged | null {
    return this._userProfile;
  }

  @Mutation
  set(profile: IUserLogged): void {
    this._userProfile = profile;
  }

  @Mutation
  remove(): void {
    this._userProfile = null;
  }

  @Action
  async register(payload: IRegister): Promise<IUser> {
    const response = await retry<IRegisterResponse>({
      axios: auth,
      url: '/auth/register',
      options: {
        method: 'POST',
        data: payload,
      },
    });

    store.commit('auth/success', response.data.token);
    store.commit('axios/setHeaders', {
      Authorization: `Bearer ${response.data.token}`,
    });

    this.set({
      huid: response.data.user.HUID,
      email: response.data.user.EMAIL,
      first_name: response.data.user.FIRST_NAME,
      last_name: response.data.user.LAST_NAME,
    });
    router.push('/companies/choose-company');
    // router.push(`/auth/verify-email`);
    return response.data.user;
  }

  async checkPassword(payload: string): Promise<boolean> {
    const response = await retry<boolean>({
      axios: auth,
      url: '/auth/verify-password',
      options: {
        method: 'POST',
        data: {
          password: payload,
        },
      },
    });

    return response.data;
  }
}
