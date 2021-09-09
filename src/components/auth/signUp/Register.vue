<template>
  <div class="b-signup">
    <img class="signUp-logo" src="@/assets/logo.svg" alt="Header" />
    <div class="signup-title">
      {{ $t('signUp.title') }}
    </div>
    <div class="signup-subTitle">
      {{ $t('signUp.subTitle') }}
    </div>
    <v-form v-model="valid" class="signup" @submit.prevent="signUp">
      <div class="name-inputs">
        <v-text-field
          v-model="form.first_name"
          profile.first_name
          outlined
          dense
          class="first-name"
          color="rgba(0,0,0,0.9)"
          :label="$t('signUp.form.firstName')"
          :rules="[rules.required]"
        />
        <v-text-field
          v-model="form.last_name"
          profile.last_name
          outlined
          dense
          class="last-name"
          color="rgba(0,0,0,0.9)"
          :label="$t('signUp.form.lastName')"
          :rules="[rules.required]"
        />
      </div>
      <v-text-field
        v-model="form.email"
        profile.email
        outlined
        dense
        class="email"
        color="rgba(0,0,0,0.9)"
        :label="$t('signUp.form.email')"
        :rules="[rules.required]"
      />
      <v-text-field
        v-model="form.organization"
        outlined
        dense
        class="organization"
        color="rgba(0,0,0,0.9)"
        :label="$t('signUp.form.organization')"
        :rules="[rules.required]"
      />
      <v-text-field
        v-model="form.password"
        outlined
        dense
        type="password"
        class="password"
        color="rgba(0,0,0,0.9)"
        :label="$t('signUp.form.password')"
        hint="At least 8 characters"
        :rules="[rules.required, rules.min]"
      />

      <v-checkbox
        v-model="form.notifications"
        class="opt-in"
        color="#fa4600"
        :ripple="false"
        hide-details
        :rules="[rules.required]"
      >
        <template #label>
          {{ $t('signUp.form.notifications') }}
          <!-- <span class="adivisor">*</span> -->
        </template>
      </v-checkbox>

      <v-checkbox
        v-model="form.acceptedTerms"
        class="terms"
        color="#fa4600"
        hide-details
        :ripple="false"
        :rules="[rules.required]"
        :value="form.acceptedTerms"
      >
        <template #label>
          <div class="accept" @click.stop>
            {{ $t('signUp.form.terms') }}
            <a
              class="accept-terms"
              target="_blank"
              href="https://www.headerinteractive.com/legal/termos-de-uso-header-dx"
            >
              {{ $t('default.termsAndConditions') }}
            </a>
            <span class="adivisor">*</span>
          </div>
        </template>
      </v-checkbox>
      <div class="notice">
        {{ $t('signUp.notice') }}
      </div>

      <div class="actions">
        <v-btn
          type="submit"
          :loading="loading"
          color="#fa4600"
          class="white--text btn-sm"
          depressed
          tile
          :disabled="!valid"
        >
          {{ $t('signUp.form.save') }}
        </v-btn>

        <router-link class="already-account" to="/auth/login">
          {{ $t('login.dialog.alredyHaveAccount') }}
        </router-link>
      </div>
    </v-form>
  </div>
</template>

<script lang="ts" scoped>
import { Component, Vue } from 'vue-property-decorator';
import { Getter, Action, Mutation } from 'vuex-class';

import { api, retry } from '@/services/axios';
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
}
</script>

<style lang="scss">
/* Start Global Style */
.b-signup {
  min-width: 390px;
  min-width: 400px;
  padding: 40px 30px 10px 100px;
}

