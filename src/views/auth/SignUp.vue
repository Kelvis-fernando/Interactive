<template>
  <v-stepper v-model="step">
    <v-stepper-items>
      <!-- Social login Facebook -->
      <v-stepper-content :step="1">
        <h-facebook-sign-up />
      </v-stepper-content>
      <!-- Sign-up inputs screen -->
      <v-stepper-content :step="2">
        <h-register />
      </v-stepper-content>
    </v-stepper-items>
  </v-stepper>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { Getter, Action, Mutation } from 'vuex-class';

import { api, retry } from '@/services/axios';
import { ICompany } from '@/store/modules/companies';
import { ILanguage } from '@/store/modules/system';
import { ICurrency } from '@/store/modules/system/currencies';

import { Sdk } from '@/plugins/facebook';

interface Form {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  timezone_id: number;
  country_id: number;
  notifications: boolean;
  acceptedTerms: boolean;
}

@Component
export default class SignUp extends Vue {
  private valid = {
    1: false,
    2: false,
    3: false,
  };

  private termsOfService = '';
  private progress = 100 / 3;
  private loading = false;
  private step: 1 | 2 | 3 = 1;
  private steps = 3;
  private form: Form = {
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    timezone_id: 0,
    country_id: 0,
    notifications: false,
    acceptedTerms: false,
  };
  private rules = {
    required: (value: string | undefined) =>
      !!value || this.$t('formRules.required.error'),

    min: (v: string | undefined) =>
      (v && v.length >= 8) || this.$t('formRules.min.error', { n: 8 }),
  };

  @Getter('system/locale')
  private locale!: ILanguage;

  @Getter('companies/list')
  private companies!: ICompany[];

  @Mutation('auth/destroy')
  private logout!: () => Promise<void>;

  @Mutation('system/setLoading')
  private setLoading!: (data: boolean) => void;

  @Mutation('system/setLocale')
  private setLocale!: (data: ILanguage) => void;

  @Action('timezones/index')
  private getTimezones!: () => void;

  @Action('currencies/index')
  private getCurrencies!: () => ICurrency[];

  @Action('countries/index')
  private getCountries!: () => void;

  @Action('user/register')
  private register!: (data: Form) => Promise<void>;

  @Action('companies/store')
  private createCompany!: (data: Form) => Promise<ICompany>;

  beforeMount(): void {
    this.getTimezones();
    this.getCountries();
  }

  toLogin(): void {
    this.$router.push('/auth/login');
  }

  signUp(): void {
    this.$log.debug(`Sign up with ${this.form.email}`);
    this.loading = true;

    this.register(this.form)
      .then(() => {
        this.loading = false;
      })
      .catch(() => {
        this.loading = false;
      });
  }

  nextStep(): void {
    if (!this.valid[this.step]) return;
    if (this.step === this.steps) return this.save();
    if (this.step === 1) {
      this.getCountries();
      this.getCurrencies();

      retry<Record<string, string>>({
        axios: api,
        url: `/terms/${this.$i18n.locale}`,
      }).then(res => {
        this.termsOfService = res.data.message;
      });
    }
    this.progress += 100 / (this.steps - 1);
    this.step += 1;
  }

  save(): void {
    this.setLoading(true);
    this.createCompany(this.form)
      .then(() => {
        this.$router.push('/companies/choose-company');
      })
      .catch(() => {
        this.setLoading(false);
      });
  }

  async facebookClick(): Promise<void> {
    const sdk = await Sdk.subscribe({
      appId: process.env.VUE_APP_FACEBOOK_APP_ID,
      version: 'v11.0',
      cookie: true,
      xfbml: true,
      autoLogAppEvents: true,
    });

    return await Sdk.login({
      scope: 'email,public_profile',
    }).then(async res => {
      if (!res.authResponse) return;
      await sdk.api(
        '/me',
        {
          fields: 'id,email,first_name,last_name',
        },
        (profile: {
          id: string;
          email: string;
          first_name: string;
          last_name: string;
        }) => {
          this.form.email = profile.email;
          this.form.first_name = profile.first_name;
          this.form.last_name = profile.last_name;
          this.nextStep();
        },
      );
    });
  }
}
</script>
