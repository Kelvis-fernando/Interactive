<template>
  <div class="b-verify-email">
    <v-form v-model="valid[1]" class="verify-email" @submit.prevent>
      <img class="verify-email-logo" src="@/assets/logo.svg" alt="Header" />
      <div class="Verify-email-title">
        {{ $t('VerifyEmail.step1.title') }}
      </div>
      <div class="Verify-email-subTitle">
        {{ $t('VerifyEmail.step1.subTitle') }}
      </div>
      <div class="verify-email-asset">
        <img
          class="verify-email-asset"
          src="@/assets/resend-email.png"
          alt="Header"
        />
      </div>
      <div class="Verify-email-checkEmail">
        {{ $t('VerifyEmail.step1.checkEmail') }}
      </div>
      <div class="actions">
        <router-link class="btn-resend" to="/auth/sign-up">
          {{ $t('VerifyEmail.step1.resend') }}
        </router-link>
      </div>

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
    </v-form>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { Getter, Action, Mutation } from 'vuex-class';

import { api, retry } from '@/services/axios';
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
  private rules = {
    required: (value: string | undefined) =>
      !!value || this.$t('formRules.required.error'),

    min: (v: string | undefined) =>
      (v && v.length >= 8) || this.$t('formRules.min.error', { n: 8 }),
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
/* Start Step 1 */
.b-verify-email {
  min-width: 400px;
  margin-bottom: 100px;
  padding: 0px 0px 0px 20px;

  .verify-email {
    margin-top: 70px;

    .verify-email-logo {
      width: 107px;
      margin-bottom: 50px;
      margin-left: 110px;
    }

    .Verify-email-title {
      width: 100%;
      font-size: 32px;
      font-weight: 500;
      margin-left: 110px;
    }

    .Verify-email-subTitle {
      width: 100%;
      padding-top: 5px;
      margin-left: 110px;
      font-size: 14px;
      font-weight: 500;
    }
  }

  .verify-email-asset {
    margin: 15px auto;
    width: 100px;
    height: 110px;
  }

  .Verify-email-checkEmail {
    text-align: center;
    font-size: 16px;
    width: 408px;
    height: 57px;
    margin: 15px auto;
    padding-top: 20px;
    width: 70%;
  }

  .actions {
    margin: 20px auto;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;

    .btn-resend {
      border-bottom: 1px #707070 solid;
      padding: 0px;
      color: #707070;
      font-size: 14px;
      margin-top: 40px;
    }
  }

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
    display: none;

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

  .privacy-policy {
    color: rgba(#000000, 0.6);
    font-size: inherit !important;
    display: none;
  }
}
/* End Step 1 */
@media (max-width: 1000px) {
  /* Start Step 1 */
  .b-verify-email {
    min-width: 400px;
    margin-bottom: 100px;
    padding: 0px 0px 0px 0px;

    .verify-email {
      margin-top: 70px;

      .verify-email-logo {
        width: 107px;
        margin-bottom: 50px;
        margin-left: 110px;
      }

      .Verify-email-title {
        width: 80%;
        font-size: 32px;
        font-weight: 500;
        margin-left: 110px;
      }

      .Verify-email-subTitle {
        width: 80%;
        padding-top: 5px;
        margin-left: 110px;
        font-size: 14px;
        font-weight: 500;
      }
    }

    .verify-email-asset {
      margin-top: 15px;
      width: 100px;
      height: 110px;
    }

    .Verify-email-checkEmail {
      text-align: center;
      font-size: 14 px;
      width: 70%;
      margin-left: 110px;
      margin-top: 15px;
      padding-top: 20px;
    }

    .actions {
      margin: 20px auto;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;

      .btn-resend {
        border-bottom: 1px #707070 solid;
        padding: 0px;
        color: #707070;
        font-size: 14px;
        margin-top: 40px;
      }
    }

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
      display: none;

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

    .privacy-policy {
      color: rgba(#000000, 0.6);
      font-size: inherit !important;
      display: none;
    }
  }
  /* End Step 1 */
}

@media (max-width: 600px) {
  /* Start Step 1 */
  .b-verify-email {
    padding: 0px 5px 0px 10px;
    min-width: 400px;
    margin-bottom: 0px;
    height: 100vh;

    .verify-email {
      margin-top: 70px;

      .verify-email-logo {
        width: 107px;
        margin-bottom: 50px;
        margin-left: 10px;
      }

      .Verify-email-title {
        width: 80%;
        font-size: 26px;
        font-weight: 500;
        margin-left: 10px;
      }

      .Verify-email-subTitle {
        width: 70%;
        padding-top: 0px;
        margin-left: 10px;
        font-size: 14px;
        font-weight: 500;
      }
    }

    .verify-email-asset {
      margin-left: 55px;
      margin-top: 15px;
      width: 100px;
      height: 110px;
    }

    .Verify-email-checkEmail {
      text-align: center;
      font-size: 12px;
      width: 80%;
      margin-left: 10px;
      margin-top: 15px;
    }

    .actions {
      margin-left: 10px;

      .btn-resend {
        border-bottom: 1px #707070 solid;
        padding: 0px;
        color: #707070;
        font-size: 14px;
        margin-top: 60px;
        margin-left: -70px;
      }
    }

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
      bottom: 15px;
      min-width: 146px !important;
      max-width: 146px;
      padding: 0 !important;
      height: 40px !important;
      font-weight: 400;
      display: flex;

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

    .privacy-policy {
      width: 100%;
      position: absolute;
      margin: 150px 45px 0px;
      color: rgba(#000000, 0.6);
      font-size: 12px !important;
      display: flex;
    }
  }
  /* End Step 1 */
}
</style>
