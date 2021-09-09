<template>
  <div class="auth-wrapper">
    <router-view />

    <!-- <div v-if="route === 'login'" class="box-signup">
      <div class="signup-message">
        {{ $t('auth.signUpMessage') }}
      </div>

      <v-btn depressed tile @click="toSignUp">
        {{ $t('auth.signUpBtn') }}
      </v-btn>
    </div> -->

    <div class="header-realtime-personalization-login">
      <div class="box-image">
        <img class="header-realtime-personalization-image" src="" alt="" />
      </div>

      <div class="box-message">
        <div class="header-realtime-personalization-title">
          {{ $t('LoginSide.title') }}
        </div>
        <span class="header-realtime-personalization-subtitle">
          {{ $t('LoginSide.subTitle') }}
        </span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { Getter, Mutation } from 'vuex-class';

import { ILanguage } from '@/store/modules/system';

@Component
export default class LoginSide extends Vue {
  @Getter('system/languages')
  private languages!: ILanguage[];

  @Getter('route/name')
  private route!: string;

  @Mutation('system/setLocale')
  private setLocale!: (data: ILanguage) => void;

  mounted(): void {
    const userLang = navigator.language;

    const language = this.languages.find(lang => {
      return lang.key === userLang.toLowerCase();
    });

    if (language) {
      this.setLocale(language);

      const htmlTag = document.querySelector('html');
      if (htmlTag) htmlTag.setAttribute('lang', language.key);
      this.$i18n.locale = language.key;
    }
  }

  toSignUp(): void {
    this.$router.push('/auth/sign-up');
  }
}
</script>

<style lang="scss">
.auth-wrapper {
  position: relative;
  display: flex;
  flex-direction: row;
  height: 100%;
  background: #ffffff;
  overflow: hidden;

  .box-signup {
    position: absolute;
    top: 20px;
    right: 30px;
    display: flex;
    flex-direction: row;
    align-items: baseline;
    z-index: 1000;

    .signup-message {
      font-size: 1.4em;
      color: #ffffff;
    }

    button {
      margin-left: 20px;
    }
  }

  .header-realtime-personalization-login {
    position: relative;
    width: 50%;
    height: 100%;
    color: #ffffff !important;
    overflow: hidden;
    background: #969696;
    display: flex;

    .box-image {
      position: relative;
      width: 100%;
      height: 100%;
    }

    .box-message {
      position: absolute;
      left: 90px;
      bottom: 90px;
      width: 70%;

      .header-realtime-personalization-title {
        color: #ffffff;
        font-size: 3em;
        font-weight: 500;
        line-height: 1.2;
        margin-bottom: 24px;
      }

      .header-realtime-personalization-subtitle {
        color: #ffffff;
        font-size: 1.4em !important;
        line-height: 1.6;
        opacity: 0.6;
      }
    }
  }
}
@media (max-width: 800px) {
  .auth-wrapper {
    position: relative;
    display: flex;
    flex-direction: row;
    height: 100%;
    background: #ffffff;
    overflow: hidden;

    .box-signup {
      position: absolute;
      top: 20px;
      right: 30px;
      display: flex;
      flex-direction: row;
      align-items: baseline;
      z-index: 1000;

      .signup-message {
        font-size: 1.4em;
        color: #ffffff;
      }

      button {
        margin-left: 20px;
      }
    }

    .header-realtime-personalization-login {
      position: relative;
      width: 50%;
      height: 100%;
      color: #ffffff !important;
      overflow: hidden;
      background: #969696;
      display: none;

      .box-image {
        position: relative;
        width: 100%;
        height: 100%;
      }

      .box-message {
        position: absolute;
        left: 90px;
        bottom: 90px;
        width: 70%;

        .header-realtime-personalization-title {
          color: #ffffff;
          font-size: 3em;
          font-weight: 500;
          line-height: 1.2;
          margin-bottom: 24px;
        }

        .header-realtime-personalization-subtitle {
          color: #ffffff;
          font-size: 1.4em !important;
          line-height: 1.6;
          opacity: 0.6;
        }
      }
    }
  }
  @media (max-width: 600px) {
    .auth-wrapper {
      position: relative;
      display: flex;
      flex-direction: row;
      height: 100%;
      background: #ffffff;
      overflow: hidden;

      .box-signup {
        position: absolute;
        top: 20px;
        right: 30px;
        display: flex;
        flex-direction: row;
        align-items: baseline;
        z-index: 1000;

        .signup-message {
          font-size: 1.4em;
          color: #ffffff;
        }

        button {
          margin-left: 20px;
        }
      }

      .header-realtime-personalization-login {
        position: relative;
        width: 50%;
        height: 100%;
        color: #ffffff !important;
        overflow: hidden;
        background: #969696;
        display: none;

        .box-image {
          position: relative;
          width: 100%;
          height: 100%;
        }

        .box-message {
          position: absolute;
          left: 90px;
          bottom: 90px;
          width: 70%;

          .header-realtime-personalization-title {
            color: #ffffff;
            font-size: 3em;
            font-weight: 500;
            line-height: 1.2;
            margin-bottom: 24px;
          }

          .header-realtime-personalization-subtitle {
            color: #ffffff;
            font-size: 1.4em !important;
            line-height: 1.6;
            opacity: 0.6;
          }
        }
      }
    }
  }
}
</style>
