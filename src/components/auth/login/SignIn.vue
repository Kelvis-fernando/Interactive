<template>
  <div class="login-content">
    <img class="login-logo" src="@/assets/logo.svg" alt="Header" />
    <div class="box-login">
      <div class="box-welcome">
        <div class="welcome-message">
          {{ $t('welcome') }}
        </div>
        <div class="login-message">
          {{ $t('login.welcome') }}
        </div>
      </div>

      <v-form v-model="valid" class="login" @submit.prevent="login">
        <v-text-field
          id="email"
          v-model="form.email"
          class="email"
          outlined
          dense
          type="email"
          name="email"
          autocomplete="email"
          color="rgba(0,0,0,0.9)"
          :label="$t('login.form.email')"
          :error="hasError"
          :rules="[rules.required]"
          @click="clearError"
          @change="clearError"
          @focus="clearError"
        />
        <v-icon right>fas fa-lock</v-icon>

        <v-text-field
          id="password"
          v-model="form.password"
          class="password"
          outlined
          dense
          type="password"
          color="rgba(0,0,0,0.9)"
          :label="$t('login.form.password')"
          :hint="$t('formRules.min.hint', { n: 8 })"
          :rules="[rules.required, rules.min]"
          :error="hasError"
          @change="clearError"
          @focus="clearError"
          @keydown="clearError"
        />

        <v-text-field
          :value="$i18n.locale"
          class="user-lang"
          type="text"
          :style="{ display: 'none' }"
          color="rgba(0,0,0,0.9)"
        />

        <div class="actions-h">
          <div class="actions">
            <v-btn
              class="button-login white--text"
              type="submit"
              color="#fa4600"
              :disabled="!valid"
              tile
              depressed
              :loading="isLoading"
            >
              {{ $t('login.form.login') }}
            </v-btn>

            <div v-if="hasError" class="error--text">
              {{ $t('login.form.error') }}
            </div>
          </div>
          <router-link class="forgotPassword" to="/auth/forgot-password">{{
            $t('login.form.recoveryPassword')
          }}</router-link>
        </div>

        <div class="have-account">
          {{ $t('login.dialog.haveAccount') }}
          <router-link to="/auth/sign-up">{{
            $t('login.dialog.linkHaveAccount')
          }}</router-link>
        </div>
      </v-form>
    </div>

    <v-dialog v-model="dialog" max-width="600" persistent>
      <div class="dialog">
        <h1>{{ $t('login.dialog.title') }}</h1>
        <p>{{ $t('login.dialog.message') }}</p>

        <v-form class="recovery" @submit.prevent="recoveryPassword">
          <v-text-field
            v-model="form.email"
            color="currentColor"
            :label="$t('login.dialog.form.email')"
            :rules="[rules.required]"
          />

          <div class="actions">
            <v-btn
              color="#0000004D"
              outlined
              depressed
              tile
              @click="dialog = !dialog"
            >
              {{ $t('login.dialog.form.cancel') }}
            </v-btn>
            <v-btn
              type="submit"
              color="#fa4600"
              class="white--text"
              depressed
              tile
            >
              {{ $t('login.dialog.form.send') }}
            </v-btn>
          </div>
        </v-form>
      </div>
    </v-dialog>
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
import { ILoginRequest, ILoginResponse } from '@/store/modules/auth';
import { Rules } from '@/utils/types';

declare const dataLayer: any;

interface LoginForm {
  email: string;
  password: string;
  remember: boolean;
}

@Component
export default class Login extends Vue {
  private userLang = 'en-us';
  private valid = false;
  private dialog = false;
  private form: LoginForm = {
    email: '',
    password: '',
    remember: false,
  };
  private password = '';

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

  @Action('auth/loginRequest')
  private loginRequest!: (data: ILoginRequest) => Promise<ILoginResponse>;

  mounted(): void {
    this.$i18n.locale = this.locale.key;
    this.clearError();

    dataLayer.push({
      event: 'DXLogin',
    });

    this.$log.debug('HEADER DX is ready');
  }

