<template>
  <div class="b-forgotPassword">
    <img class="forgotPassword-logo" src="@/assets/logo.svg" alt="Header" />
    <div class="forgotPassword-title">
      {{ $t('forgotPassword.welcome') }}
    </div>
    <div class="forgotPassword-subTitle">
      {{ $t('forgotPassword.messageForgotPassword') }}
    </div>

    <v-form v-model="valid" class="forgotPassword" @submit.prevent="signUp">
      <v-text-field
        v-model="form.email"
        outlined
        dense
        class="email"
        color="rgba(0,0,0,0.9)"
        :label="$t('signUp.form.email')"
        :rules="[rules.required]"
      />

      <div class="actions">
        <v-btn
          type="submit"
          color="#fa4600"
          class="white--text reset-email"
          depressed
          tile
          :disabled="!valid"
        >
          {{ $t('forgotPassword.form.reset') }}
        </v-btn>
        <router-link class="back align-self-center" to="/auth/login">
          {{ $t('forgotPassword.form.back') }}
        </router-link>
      </div>
    </v-form>

    <div class="have-account">
      {{ $t('login.dialog.haveAccount') }}

      <router-link class="create-account" to="auth/SignUp">
        {{ $t('login.dialog.linkHaveAccount') }}
      </router-link>
    </div>
    <span class="bottom-itens">
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
    </span>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { Getter, Mutation, Action } from 'vuex-class';

import { ILanguage } from '@/store/modules/system';
import { Rules } from '@/utils/types';

declare const dataLayer: any;

interface LoginForm {
  email: string;
}

@Component
export default class forgotPassword extends Vue {
  private valid = false;
  private form: LoginForm = {
    email: '',
  };

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

  @Mutation('system/setLocale')
  private setLocale!: (data: ILanguage) => void;

  @Mutation('auth/remove')
  private clearError!: () => void;

  @Action('auth/forgotPassword')
  private forgotPassword!: (data: string) => Promise<void>;

  recoveryPassword(): void {
    this.$log.debug(`Forgot password to ${this.form.email}`);

    this.forgotPassword(this.form.email);
  }

