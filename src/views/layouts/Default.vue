<template>
  <div class="default-wrapper" :class="{ 'is-loading': isLoading }">
    <h-app-bar :is-active="showMenus" />
    <h-sidebar :is-active="showMenus" />

    <v-main :class="[hasAlert && 'has-alert']">
      <div class="box-toasts">
        <h-toast v-for="(toast, key) in toasts" :key="key" :toast="toast" />
      </div>
      <router-view />
    </v-main>

    <div v-if="hasAlert" class="alert-bar">
      <div class="alert-bar-text">{{ alertMessage }}</div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import { Getter, Mutation } from 'vuex-class';
import { Route } from 'vue-router';

import { Toast } from '@/utils/types';

import { emitter } from '@/plugins/events';

import { api, retry } from '@/services/axios';
import { IUser } from '@/store/modules/user';
import { ILanguage } from '@/store/modules/system';

type Timezone = {
  name: string;
  gmt?: string;
};

@Component
export default class Default extends Vue {
  private showMenus = false;

  private toasts: Toast[] = [];

  get hasAlert(): boolean {
    return !!this.alertMessage;
  }

  @Getter('auth/isLoadingSession')
  private isLoading!: boolean;

  @Getter('system/alert')
  private alertMessage!: string;

  @Getter('system/locale')
  private locale!: ILanguage;

  @Getter('system/languages')
  private languages!: ILanguage[];

  @Mutation('system/setLocale')
  private setLocale!: (data: ILanguage) => void;

  @Mutation('timezones/setCurrent')
  private setTimezone!: (data: Timezone) => void;

  @Watch('$route')
  onChangeRoute(to: Route): void {
    this.showMenus = to.path.match(/(create-company|choose-company)/g) === null;
  }

  beforeMount(): void {
    this.showMenus =
      this.$route.path.match(/(create-company|choose-company)/g) === null;
  }

  beforeDestroy(): void {
    emitter.off<Toast>('toast', this.addToast);
    emitter.off<Element>('remove-toast', this.removeToast);
  }

  mounted(): void {
    retry<IUser>({ axios: api, url: '/users' }).then(res => {
      if (res.data.LANGUAGE_CODE) {
        const lang = (this.languages as ILanguage[]).find(item => {
          return item.key === res.data.LANGUAGE_CODE;
        });
        if (lang) {
          this.$i18n.locale = lang.key;
          this.setLocale(lang);
        }
      }
      if (res.data.TIMEZONE?.NAME) {
        const gmt = res.data.TIMEZONE.NAME.match(/([+-])(\d{2}):?(\d{2})/);
        this.setTimezone({
          name: res.data.TIMEZONE.DESCRIPTION,
          gmt: gmt ? gmt[0] : undefined,
        });
      }
    });

    emitter.on('toast', this.addToast);
    emitter.on('remove-toast', this.removeToast);
  }

  addToast(toast: Toast | undefined): void {
    if (toast) this.toasts.push(toast);
  }

  removeToast(toast: Element | undefined): void {
    if (!toast) return;
    if (typeof toast.remove !== undefined) {
      toast.remove();
    } else {
      toast.parentNode?.removeChild(toast);
    }
  }
}
</script>

<style lang="scss">
.box-toasts {
  position: fixed;
  top: 70px;
  right: 0px;
  padding-right: 30px;
  z-index: 1000;
}

.default-wrapper {
  .alert-bar {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    position: fixed;
    top: 48px;
    height: 36px;
    width: 100%;
    background-image: linear-gradient(to right, #fa4600, #fa7d00);

    .alert-bar-text {
      display: flex;
      flex-direction: row;
      align-items: baseline;
      font-size: 1.2em;
      font-weight: 400;
      color: #ffffff;

      a {
        margin: 2px;
        font-weight: 400;
        color: #ffffff;
        text-decoration: underline;
      }
    }
  }

  &.is-loading {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    opacity: 0.1;
    pointer-events: none;
  }

  .v-main {
    &.has-alert {
      padding-top: 84px !important;
    }

    .box-content {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      margin-top: 124px;
      padding: 40px;

      &.no-header-content {
        margin-top: 0;
        padding: 24px;
      }

      &.no-padding {
        padding: 0;
      }

      &.list-actions,
      &.show-results {
        padding: 0 40px;
      }

      &.box-search {
        margin-top: 190px;
      }

      &.box-tabs.box-search {
        margin-top: 225px;
      }

      .content {
        width: 100%;
      }
    }
  }
}
</style>
