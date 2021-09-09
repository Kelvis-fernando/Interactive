<template>
  <v-stepper v-model="step">
    <v-stepper-items>
      <v-stepper-content :step="1">
        <h-validate-account />
      </v-stepper-content>

      <v-stepper-content :step="2">
        <h-now-activated />
      </v-stepper-content>
    </v-stepper-items>
  </v-stepper>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { Getter, Action, Mutation } from 'vuex-class';

import { ILanguage } from '@/store/modules/system';
import { Rules } from '@/utils/types';

@Component
export default class VerifyEmail extends Vue {
  private valid = {
    1: false,
    2: false,
    3: false,
  };

  private userLang = 'en-us';
  private termsOfService = '';
  private progress = 100 / 3;
  private loading = false;
  private step: 1 | 2 | 3 = 1;
  private steps = 3;
  private rules: Rules = {
    required: value => !!value || this.$t('formRules.required.error'),

    min: v => (v && v.length >= 8) || this.$t('formRules.min.error', { n: 8 }),
  };

  get showLanguages(): ILanguage[] {
    return this.languages.filter(l => l.key !== this.locale.key);
  }

  @Getter('system/languages')
  private languages!: ILanguage[];

  @Getter('system/locale')
  private locale!: ILanguage;

  @Mutation('system/setLoading')
  private setLoading!: (data: boolean) => void;

  @Mutation('system/setLocale')
  private setLocale!: (data: ILanguage) => void;

  @Action('countries/index')
  private getCountries!: () => void;

  created(): void {
    this.userLang = navigator.language;
    if (this.userLang) this.userLang = this.userLang.toLowerCase();
  }

  localeImg(img: string): any {
    const images = require.context('@/assets/locales', false, /\.svg$/);
    return images(`./${img}.svg`);
  }

  changeLocale(lang: ILanguage): void {
    this.$i18n.locale = lang.key;
    this.setLocale(lang);
  }
}
</script>
