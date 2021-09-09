<template>
  <div class="auth-wrapper">
    <router-view />
    <div class="header-realtime-personalization">
      <div class="side-box">
        <ul>
          <li>
            <span class="check">
              <img src="@/assets/check.svg" />
            </span>
            <h1>{{ $t('Auth.signUp.bigData') }}</h1>
            <p>{{ $t('Auth.signUp.textBigData') }}</p>
          </li>
          <li>
            <span class="check">
              <img src="@/assets/check.svg" />
            </span>
            <h1>{{ $t('Auth.signUp.hiperPersonalizacao') }}</h1>
            <p>{{ $t('Auth.signUp.textHiperPersonalizacao') }}</p>
          </li>
          <li>
            <span class="check">
              <img src="@/assets/check.svg" />
            </span>
            <h1>{{ $t('Auth.signUp.trigger') }}</h1>
            <p>{{ $t('Auth.signUp.textTrigger') }}</p>
          </li>
          <li>
            <span class="check">
              <img src="@/assets/check.svg" />
            </span>
            <h1>{{ $t('Auth.signUp.analytics') }}</h1>
            <p>{{ $t('Auth.signUp.textAnalytics') }}</p>
          </li>
          <li>
            <span class="check">
              <img src="@/assets/check.svg" />
            </span>
            <h1>{{ $t('Auth.signUp.shopBack') }}</h1>
            <p>{{ $t('Auth.signUp.textShopBack') }}</p>
          </li>
          <li>
            <span class="check">
              <img src="@/assets/check.svg" />
            </span>
            <h1>{{ $t('Auth.signUp.segmentacao') }}</h1>
            <p>{{ $t('Auth.signUp.textSegmentacao') }}</p>
          </li>
        </ul>
        <div class="sub-title">
          <h2>{{ $t('Auth.signUp.subTitle') }}</h2>
          <div class="companies-images">
            <img src="@/assets/accor-ll.svg" />
            <img src="@/assets/beto-carreiro.svg" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { Getter, Mutation } from 'vuex-class';

import { ILanguage } from '@/store/modules/system';

@Component
export default class Auth extends Vue {
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
  display: flex;
  justify-content: right;
  height: 100vh;
  background: #ffffff;
  overflow: hidden;
  margin: 0px;
  padding: 0px;

  .box-signup {
    position: absolute;
    top: 20px;
    right: 100px;
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
}
.header-realtime-personalization {
  position: relative;
  width: 50%;
  height: 100%;
  color: #ffffff !important;
  overflow: hidden;
  background-color: #152b52;
  margin-left: 150px;
  padding: 0px 40px 0px 50px;

  .side-box {
    position: relative;
    width: 90%;
    height: 100%;
    background-color: #152b52;
    padding-top: 100px;
    display: flex;
    justify-content: center;

    .check {
      width: 100%;
      img {
        position: absolute;
        margin-right: 1000px;
      }
    }

    ul {
      list-style: none;
    }

    h1 {
      color: #14c5fa;
      font-weight: 500;
      font-size: 14px;
      margin-left: 30px;
    }

    p {
      color: #fff;
      font-size: 12px;
      margin-left: 30px;
    }
  }

  .sub-title {
    text-align: center;
    display: block;
    position: absolute;
    margin-top: 400px;
    width: 80%;

    .companies-images {
      display: flex;
      align-items: center;
      justify-content: center;
      column-gap: 60px;
      margin: 15px auto 0px;
      width: 50%;
    }

    h2 {
      color: #afdfed;
      font-size: 16px;
    }
  }
}

@media (max-width: 1000px) {
  .auth-wrapper {
    display: flex;
    justify-content: right;
    height: 100vh;
    background: #ffffff;
    overflow: hidden;
    margin: 0px;
    padding: 0px;

    .box-signup {
      position: absolute;
      top: 20px;
      right: 100px;
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

    .header-realtime-personalization {
      position: relative;
      width: 50%;
      height: 100%;
      color: #ffffff !important;
      overflow: hidden;
      background-color: #152b52;
      margin-left: 150px;

      .side-box {
        position: relative;
        width: 100%;
        height: 100%;
        background-color: #152b52;
        margin-top: 10px;
        padding-right: 50px;
        display: flex;
        justify-content: center;

        .check {
          width: 100%;
          img {
            position: absolute;
            margin-right: 1000px;
          }
        }

        ul {
          list-style: none;
        }

        h1 {
          color: #14c5fa;
          font-weight: 500;
          font-size: 14px;
          margin-left: 30px;
        }

        p {
          color: #fff;
          font-size: 12px;
          margin-left: 30px;
        }
      }

      .sub-title {
        display: none;

        .companies-images {
          display: none;
        }
      }
    }
  }
}

@media (max-width: 800px) {
  .header-realtime-personalization {
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
      background-position: left center;
      display: none;

      &::after {
        display: none;
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        width: 100%;
        background-image: linear-gradient(
          to top,
          rgba(#000000, 1),
          rgba(#000000, 0)
        );
      }

      img {
        position: absolute;
        top: 0;
        height: 100%;
        display: none;
      }
    }

    p {
      color: #ffffff !important;
      display: none;
    }

    a {
      display: none;
      height: 36px !important;
      color: #000000;
      background: #ffffff !important;
    }

    .box-message {
      position: absolute;
      left: 90px;
      bottom: 90px;
      width: 70%;
      display: none;

      .header-realtime-personalization-title {
        color: #ffffff;
        font-size: 3em;
        font-weight: 500;
        line-height: 1.2;
        margin-bottom: 24px;
        display: none;
      }

      .header-realtime-personalization-subtitle {
        color: #ffffff;
        font-size: 1.4em !important;
        line-height: 1.6;
        opacity: 0.6;
        display: none;
      }
    }
  }
}
</style>
