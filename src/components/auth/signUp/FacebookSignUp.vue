<template>
  <div class="b-signup-step1">
    <img class="facebook-signUp-logo" src="@/assets/logo.svg" alt="Header" />
    <v-form class="signup" @submit.prevent>
      <div class="signup-title-facebook d-flex justify-start">
        {{ $t('signUp.step1.title') }}
      </div>
      <div class="signup-subTitle-facebook">
        {{ $t('signUp.step1.subTitle') }}
      </div>

      <div class="btn-facebook">
        <v-btn type="button" class="facebook-signUp" @click="facebookClick">
          <img src="@/assets/facebook.svg" style="padding-right: 10px" />
          {{ $t('signUp.step1.btnFacebook') }}
        </v-btn>
      </div>
    </v-form>
    <div class="protect-data">
      {{ $t('signUp.step1.protectData') }}
    </div>

    <div class="cloud">
      <div class="service">
        <img src="@/assets/service-cloud.svg" alt="Header" />
      </div>
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
  </div>
</template>

<script lang="ts" scoped>
import { Component, Vue } from 'vue-property-decorator';
import { Getter, Action, Mutation } from 'vuex-class';

import { api, retry } from '@/services/axios';
import { Sdk } from '@/plugins/facebook';

import { Rules } from '@/utils/types';
import { ICompany } from '@/store/modules/companies';
import { ILanguage } from '@/store/modules/system';
import { ICurrency } from '@/store/modules/system/currencies';

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
  private userLang = 'en-us';
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
  private rules: Rules = {
    required: value => !!value || this.$t('formRules.required.error'),

    min: v => (v && v.length >= 8) || this.$t('formRules.min.error', { n: 8 }),
  };

  get showLanguages(): ILanguage[] {
    return this.languages.filter(l => l.key !== this.locale.key);
  }

  @Getter('system/locale')
  private locale!: ILanguage;

  @Getter('auth/isLoading')
  private isLoading!: boolean;

  @Getter('auth/hasError')
  private hasError!: boolean;

  @Getter('system/languages')
  private languages!: ILanguage[];

  @Getter('companies/list')
  private companies!: ICompany[];

  @Mutation('auth/destroy')
  private logout!: () => Promise<void>;

  @Mutation('system/setLoading')
  private setLoading!: (data: boolean) => void;

  @Mutation('system/setLocale')
  private setLocale!: (data: ILanguage) => void;

  @Mutation('auth/remove')
  private clearError!: () => void;

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

