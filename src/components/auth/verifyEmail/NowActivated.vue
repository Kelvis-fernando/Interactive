<template>
  <div class="account-activated">
    <img class="verify-email-logo-step2" src="@/assets/logo.svg" alt="Header" />
    <div class="Verify-email-title-step2">
      {{ $t('VerifyEmail.step2.title') }}
    </div>
    <div class="Verify-email-subTitle-step2">
      {{ $t('VerifyEmail.step2.subTitle') }}
    </div>
    <span>
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
      <a
        class="privacy-policy"
        :href="
          locale.key === 'pt-br'
            ? 'https://headerinteractive.com/legal/politica-de-privacidade.html'
            : 'https://headerinteractive.com/legal/privacy-policy.html'
        "
        target="_blank"
      >
        {{ $t('login.privacy') }}
      </a>
    </span>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { Getter, Action, Mutation } from 'vuex-class';

import { api, retry } from '@/services/axios';
import { Rules } from '@/utils/types';
import { ILanguage } from '@/store/modules/system';

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

  nextStep(): void {
    if (!this.valid[this.step]) return;
    if (this.step === this.steps) return this.save();
    if (this.step === 1) {
      this.getCountries();

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

<style lang="scss" scoped>
/* Start Step 2 */
.account-activated {
  min-width: 390px;
  width: 100%;
  height: 100vh;
  padding: 75px 20px 100px 70px;

  .Verify-email-logo-step2 {
    width: 107px;
  }

  .Verify-email-title-step2 {
    width: 100%;
    padding-top: 30px;
    margin: 10px -10px 0px 0px;
    font-size: 32px;
    font-weight: 500;
  }

  .Verify-email-subTitle-step2 {
    width: 100%;
    padding: 5px 64px 0px 0px;
    margin: 5px -10px 40px 0px;
    font-size: 14px;
    font-weight: 300;
  }

  .actions-step2 {
    margin-top: 40px;

    .login-page {
      color: #707070;
      padding-bottom: 2px;
      border-bottom: 1px #707070 solid;
    }
  }

  .language {
    position: absolute;
    min-width: 146px !important;
    max-width: 146px;
    height: 40px !important;
    font-weight: 400;
    margin-top: 240px;
    margin-left: -20px;

    span {
      img {
        margin-right: 10px;
      }
    }
  }

  .box-language {
    padding: 0;
    background-color: #f0f0f0;

    & > div {
      min-height: 40px !important;
      padding-left: 0;

      & > div {
        font-size: 1.2em;
        letter-spacing: 0;
      }
    }

    img {
      margin-right: 8px;
    }
  }

  .privacy-policy {
    position: absolute;
    margin-top: 253px;
    margin-left: 190px;
    font-size: 1.2em;
    color: rgba(0, 0, 0, 0.54) !important;

    &:hover {
      opacity: 0.8;
    }
  }
}
/* End Step 2 */

/* Responsividade para telas pequenas */
@media (max-width: 1000px) {
  /* Start Step 2 */
  .account-activated {
    min-width: 390px;
    width: 100%;
    height: 100vh;
    padding: 75px 0px 100px 20px;

    .Verify-email-logo-step2 {
      width: 107px;
    }

    .Verify-email-title-step2 {
      width: 80%;
      padding-top: 30px;
      margin: 10px -10px 0px 0px;
      font-size: 28px;
      font-weight: 500;
    }

    .Verify-email-subTitle-step2 {
      width: 80%;
      padding: 5px 64px 0px 0px;
      margin: 5px -10px 40px 0px;
      font-size: 12px;
      font-weight: 400;
    }

    .actions-step2 {
      margin-top: 40px;

      .login-page {
        color: #707070;
        padding-bottom: 2px;
        border-bottom: 1px #707070 solid;
      }
    }

    .language {
      position: absolute;
      min-width: 146px !important;
      max-width: 146px;
      height: 40px !important;
      font-weight: 400;
      margin-top: 240px;
      margin-left: -20px;

      span {
        img {
          margin-right: 10px;
        }
      }
    }

    .box-language {
      padding: 0;
      background-color: #f0f0f0;

      & > div {
        min-height: 40px !important;
        padding-left: 0;

        & > div {
          font-size: 1.2em;
          letter-spacing: 0;
        }
      }

      img {
        margin-right: 8px;
      }
    }

    .privacy-policy {
      position: absolute;
      margin-top: 250px;
      margin-left: 150px;
      font-size: 12px;
      color: rgba(0, 0, 0, 0.54) !important;

      &:hover {
        opacity: 0.8;
      }
    }
  }
  /* End Step 2 */
}

/* Responsividade para rablets */
@media (max-width: 800px) {
  /* Start Step 2 */
  .account-activated {
    min-width: 390px;
    width: 100%;
    height: 100vh;
    padding: 75px 0px 100px 100px;

    .Verify-email-logo-step2 {
      width: 107px;
    }

    .Verify-email-title-step2 {
      width: 100%;
      padding-top: 30px;
      margin: 10px -10px 0px 0px;
      font-size: 28px;
      font-weight: 500;
    }

    .Verify-email-subTitle-step2 {
      width: 80%;
      padding: 5px 64px 0px 0px;
      margin: 5px -10px 40px 0px;
      font-size: 12px;
      font-weight: 400;
    }

    .actions-step2 {
      margin-top: 40px;

      .login-page {
        color: #707070;
        padding-bottom: 2px;
        border-bottom: 1px #707070 solid;
      }
    }

    .language {
      position: absolute;
      min-width: 146px !important;
      max-width: 146px;
      height: 40px !important;
      font-weight: 400;
      margin-top: 240px;
      margin-left: -20px;

      span {
        img {
          margin-right: 10px;
        }
      }
    }

    .box-language {
      padding: 0;
      background-color: #f0f0f0;

      & > div {
        min-height: 40px !important;
        padding-left: 0;

        & > div {
          font-size: 1.2em;
          letter-spacing: 0;
        }
      }

      img {
        margin-right: 8px;
      }
    }

    .privacy-policy {
      position: absolute;
      margin-top: 250px;
      margin-left: 150px;
      font-size: 12px;
      color: rgba(0, 0, 0, 0.54) !important;

      &:hover {
        opacity: 0.8;
      }
    }
  }
  /* End Step 2 */
}

@media (max-width: 600px) {
  /* Start Step 2 */
  .account-activated {
    min-width: 390px;
    width: 100%;
    height: 100vh;
    padding: 75px 20px 100px 10px;

    .Verify-email-logo-step2 {
      width: 107px;
    }

    .Verify-email-title-step2 {
      width: 80%;
      padding-top: 0px;
      margin: 30px 0px 0px;
      font-size: 26px;
      font-weight: 500;
    }

    .Verify-email-subTitle-step2 {
      width: 90%;
      padding: 0px;
      margin: 15px 0px 0px;
      font-size: 14px;
      font-weight: 300;
    }

    .actions-step2 {
      margin-top: 40px;

      .login-page {
        color: #707070;
        padding-bottom: 2px;
        border-bottom: 1px #707070 solid;
      }
    }

    .language {
      position: absolute;
      min-width: 146px !important;
      max-width: 146px;
      height: 40px !important;
      font-weight: 400;
      margin: 330px 80px 0px;

      span {
        img {
          margin-right: 10px;
        }
      }
    }

    .box-language {
      padding: 0;
      background-color: #f0f0f0;

      & > div {
        min-height: 40px !important;
        padding-left: 0;

        & > div {
          font-size: 1.2em;
          letter-spacing: 0;
        }
      }

      img {
        margin-right: 8px;
      }
    }

    .privacy-policy {
      position: absolute;
      width: 300px;
      margin: 400px 30px 0px;
      font-size: 1.2em;
      color: rgba(0, 0, 0, 0.54) !important;

      &:hover {
        opacity: 0.8;
      }
    }
  }
  /* End Step 2 */
}
/* End Step 2 */
</style>