.signup {
  margin-top: 10px;

  .v-input--selection-controls {
    margin-top: 10px;
  }

  .email,
  .first-name,
  .last-name,
  .organization,
  .password {
    height: 50px;
    width: 100%;

    display: block;
    font-size: 1.2em !important;
    color: rgba(#000000, 0.6);

    .adivisor {
      color: #ff0000;
    }
  }

  .opt-in,
  .terms {
    margin: 0px auto;
    font-size: 1.5em;
  }
}

.accept-terms {
  margin-left: 3px;
  color: rgba(#000000, 0.6);
  font-size: inherit !important;
  text-decoration: underline;
}
/* End Global Style */

/* Start Step 2 */

.signup-title {
  width: 568px;
  padding-top: 28px;
  font-size: 32px;
  font-weight: 500;
}

.signup-subTitle {
  width: 100%;
  padding-top: 0px;
  margin-bottom: 30px;
  font-size: 14px;
  font-weight: 500;
}

.signUp-logo {
  width: 107px;
}

.actions {
  margin-top: 20px;
  .btn-sm {
    min-width: 124px !important;
    margin-right: 40px;

    &:not(:first-child) {
      margin-left: 12px;
    }
  }

  .already-account {
    font-size: 14px;
    color: rgba(#000000, 0.9);

    &:hover {
      opacity: 0.8;
    }
  }
}

.notice {
  width: 100%;
  margin-top: 15px;
  font-size: 12px;
  color: rgba(#000000, 0.7);
}

.name-inputs {
  display: flex;
  align-items: center;
  column-gap: 12px;
}
/* End Step 2 */

/* Responsividade tablet e telas pequenas*/

@media (max-width: 1000px) {
  /* Start Step 2 */
  .b-signup {
    min-width: 390px;
    min-width: 400px;
    padding: 30px 0px 10px 30px;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
  }

  .signup {
    margin-top: 10px;

    .v-input--selection-controls {
      margin-top: 10px;
    }

    .email,
    .first-name,
    .last-name,
    .organization,
    .password {
      height: 50px;
      width: 100%;

      display: block;
      font-size: 1.2em !important;
      color: rgba(#000000, 0.6);

      .adivisor {
        color: #ff0000;
      }
    }

    .opt-in,
    .terms {
      margin: -5px auto;
      font-size: 1.5em;
    }
  }
  .signup {
    width: 100%;
    margin: 0px auto;
  }
  .signup-title {
    width: 100%;
    font-size: 28px;
    font-weight: 500;
    margin-top: 7px;
  }

  .signup-subTitle {
    width: 100%;
    font-size: 14px;
    margin: 0px -10px 20px 0px;
  }

  .signUp-logo {
    width: 107px;
    display: flex;
    margin: 10px 185px 0px 0px;
  }

  .notice {
    width: 80%;
    margin: 25px 0px 0px 0px;
    font-size: 1.2em !important;
    color: rgba(#000000, 0.7);
  }

  .already-account {
    margin-bottom: 50px;
    font-size: 1.3em;
    color: rgba(#000000, 0.9);

    &:hover {
      opacity: 0.8;
    }
  }
  /* End Step 2 */
}

/* Responsividade Mobile*/
@media (max-width: 600px) {
  /* Start Global Css Responsive */
  .b-signup {
    min-width: 100%;
    max-width: 100%;
    width: 100%;
    height: 100vh;
    padding: 60px 0px 0px;
  }

  .email,
  .first-name,
  .last-name,
  .organization,
  .password {
    width: 200%;
    margin: -15px 0px;
    padding: -30px 0px;
  }

  .opt-in,
  .terms {
    width: 200%;
    margin: 0px auto;
    font-size: 1.5em;
  }

  button {
    min-width: 124px !important;
    margin: 0px auto;
    width: 40%;

    &:not(:first-child) {
      margin-left: 12px;
    }
  }
  /* End Global Css Responsive */

  /* Start Step 2 */
  .signup {
    width: 100%;
    margin: -15px auto 0px;
  }

  .signUp-logo {
    width: 107px;
    margin-top: -10px;
    display: flex;
    justify-content: left;
    align-items: flex-start;
  }

  .signup-title {
    width: 100%;
    font-size: 26px;
    font-weight: 500;
    margin-top: 0px;
  }

  .signup-subTitle {
    width: 100%;
    font-size: 14px;
    display: flex;
    margin: 0px -10px 30px 0px;
  }

  .notice {
    position: absolute;
    width: 80%;
    margin-top: 120px;
    font-size: 1.2em !important;
    color: rgba(#000000, 0.7);
    text-align: center;
  }

  .name-inputs {
    display: block;
  }

  .already-account {
    display: none;
  }

  .btn-sm {
    width: 139px;
    height: 40;
    font-size: 14px;
    margin: 25px 100px 40px;
  }
  /* End Step 2 */
}
</style>