<style lang="scss" scoped>
/*Start Step 1 */
.b-signup-step1 {
  min-width: 390px;
  min-width: 400px;
  padding: 60px 0px 10px 80px;
  margin: 0px;

  .facebook-signUp-logo {
    width: 107px;
    margin-bottom: 10px;
  }

  .signup-title-facebook {
    width: 80%;
    padding-top: 28px;
    font-size: 26px;
    font-weight: 500;
  }

  .signup-subTitle-facebook {
    width: 100%;
    padding-top: 5px;
    margin: 10px 0px 20px;
    font-size: 14px;
    font-weight: 500;
  }

  .btn-facebook {
    margin-top: 77px;
    width: 100%;
    display: flex;
  }

  .facebook-signUp {
    width: 306px !important;
    height: 67px !important;
    font-size: 18px !important;
    color: #fff !important;
    font-weight: 400 !important;
    background-color: #3b5998 !important;
    border-radius: 5px;
  }

  .protect-data {
    margin-top: 90px;
    font-size: 14px;
    width: 100%;
  }

  .cloud {
    width: 80%;
    .service {
      padding: 20px 0px;
      font-size: 30px;
      width: 80%;
    }
    .service > img {
      padding: 20px 0px;
      font-size: 30px;
      width: 100%;
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
    bottom: 75px;
    right: 0px;
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
}
/*End Step 1 */
@media (max-width: 1000px) {
  .b-signup-step1 {
    min-width: 390px;
    min-width: 400px;
    padding: 50px 10px 10px 50px;

    .signup-title-facebook {
      width: 80%;
      padding-top: 30px;
      font-size: 22px;
      font-weight: 500;
    }

    .signup-subTitle-facebook {
      width: 100%;
      padding-top: 5px;
      margin: 10px 0px 5px;
      font-size: 14px;
      font-weight: 500;
    }

    .btn-facebook {
      margin-top: 50px;
      width: 100%;
      display: flex;
    }

    .facebook-signUp {
      width: 280px !important;
      height: 60px !important;
      font-size: 18px !important;
      color: #fff !important;
      font-weight: 400 !important;
      background-color: #3b5998 !important;
      border-radius: 5px;
    }

    .protect-data {
      margin-top: 105px;
      font-size: 14px;
      width: 100%;
    }

    .cloud {
      width: 80%;
      .service {
        padding: 20px 0px;
        font-size: 30px;
        width: 80%;
      }
      .service > img {
        padding: 20px 0px;
        font-size: 30px;
        width: 120%;
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
      bottom: 75px;
      right: -50px;
      min-width: 146px !important;
      max-width: 146px;
      padding: 0 !important;
      height: 40px !important;
      justify-content: baseline;
      font-weight: 400;
      letter-spacing: 0;
      justify-content: right !important;
      text-align: right !important;

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

/* Responsividade Tablet*/
@media (max-width: 800px) {
  /*Start Step 1 */
  .b-signup-step1 {
    min-width: 390px;
    min-width: 400px;
    padding: 50px 10px 10px 50px;

    .signup-title-facebook {
      width: 80%;
      padding-top: 30px;
      font-size: 22px;
      font-weight: 500;
    }

    .signup-subTitle-facebook {
      width: 100%;
      padding-top: 5px;
      margin: 10px 0px 5px;
      font-size: 14px;
      font-weight: 500;
    }

    .btn-facebook {
      margin-top: 50px;
      width: 100%;
    }

    .facebook-signUp {
      width: 280px !important;
      height: 60px !important;
      font-size: 18px !important;
      color: #fff !important;
      font-weight: 400 !important;
      background-color: #3b5998 !important;
      border-radius: 5px;
    }

    .protect-data {
      margin-top: 105px;
      font-size: 14px;
      width: 100%;
    }

    .cloud {
      width: 80%;
      .service {
        padding: 20px 0px;
        font-size: 30px;
        width: 80%;
      }
      .service > img {
        padding: 20px 0px;
        font-size: 30px;
        width: 90%;
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
      bottom: 75px;
      right: 60px;
      min-width: 146px !important;
      max-width: 146px;
      padding: 0 !important;
      height: 40px !important;
      justify-content: baseline;
      font-weight: 400;
      letter-spacing: 0;
      justify-content: right !important;
      text-align: right !important;

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
  /*End Step 1 */
}

/* Responsividade Mobile*/
@media (max-width: 600px) {
  /*Start Step 1 */
  .b-signup-step1 {
    min-width: 390px;
    min-width: 400px;
    padding: 60px 30px 10px 10px;

    .signup-title-facebook {
      width: 80%;
      padding-top: 30px;
      font-size: 22px;
      font-weight: 500;
    }

    .signup-subTitle-facebook {
      width: 100%;
      padding-top: 5px;
      margin: 0px 0px 5px;
      font-size: 14px;
      font-weight: 500;
    }

    .btn-facebook {
      margin-top: 50px;
      padding-right: 30px;
      width: 100%;
      display: flex;
    }

    .facebook-signUp {
      width: 280px !important;
      height: 60px !important;
      font-size: 18px !important;
      color: #fff !important;
      font-weight: 400 !important;
      background-color: #3b5998 !important;
      border-radius: 5px;
    }

    .protect-data {
      margin-top: 105px;
      padding-right: 20px;
      font-size: 14px;
      width: 100%;
      text-align: center;
    }

    .cloud {
      width: 80%;
      .service {
        padding: 20px 0px;
        font-size: 30px;
        width: 80%;
        margin: 0px auto;
      }
      .service > img {
        padding: 20px 0px;
        width: 120%;
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
      bottom: -10px;
      right: 140px;
      min-width: 146px !important;
      max-width: 146px;
      padding: 0 !important;
      height: 40px !important;
      justify-content: baseline;
      font-weight: 400;
      letter-spacing: 0;
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
  /*End Step 1 */
}
</style>
