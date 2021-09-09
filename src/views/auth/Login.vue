<template>
  <h-sign-in class="language" />
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { Getter, Mutation, Action } from 'vuex-class';

import { ILanguage } from '@/store/modules/system';
import { ILoginRequest, ILoginResponse } from '@/store/modules/auth';
import { Rules } from '@/utils/types';

interface LoginForm {
  email: string;
  password: string;
  remember: boolean;
}

@Component
export default class Login extends Vue {
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

  @Getter('system/locale')
  private locale!: ILanguage;

  @Getter('auth/isLoading')
  private isLoading!: boolean;

  @Getter('auth/hasError')
  private hasError!: boolean;

  @Mutation('auth/remove')
  private clearError!: () => void;

  @Action('auth/loginRequest')
  private loginRequest!: (data: ILoginRequest) => Promise<ILoginResponse>;

  // @Action('auth/forgotPassword')
  // private forgotPassword!: (data: string) => Promise<void>;

  login(): void {
    this.$log.debug(`Login with ${this.form.email}`);

    this.loginRequest(this.form);
  }

  // recoveryPassword(): void {
  //   this.$log.debug(`Forgot password to ${this.form.email}`);

  //   this.forgotPassword(this.form.email);
  // }
}
</script>
