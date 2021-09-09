<template>
  <v-menu offset-y top>
    <template #activator="{ on }">
      <v-btn class="language" tile depressed text :ripple="false" v-on="on">
        <img :src="localeImg(locale.name)" :alt="locale.name" />
        {{ $t(`languages.${locale.name}`) }}
      </v-btn>
    </template>

    <v-list class="box-language">
      <v-list-item
        v-for="lang in showLanguages"
        :key="lang.key"
        style="padding-left: 0"
        @click="changeLocale(lang)"
      >
        <img :src="localeImg(lang.name)" :alt="lang.name" />
        <v-list-item-title>
          {{ $t(`languages.${lang.name}`) }}
        </v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { Getter, Mutation } from 'vuex-class';

import { ILanguage } from '@/store/modules/system';
import { Rules } from '@/utils/types';

declare const dataLayer: any;

@Component
export default class Language extends Vue {
  private userLang = 'en-us';

  private rules: Rules = {
    required: v => !!v || this.$t('formRules.required.error'),
    min: v => (v && v.length >= 8) || this.$t('formRules.min.error', { n: 8 }),
  };

  get showLanguages(): ILanguage[] {
    return this.languages.filter(l => l.key !== this.locale.key);
  }

  @Getter('system/languages')
  private languages!: ILanguage[];

  @Getter('system/locale')
  private locale!: ILanguage;

  @Getter('auth/isLoading')
  private isLoading!: boolean;

  @Getter('auth/hasError')
  private hasError!: boolean;

  @Mutation('auth/remove')
  private clearError!: () => void;

  @Mutation('system/setLocale')
  private setLocale!: (data: ILanguage) => void;

  mounted(): void {
    this.$i18n.locale = this.locale.key;
    this.clearError();

    dataLayer.push({
      event: 'DXLogin',
    });
  }

  localeImg(img: string): any {
    const images = require.context('@/assets/locales', false, /\.svg$/);
    return images(`./${img}.svg`);
  }

  changeLocale(lang: ILanguage): void {
    this.$i18n.locale = lang.key;
    this.setLocale(lang);
  }

  created(): void {
    this.userLang = navigator.language;
    if (this.userLang) this.userLang = this.userLang.toLowerCase();
  }
}
</script>

<style lang="scss" scoped>
.box-language {
  padding: 0;
  background-color: #f0f0f0;

  img {
    margin-right: 8px;
  }
}

.box-language > div {
  min-height: 40px !important;
  padding-left: 0;
}

.box-language > div > div {
  font-size: 1.2em;
  letter-spacing: 0;
}

.language {
  position: absolute;
  bottom: 20px;
  min-width: 146px !important;
  max-width: 146px;
  padding: 0 !important;
  height: 40px !important;
  justify-content: baseline;
  font-weight: 400;
  letter-spacing: 0;
  justify-content: left !important;
  text-align: left !important;

  span {
    img {
      margin-right: 10px;
    }
  }
}
/* user settings */
.menu-languages {
  border: none !important;

  .box-language {
    padding: 0;

    & > div > div {
      font-size: 1.2em;
      letter-spacing: 0;
    }

    & > div {
      min-width: 40px !important;
    }

    img {
      margin-right: 8px;
    }
  }
}
</style>