  mounted(): void {
    this.$i18n.locale = this.locale.key;
    this.clearError();

    dataLayer.push({
      event: 'DXLogin',
    });

    this.$log.debug('HEADER DX is ready');
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
.b-forgotPassword {
  min-width: 390px;
  width: 65%;
  margin-top: 80px;
  padding: 20px 80px 15px 80px;

  .forgotPassword-title {
    margin-top: 47px;
    font-size: 32px;
    font-weight: 500;
  }

  .forgotPassword-subTitle {
    font-size: 14px;
    font-weight: 300;
    margin-bottom: 25px;
  }

  .forgotPassword-logo {
    width: 107px;
    margin-right: 360px;
  }

  .email {
    width: 400px;
    height: 50px;
    margin: 20px 0px;
  }

  .actions {
    margin-top: 10px;
    display: flex;
    align-items: center;
    column-gap: 30px;

    .email {
      width: 90%;
    }

    .reset-password,
    .back {
      width: 163px;
      cursor: pointer;
    }
  }

  button {
    min-width: 124px !important;

    &:not(:first-child) {
      margin-left: 12px;
    }
  }

  .notice {
    width: 100%;
    margin: 25px 0px 15px 0px;
    font-size: 1.2em !important;
    color: rgba(#000000, 0.7);
  }

  .name-inputs {
    display: flex;
    align-items: center;
    column-gap: 12px;
  }

  .have-account {
    margin: 105px 0px 0px 10px;
    position: absolute;

    .create-account {
      border-bottom: 1px solid rgba(#000000, 0.9);
      color: rgba(#000000, 0.9);

      &:hover {
        opacity: 0.8;
      }
    }
  }

  .bottom-itens {
    width: 100%;
    display: flex;
    justify-content: left;

    .privacy-policy {
      position: absolute;
      margin-top: 247px;
      margin-left: 200px;
      font-size: 12px;
      color: rgba(0, 0, 0, 0.54) !important;

      &:hover {
        opacity: 0.8;
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
      left: 70px;
      min-width: 146px !important;
      max-width: 146px;
      padding: 0 !important;
      height: 40px !important;
      justify-content: baseline;
      font-weight: 400;
      letter-spacing: 0;
      display: flex;
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
  }
}
/* Responsividade notebook*/
@media (max-width: 1000px) {
  .b-forgotPassword {
    min-width: 390px;
    width: 70%;
    padding: 10px 100px 0px 50px;

    .forgotPassword-title {
      margin-top: 47px;
      font-size: 26px;
      font-weight: 500;
    }

    .forgotPassword-subTitle {
      font-size: 14px;
      font-weight: 300;
      margin-bottom: 25px;
    }

    .forgotPassword-logo {
      width: 107px;
      margin-right: 360px;
    }

    .email {
      width: 100%;
      height: 50px;
      margin: 20px 0px;
    }

    .actions {
      margin-top: 10px;
      display: flex;
      align-items: center;
      column-gap: 30px;

      .email {
        width: 90%;
      }

      .reset-password,
      .back {
        width: 163px;
        cursor: pointer;
      }
    }

    button {
      min-width: 124px !important;

      &:not(:first-child) {
        margin-left: 12px;
      }
    }

    .notice {
      width: 100%;
      margin: 25px 0px 15px 0px;
      font-size: 1.2em !important;
      color: rgba(#000000, 0.7);
    }

    .name-inputs {
      display: flex;
      align-items: center;
      column-gap: 12px;
    }

    .have-account {
      margin: 2px 0px 0px 110px;
      padding-top: 252px;
      position: absolute;

      .create-account {
        border-bottom: 1px solid rgba(#000000, 0.9);
        color: rgba(#000000, 0.9);

        &:hover {
          opacity: 0.8;
        }
      }
    }

    .bottom-itens {
      width: 100%;
      display: flex;
      justify-content: left;

      .privacy-policy {
        position: absolute;
        margin-top: 150px;
        right: 0px;
        bottom: 0px;
        font-size: 12px;
        color: rgba(0, 0, 0, 0.54) !important;

        &:hover {
          opacity: 0.8;
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
        bottom: 30px;
        left: 30px;
        min-width: 146px !important;
        max-width: 146px;
        padding: 0 !important;
        height: 40px !important;
        justify-content: baseline;
        font-weight: 400;
        letter-spacing: 0;
        display: flex;
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
    }
  }
}

/* Responsividade tablet*/
@media (max-width: 800px) {
  .b-forgotPassword {
    min-width: 390px;
    width: 100%;
    padding: 0px 140px 10px 90px;
    display: flex;
    flex-direction: column;

    .forgotPassword-logo {
      width: 107px;
      height: 16.11px;
      margin: 15px 240px 0px 0px;
    }

    .forgotPassword-title {
      width: 310px;
      height: 28px;
      margin: 44px 40px 14px 0px;
      font-size: 2.6em;
      font-weight: 500;
      font-family: 'Axiforma';
    }

    .forgotPassword-subTitle {
      width: 169px;
      height: 11px;
      margin: 15px 170px 60px 0px;
      font-size: 1.5em;
      font-weight: 500;
      font-family: 'Axiforma';
    }

    .password {
      width: 320px;
      height: 42px;
      margin: 0px 30px 45px 0px;
    }

    .actions {
      .reset-password {
        width: 124px;
        display: inline;
      }

      .back {
        width: 124px;
        background-color: #fff;
        color: #000000;
        margin-left: 50px;
      }
    }

    button {
      min-width: 124px !important;

      &:not(:first-child) {
        margin-left: 12px;
      }
    }

    .notice {
      width: 100%;
      margin: 25px 0px 15px 0px;
      font-size: 1.2em !important;
      color: rgba(#000000, 0.7);
    }

    .name-inputs {
      display: flex;
      align-items: center;
      column-gap: 12px;
    }

    .have-account {
      margin: 160px 40px 0px 40px;
      position: absolute;
      font-size: 12px;
      width: 60%;
      text-align: center;

      .create-account {
        border-bottom: 1px solid rgba(#000000, 0.9);
        color: rgba(#000000, 0.9);
        display: inline;

        &:hover {
          opacity: 0.8;
        }
      }
    }

    .bottom-itens {
      width: 100%;
      display: flex;
      justify-content: left;

      .privacy-policy {
        position: absolute;
        right: 110px;
        bottom: 32px;
        font-size: 12px;
        color: rgba(0, 0, 0, 0.54) !important;

        &:hover {
          opacity: 0.8;
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
        left: 100px;
        min-width: 146px !important;
        max-width: 146px;
        padding: 0 !important;
        height: 40px !important;
        justify-content: baseline;
        font-weight: 400;
        letter-spacing: 0;
        display: flex;
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
    }
  }
}
/* Responsividade Mobile*/
@media (max-width: 600px) {
  .b-forgotPassword {
    min-width: 390px;
    width: 100%;
    /* padding: 0px 70px 10px 40px; */
    padding: 0px 40px 80px 30px;
    display: flex;
    flex-direction: column;

    .forgotPassword-logo {
      width: 107px;
      height: 16.11px;
      margin: 15px 240px 0px 0px;
    }

    .forgotPassword-title {
      width: 310px;
      height: 28px;
      margin: 44px 40px 10px 0px;
      font-size: 2.6em;
      font-weight: 500;
      font-family: 'Axiforma';
    }

    .forgotPassword-subTitle {
      width: 169px;
      height: 11px;
      margin: 0px 170px 60px 0px;
      font-size: 1.5em;
      font-weight: 500;
      font-family: 'Axiforma';
    }

    .password {
      width: 320px;
      height: 42px;
      margin: 0px 30px 45px 0px;
    }

    .actions {
      .email {
        width: 100%;
      }

      .reset-password {
        width: 124px;
        display: inline;
      }

      .back {
        width: 124px;
        background-color: #fff;
        color: #000000;
        margin-left: 50px;
      }
    }

    button {
      min-width: 124px !important;

      &:not(:first-child) {
        margin-left: 12px;
      }
    }

    .notice {
      width: 100%;
      margin: 25px 0px 15px 0px;
      font-size: 1.2em !important;
      color: rgba(#000000, 0.7);
    }

    .name-inputs {
      display: flex;
      align-items: center;
      column-gap: 12px;
    }

    .have-account {
      margin: 160px 40px 0px 40px;
      position: absolute;
      font-size: 12px;
      width: 60%;
      text-align: center;

      .create-account {
        border-bottom: 1px solid rgba(#000000, 0.9);
        color: rgba(#000000, 0.9);
        display: inline;

        &:hover {
          opacity: 0.8;
        }
      }
    }

    .bottom-itens {
      width: 100%;
      display: flex;
      justify-content: left;

      .privacy-policy {
        position: absolute;
        width: 100%;
        margin: 0px -75px 20px;
        right: 0px;
        bottom: 0px;
        font-size: 14px;
        color: rgba(0, 0, 0, 0.54) !important;

        &:hover {
          opacity: 0.8;
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
        font-size: 1.5em;
        letter-spacing: 0;
      }

      .language {
        position: absolute;
        margin: 0px 150px 100px;
        bottom: 0px;
        left: 0px;
        min-width: 146px !important;
        max-width: 146px;
        padding: 0 !important;
        height: 40px !important;
        justify-content: baseline;
        font-weight: 400;
        letter-spacing: 0;
        display: flex;
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
            font-size: 1.5em;
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
    }
  }
}
</style>