  login(): void {
    this.$log.debug(`Login with ${this.form.email}`);

    this.loginRequest(this.form);
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
.v-menu__content:not(.v-autocomplete__content) {
  border: none !important;
}

.login-content {
  position: relative;
  min-width: 390px;
  width: 60%;
  padding: 120px 141px 15px 114px;

  .login-logo {
    width: 107px;
  }

  .box-login {
    display: flex;
    flex-direction: column;
    justify-content: center;
    height: 80%;

    .welcome-message {
      font-size: 32px;
      font-weight: 500;
    }

    .login-message {
      margin-top: 8px;
      margin-bottom: 35px;
      font-weight: 300;
      font-size: 14px;
      color: rgba(#000000, 0.9);
    }

    .actions-h {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      padding: 0;
      margin-top: 15px;

      a {
        align-self: center;
        text-decoration: none;
        color: rgba(#000000, 0.54) !important;
        white-space: nowrap;
      }

      .actions {
        display: flex;
        flex-direction: row;
        display: inline;

        .button-login {
          min-width: 124px !important;
          display: inline;
        }

        .error--text {
          margin-left: 20px;
          align-self: center;
        }

        .actions {
          margin-top: 64px;
          text-align: right;
        }
      }
    }

    .email,
    .password {
      height: 50px;
      margin: -3px 0px;
    }

    .have-account {
      margin: 0px;
      padding-top: 50px;
      font-size: 1.1em;
      line-height: 1.2;

      .create-account {
        border-bottom: 1px solid rgba(#000000, 0.9);
        color: rgba(#000000, 0.9);

        &:hover {
          opacity: 0.8;
        }
      }
    }

    .dialog {
      padding: 48px;
      text-align: center;
      background-color: #ffffff;

      p {
        margin: 10px 0 60px;
      }
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

/* Resposividade pra tablet */
@media (max-width: 1000px) {
  .login-content {
    position: relative;
    min-width: 390px;
    width: 60%;
    padding: 120px 80px 15px 70px;

    .login-logo {
      width: 107px;
    }

    .box-login {
      display: flex;
      flex-direction: column;
      justify-content: center;
      height: 80%;

      .welcome-message {
        font-size: 32px;
        font-weight: 500;
      }

      .login-message {
        margin-top: 8px;
        margin-bottom: 35px;
        font-weight: 300;
        font-size: 14px;
        color: rgba(#000000, 0.9);
      }

      .actions-h {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        padding: 0;
        margin-top: 15px;

        a {
          align-self: center;
          text-decoration: none;
          color: rgba(#000000, 0.54) !important;
          white-space: nowrap;
        }

        .actions {
          display: flex;
          flex-direction: row;
          display: inline;

          .button-login {
            min-width: 124px !important;
            display: inline;
          }

          .error--text {
            margin-left: 20px;
            align-self: center;
          }

          .actions {
            margin-top: 64px;
            text-align: right;
          }
        }
      }

      .email,
      .password {
        height: 50px;
        margin: -3px 0px;
      }

      .have-account {
        margin: 0px;
        padding-top: 50px;
        font-size: 1.1em;
        line-height: 1.2;

        .create-account {
          border-bottom: 1px solid rgba(#000000, 0.9);
          color: rgba(#000000, 0.9);

          &:hover {
            opacity: 0.8;
          }
        }
      }

      .dialog {
        padding: 48px;
        text-align: center;
        background-color: #ffffff;

        p {
          margin: 10px 0 60px;
        }
      }
    }
  }

  .bottom-itens {
    width: 100%;
    display: flex;
    justify-content: left;

    .privacy-policy {
      position: absolute;
      right: 20px;
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
      left: 65px;
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
/* Responsividade Mobile*/
@media (max-width: 800px) {
  .login-content {
    min-width: 360px;
    max-width: 830px;
    width: 100%;
    padding: 50px 40px 80px 30px;

    .login-logo {
      margin-top: 50px;
      margin-left: 3px;
      position: absolute;
      width: 107px;
    }

    .box-login {
      display: flex;
      flex-direction: column;
      justify-content: center;
      width: 100%;
      height: 100%;

      .welcome-message {
        font-size: 26px;
        margin-top: 5px;
        font-weight: 400;
      }

      .login-message {
        margin-top: 8px;
        margin-bottom: 40px;
        font-size: 14px;
        color: rgba(#000000, 0.9);
      }

      .actions-h {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        padding: 0;
        margin-top: 15px;

        a {
          align-self: center;
          text-decoration: none;
          color: rgba(#000000, 0.54) !important;
          white-space: nowrap;
        }

        .actions {
          display: flex;
          flex-direction: row;
          display: inline;

          .button-login {
            min-width: 124px !important;
            display: inline;
          }

          .error--text {
            margin-left: 20px;
            align-self: center;
          }
        }
      }
    }

    .email,
    .password {
      margin: -10px 0px -10px 0px;
      padding: -10px 0px -10px 0px;
    }

    .forgotPassword {
      margin-top: 20px;
    }

    .privacy-policy {
      position: absolute;
      width: 100%;
      margin: 0px -150px;
      bottom: 32px;
      font-size: 1.2em;
      color: rgba(0, 0, 0, 0.54) !important;
      text-align: center;

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
      bottom: 17px;
      left: 80px;
      min-width: 146px !important;
      max-width: 146px;
      padding: 0 !important;
      height: 40px !important;
      justify-content: center !important;
      font-weight: 400;
      display: flex;
      justify-content: center !important;
      text-align: center !important;

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

  .dialog {
    padding: 48px;
    text-align: center;
    background-color: #ffffff;

    p {
      margin: 10px 0 60px;
    }

    .actions {
      margin-top: 64px;
      text-align: right;

      .v-btn {
        min-width: 124px !important;
      }

      button:not(:first-child) {
        margin-left: 12px;
      }
    }
  }

  .have-account {
    margin: 0px;
    padding-top: 50px;
    font-size: 12px;
    text-align: center;

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
    justify-content: center;
    align-content: center;
    align-items: center;
    text-align: center;
  }
}

/* Responsividade Mobile*/
@media (max-width: 500px) {
  .login-content {
    min-width: 360px;
    max-width: 830px;
    width: 100%;
    padding: 50px 40px 80px 30px;

    .login-logo {
      margin-top: 50px;
      margin-left: 3px;
      position: absolute;
      width: 107px;
    }

    .box-login {
      display: flex;
      flex-direction: column;
      justify-content: center;
      width: 100%;
      height: 100%;

      .welcome-message {
        font-size: 26px;
        margin-top: 5px;
        font-weight: 400;
      }

      .login-message {
        margin-top: 8px;
        margin-bottom: 40px;
        font-size: 14px;
        color: rgba(#000000, 0.9);
      }

      .actions-h {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        padding: 0;
        margin-top: 15px;

        a {
          align-self: center;
          text-decoration: none;
          color: rgba(#000000, 0.54) !important;
          white-space: nowrap;
        }

        .actions {
          display: flex;
          flex-direction: row;
          display: inline;

          .button-login {
            min-width: 124px !important;
            display: inline;
          }

          .error--text {
            margin-left: 20px;
            align-self: center;
          }
        }
      }
    }

    .email,
    .password {
      margin: -10px 0px -10px 0px;
      padding: -10px 0px -10px 0px;
    }

    .forgotPassword {
      margin-top: 20px;
    }

    .privacy-policy {
      position: absolute;
      width: 100%;
      margin: 0px -10px;
      bottom: 32px;
      font-size: 1.2em;
      color: rgba(0, 0, 0, 0.54) !important;
      text-align: center;

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
      bottom: 100px;
      left: 105px;
      min-width: 146px !important;
      max-width: 146px;
      padding: 0 !important;
      height: 40px !important;
      justify-content: center !important;
      font-weight: 400;
      display: flex;
      justify-content: center !important;
      text-align: center !important;

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

  .dialog {
    padding: 48px;
    text-align: center;
    background-color: #ffffff;

    p {
      margin: 10px 0 60px;
    }

    .actions {
      margin-top: 64px;
      text-align: right;

      .v-btn {
        min-width: 124px !important;
      }

      button:not(:first-child) {
        margin-left: 12px;
      }
    }
  }

  .have-account {
    margin: 0px;
    padding-top: 50px;
    font-size: 12px;
    text-align: center;

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
    justify-content: center;
    align-content: center;
    align-items: center;
    text-align: center;
  }
}
</style>
