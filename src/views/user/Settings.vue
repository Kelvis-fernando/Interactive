<template>
  <div class="user-settings">
    <div class="box-content no-header-content">
      <div class="content">
        <div class="settings">
          <div class="user-avatar">
            <div class="user-avatar-input">
              <v-icon v-if="!user.avatar_url">hi-avatar</v-icon>
              <img v-else :src="user.avatar_url" :alt="user.first_name" />

              <label>
                <v-icon>camera_alt</v-icon>

                <input ref="inputAvatar" type="file" class="inputAvatar" />
              </label>
              <!-- @input="newFile($event.target.files)" -->
            </div>

            <div class="user-name">
              {{ user && `${user.first_name} ${user.last_name || ''}` }}
            </div>

            <div class="user-position">
              {{ user.type && user.type.description }}
            </div>
          </div>

          <div class="content-settings">
            <div
              v-for="(option, index) in options"
              :key="option"
              :class="['settings-option', step === index && 'active']"
              @click="setMenuActive(index)"
            >
              <div class="text">{{ $t(`users.${option}.title`) }}</div>
              <v-icon>hi-keyboard-arrow-right</v-icon>
            </div>
          </div>
        </div>

        <div :class="['settings-forms', !!alertMessage && 'has-alert']">
          <v-window v-model="step" vertical>
            <v-window-item key="1">
              <div class="content-header">
                {{ $t('users.profile.title') }}
              </div>
              <div class="content-profile">
                <v-form ref="formProfile" v-model="valid" @submit.prevent>
                  <div class="label-fixed">
                    {{ $t('users.profile.personal') }}
                  </div>
                  <div class="settings-row">
                    <div class="box-first-name" style="width: 100%">
                      <div class="label label-first-name">
                        {{ $t('users.profile.firstName.label') }}
                      </div>
                      <v-text-field
                        v-model="profile.first_name"
                        :placeholder="$t('users.profile.firstName.placeholder')"
                        color="rgba(0,0,0,0.9)"
                        solo
                        outlined
                        dense
                        hide-details
                        autocomplete="off"
                      />
                    </div>

                    <div class="box-last-name" style="width: 100%">
                      <div class="label label-last-name">
                        {{ $t('users.profile.lastName.label') }}
                      </div>
                      <v-text-field
                        v-model="profile.last_name"
                        :placeholder="$t('users.profile.lastName.placeholder')"
                        color="rgba(0,0,0,0.9)"
                        solo
                        outlined
                        dense
                        hide-details
                        autocomplete="off"
                      />
                    </div>
                  </div>

                  <div class="settings-row">
                    <div class="box-gender" style="width: 100%">
                      <div class="label label-gender">
                        {{ $t('users.profile.gender.label') }}
                      </div>

                      <v-autocomplete
                        v-model="profile.gender"
                        :label="$t('users.profile.gender.placeholder')"
                        :items="gender"
                        :item-text="g => $t(`default.gender.${g.text}`)"
                        :no-data-text="$t('default.noDataText')"
                        outlined
                        solo
                        flat
                        dense
                        hide-details
                        autocomplete="off"
                      />
                    </div>

                    <div class="box-birthday" style="width: 100%">
                      <div class="label label-gender">
                        {{ $t('users.profile.birthday.label') }}
                      </div>

                      <h-date-picker
                        v-model="profile.birthday"
                        :input-props="{
                          placeholder: $t('users.profile.birthday.placeholder'),
                        }"
                      />
                    </div>

                    <div class="box-country" style="width: 100%">
                      <div class="label label-country">
                        {{ $t('users.profile.country.label') }}
                      </div>
                      <v-autocomplete
                        v-model="profile.country"
                        :label="$t('users.profile.country.placeholder')"
                        :items="countries"
                        item-value="ID"
                        item-text="NAME"
                        :loading="loadingCountries"
                        :no-data-text="$t('default.noDataText')"
                        outlined
                        solo
                        flat
                        dense
                        hide-details
                        autocomplete="off"
                        return-object
                      />
                    </div>
                  </div>

                  <div class="settings-row">
                    <div class="box-pref-language" style="min-width: 160px">
                      <div class="label-fixed">
                        {{ $t('users.profile.language') }}
                      </div>

                      <v-menu content-class="menu-languages" offset-y top>
                        <template #activator="{ on }">
                          <v-btn
                            class="language"
                            tile
                            depressed
                            text
                            :ripple="false"
                            v-on="on"
                          >
                            <img
                              :src="getImgUrl(locale.name)"
                              :alt="locale.name"
                            />
                            {{ $t(`languages.${locale.name}`) }}
                          </v-btn>
                        </template>

                        <v-list class="box-language">
                          <v-list-item
                            v-for="lang in langs(locale)"
                            :key="lang.key"
                            style="padding-left: 20px"
                            @click="changeLocale(lang)"
                          >
                            <img :src="getImgUrl(lang.name)" :alt="lang.name" />
                            <v-list-item-title>
                              {{ $t(`languages.${lang.name}`) }}
                            </v-list-item-title>
                          </v-list-item>
                        </v-list>
                      </v-menu>
                    </div>

                    <div class="box-timezone" style="min-width: 250px">
                      <div class="label-fixed" style="margin-left: 12px">
                        {{ $t('users.profile.timezone') }}
                      </div>

                      <v-autocomplete
                        v-model="profile.timezone"
                        :label="$t('users.profile.timezone')"
                        :items="timezones"
                        item-value="ID"
                        :item-text="t => `${t.NAME} - ${t.DESCRIPTION}`"
                        :loading="loadingTimezones"
                        :no-data-text="$t('default.noDataText')"
                        solo
                        flat
                        dense
                        hide-details
                        autocomplete="off"
                        return-object
                      />
                    </div>
                  </div>

                  <div class="label-fixed">
                    {{ $t('users.profile.contactInformation') }}
                  </div>

                  <div class="label label-current-email">
                    {{ $t('users.profile.currentEmail.label') }}
                  </div>
                  <v-text-field
                    v-model="profile.email"
                    :placeholder="$t('users.profile.currentEmail.placeholder')"
                    color="rgba(0,0,0,0.9)"
                    solo
                    outlined
                    dense
                    hide-details
                    autocomplete="off"
                    disabled
                  />

                  <div class="settings-row">
                    <div class="box-mobile">
                      <div class="label label-mobile">
                        {{ $t('users.profile.mobile.label') }}
                      </div>
                      <v-text-field
                        v-model="profile.mobile"
                        :placeholder="$t('users.profile.mobile.placeholder')"
                        color="rgba(0,0,0,0.9)"
                        solo
                        outlined
                        dense
                        hide-details
                        autocomplete="off"
                      />
                    </div>

                    <div class="box-alternative-number">
                      <div class="label label-alternative-number">
                        {{ $t('users.profile.alternativeNumber.label') }}
                      </div>
                      <v-text-field
                        v-model="profile.phone_number"
                        :placeholder="
                          $t('users.profile.alternativeNumber.placeholder')
                        "
                        color="rgba(0,0,0,0.9)"
                        solo
                        outlined
                        dense
                        hide-details
                        autocomplete="off"
                      />
                    </div>
                  </div>
                </v-form>

                <div class="form-actions">
                  <v-btn
                    v-if="!$scopedSlots['actions']"
                    color="#0000004d"
                    depressed
                    tile
                    outlined
                    height="32px"
                    @click="cancelProfile"
                  >
                    {{ $t('dialog.cancel') }}
                  </v-btn>
                  <v-btn
                    v-if="!$scopedSlots['actions']"
                    class="white--text"
                    color="#fa4600"
                    depressed
                    tile
                    height="32px"
                    :loading="saving"
                    @click="saveProfile"
                  >
                    {{ $t('dialog.save') }}
                  </v-btn>
                </div>
              </div>
            </v-window-item>

            <v-window-item key="2">
              <div class="content-header">
                {{ $t('users.account.title') }}
              </div>

              <div class="content-account">
                <v-form ref="formPassword" @submit.prevent>
                  <div class="label-fixed">
                    {{ $t('users.account.userInformation') }}
                  </div>

                  <div class="label label-dense">
                    {{ $t('users.account.currentPassword') }}
                  </div>
                  <v-text-field
                    v-model="password.current"
                    type="password"
                    :placeholder="$t('users.account.currentPassword')"
                    color="rgba(0,0,0,0.9)"
                    outlined
                    solo
                    flat
                    dense
                    :error-messages="password.errorMessage"
                    :rules="[rule.required, rule.min]"
                    :loading="password.checking"
                    @focus="password.errorMessage = null"
                    @change="verifyPassword"
                  />

                  <div class="label label-dense">
                    {{ $t('users.account.newPassword') }}
                  </div>
                  <v-text-field
                    v-model="password.new"
                    type="password"
                    :placeholder="$t('users.account.newPassword')"
                    color="rgba(0,0,0,0.9)"
                    outlined
                    solo
                    flat
                    dense
                    :rules="[rule.required, rule.min]"
                  />

                  <div class="label label-dense">
                    {{ $t('users.account.confirmPassword') }}
                  </div>
                  <v-text-field
                    v-model="password.confirm"
                    type="password"
                    :placeholder="$t('users.account.confirmPassword')"
                    color="rgba(0,0,0,0.9)"
                    outlined
                    solo
                    flat
                    dense
                    :rules="[rule.required, rule.min]"
                  />
                </v-form>

                <!-- <div class="label-fixed">
                  {{ $t('users.account.linkedAccount') }}
                </div>

                <div class="linked-accounts">
                  <div v-for="item in linked" :key="item" class="linked">
                    {{ item }}
                    <v-icon>{{ `hi-${item}` }}</v-icon>
                  </div>
                </div>

                <div class="label-fixed">
                  {{ $t('users.account.lastLogin') }}
                </div> -->

                <div class="form-actions">
                  <v-btn
                    v-if="!$scopedSlots['actions']"
                    color="#0000004d"
                    depressed
                    tile
                    outlined
                    height="32px"
                    @click="clearPassword"
                  >
                    {{ $t('dialog.cancel') }}
                  </v-btn>
                  <v-btn
                    v-if="!$scopedSlots['actions']"
                    class="white--text"
                    color="#fa4600"
                    depressed
                    tile
                    height="32px"
                    :loading="saving"
                    @click="savePassword"
                  >
                    {{ $t('dialog.save') }}
                  </v-btn>
                </div>
              </div>
            </v-window-item>

            <v-window-item key="3">
              <div class="content-header">
                {{ $t('users.about.title') }}
              </div>

              <div class="content-about no-padding">
                <div class="box-options">
                  <div class="about-option" @click="visitChannel('facebook')">
                    <div class="text">
                      <v-icon>hi-facebook</v-icon>
                      {{ $t('users.about.facebook') }}
                    </div>
                    <v-icon>hi-launch</v-icon>
                  </div>
                  <div class="about-option" @click="visitChannel('instagram')">
                    <div class="text">
                      <v-icon>hi-instagram</v-icon>
                      {{ $t('users.about.instagram') }}
                    </div>
                    <v-icon>hi-launch</v-icon>
                  </div>
                  <div class="about-option" @click="visitChannel('twitter')">
                    <div class="text">
                      <v-icon>hi-twitter</v-icon>
                      {{ $t('users.about.twitter') }}
                    </div>
                    <v-icon>hi-launch</v-icon>
                  </div>
                  <div class="about-option" @click="visitChannel('website')">
                    <div class="text">
                      <v-icon>hi-globe</v-icon>
                      {{ $t('users.about.site') }}
                    </div>
                    <v-icon>hi-launch</v-icon>
                  </div>
                </div>

                <div class="content-footer no-padding">
                  <div class="text version">
                    {{ `${$t('users.about.version')} ${$version}` }}
                  </div>
                  <div class="text">Header DX &copy; 2019</div>
                  <div class="text">Header Interactive &copy; 2019</div>
                </div>
              </div>
            </v-window-item>

            <!-- <v-window-item key="3">
              <div class="content-header">
                {{ $t('users.activity.title') }}
              </div>
            </v-window-item>

            <v-window-item key="4">
              <div class="content-header">
                {{ $t('users.privacy.title') }}
              </div>
            </v-window-item>

            <v-window-item key="5">
              <div class="content-header">
                {{ $t('users.payment.title') }}
              </div>
            </v-window-item>

            <v-window-item key="6">
              <div class="content-header">
                {{ $t('users.billing.title') }}
              </div>
            </v-window-item>

            <v-window-item key="7">
              <div class="content-header">
                {{ $t('users.notifications.title') }}
              </div>
            </v-window-item>

            <v-window-item key="8">
              <div class="content-header">
                {{ $t('users.display.title') }}
              </div>
            </v-window-item>

            <v-window-item key="9">
              <div class="content-header">
                {{ $t('users.about.title') }}
              </div>
            </v-window-item>

            <v-window-item key="10">
              <div class="content-header">
                {{ $t('users.custom.title') }}
              </div>
            </v-window-item> -->
          </v-window>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Ref, Watch } from 'vue-property-decorator';
import { Getter, Mutation, Action } from 'vuex-class';

import { api, retry } from '@/services/axios';
import { toast } from '@/plugins/events';
import { Rules } from '@/utils/types';
import { ILanguage } from '@/store/modules/system';
import { ICountry } from '@/store/modules/system/countries';
import { IUser, IUserLogged } from '@/store/modules/user';
import { ITimezone } from '@/store/modules/system/timezones';

type Channels = 'facebook' | 'instagram' | 'twitter' | 'website';

interface FormProfile {
  huid: string | null;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  birthday: string | null;
  language_code: string | null;
  mobile: string | null;
  phone_number: string | null;
  gender: 'F' | 'M' | 'NA' | null;
  country: ICountry | null;
  timezone: ITimezone | null;
}

interface FormPassword {
  errorMessage: string | null;
  checking: string | boolean;
  invalid: string | boolean;
  current: string | null;
  new: string | null;
  confirm: string | null;
}

@Component
export default class UserSettings extends Vue {
  @Ref('formPassword') private formPassword!: HTMLFormElement;

  private loading = false;
  private loadingTimezones = false;
  private loadingCountries = false;

  private valid = false;
  private saving = false;
  private step = 0;

  private options = [
    'profile',
    'account',
    'about',
    // 'notifications',
    // 'privacy',
    // 'payment',
    // 'billing',
    // 'activity',
    // 'display',
    // 'custom',
  ];
  private linked = ['facebook', 'instagram', 'twitter'];

  private gender = [
    {
      value: 'M',
      text: 'male',
    },
    {
      value: 'F',
      text: 'female',
    },
    {
      value: 'NA',
      text: 'notApplicable',
    },
  ];
  private hidden = ['UID'];

  private profile: FormProfile = {
    huid: null,
    email: null,
    first_name: null,
    last_name: null,
    birthday: null,
    language_code: null,
    mobile: null,
    phone_number: null,
    gender: null,
    country: null,
    timezone: null,
  };

  private password: FormPassword = {
    errorMessage: null,
    checking: false,
    invalid: true,
    current: null,
    new: null,
    confirm: null,
  };

  private rule: Rules = {
    currentPassword: v => !!v || this.$t('formRules.password.invalid'),
    required: v => !!v || this.$t('formRules.required.error'),
    min: v => (v && v.length >= 8) || this.$tc('formRules.min.error', 8),
  };

  get hasAlert(): boolean {
    return !!this.alertMessage;
  }

  @Getter('system/languages')
  private languages!: ILanguage[];

  @Getter('countries/list')
  private countries!: ICountry[];

  @Getter('timezones/list')
  private timezones!: ITimezone[];

  @Getter('system/locale')
  private locale!: ILanguage;

  @Getter('system/alert')
  private alertMessage!: ILanguage;

  @Getter('user/profile')
  private user!: IUser;

  @Watch('$route.hash')
  onRouteHashChange(value: string): void {
    if (!value) return this.setMenuActive(0);
    let tab = this.options.findIndex(item => value.split('#')[1] === item);
    this.setMenuActive(tab);
  }

  @Mutation('system/setLocale')
  private setLocale!: (data: ILanguage) => void;

  @Mutation('user/set')
  private setCurrent!: (data: IUserLogged) => void;

  @Action('timezones/index')
  private getTimezones!: () => Promise<ITimezone[]>;

  @Action('countries/index')
  private getCountries!: () => Promise<ICountry[]>;

  @Action('user/update')
  private updateUser!: (data: Partial<FormProfile>) => Promise<IUser>;

  @Action('user/checkPassword')
  private checkPassword!: (data: string) => Promise<any>;

  mounted(): void {
    this.prepareSelects();
    this.cancelProfile();
  }

  created(): void {
    if (!this.$route.hash) return this.setMenuActive(0);
    let tab = this.options.findIndex(item => {
      return this.$route.hash.split('#')[1] === item;
    });
    this.setMenuActive(tab);
  }

  cancelProfile(): void {
    retry<IUser>({ axios: api, url: `/users` }).then(res => {
      this.profile = {
        huid: res.data.HUID,
        email: res.data.EMAIL,
        first_name: res.data.FIRST_NAME,
        last_name: res.data.LAST_NAME,
        gender: res.data.GENDER,
        birthday: res.data.BIRTHDAY,
        mobile: res.data.MOBILE,
        phone_number: res.data.PHONE_NUMBER,
        language_code: res.data.LANGUAGE_CODE,
        timezone: res.data.TIMEZONE,
        country: res.data.COUNTRY,
      };
    });
  }

  changeLocale(lang: ILanguage): void {
    const htmlTag = document.querySelector('html');
    if (htmlTag) htmlTag.setAttribute('lang', lang.key);

    this.$i18n.locale = lang.key;
    this.profile.language_code = lang.key;
    this.setLocale(lang);
  }

  clearPassword(): void {
    this.formPassword.resetValidation();

    this.password = {
      errorMessage: null,
      checking: false,
      invalid: true,
      current: null,
      new: null,
      confirm: null,
    };
  }

  getImgUrl(img: string): string {
    const images = require.context('@/assets/locales', true, /\.svg$/);
    return images('./' + img + '.svg');
  }

  langs(lang: ILanguage): ILanguage[] {
    return this.languages.filter(l => l.key !== lang.key);
  }

  prepareSelects(): void {
    this.loadingTimezones = true;
    this.loadingCountries = true;
    this.getTimezones()
      .then(() => {
        this.loadingTimezones = false;
      })
      .catch(() => {
        this.loadingTimezones = false;
      });

    this.getCountries()
      .then(() => {
        this.loadingCountries = false;
      })
      .catch(() => {
        this.loadingCountries = false;
      });
  }

  savePassword(): void {
    if (this.password.new === this.password.confirm) {
      const data = {
        oldPassword: this.password.current,
        pass: this.password.new,
        confirmPassword: this.password.confirm,
        email: this.user.EMAIL,
      };

      this.$log.debug(`Changing password`);

      this.saving = true;

      this.updateUser(data)
        .then(() => {
          this.clearPassword();
          toast.success(this.$t('toast.users.updated'));
          this.saving = false;
        })
        .catch(() => {
          this.saving = false;
        });
    }
  }

  saveProfile(): void {
    this.saving = true;
    this.$log.debug(`Saving profile`);

    this.updateUser(this.profile)
      .then(data => {
        this.profile = {
          huid: data.HUID,
          email: data.EMAIL,
          first_name: data.FIRST_NAME,
          last_name: data.LAST_NAME,
          gender: data.GENDER,
          birthday: data.BIRTHDAY,
          mobile: data.MOBILE,
          phone_number: data.PHONE_NUMBER,
          language_code: data.LANGUAGE_CODE,
          timezone: data.TIMEZONE,
          country: data.COUNTRY,
        };

        // this.changeLocale(data.LANGUAGE_CODE);
        this.setCurrent({
          email: data.EMAIL,
          huid: data.HUID,
          first_name: data.FIRST_NAME,
          last_name: data.LAST_NAME,
        });

        toast.success(this.$t('toast.users.updated'));
        this.saving = false;
      })
      .catch(() => {
        this.saving = false;
      });
  }

  setMenuActive(index: number): void {
    if (this.step === index) return;
    this.step = index;
    const fullPath = this.$route.path + '#' + this.options[index];
    if (this.$route.fullPath !== fullPath) this.$router.replace(fullPath);
  }

  verifyPassword(password: string): void {
    if (password.length > 7) {
      this.password.checking = true;

      this.checkPassword(password)
        .then(() => {
          this.password.checking = false;
          this.password.invalid = false;
          this.password.errorMessage = null;
        })
        .catch(() => {
          this.password.invalid = true;
          this.password.checking = false;
          this.password.errorMessage = this.$t(
            'toast.config.passwordError',
          ) as string;
        });
    }
  }

  visitChannel(channel: Channels): void {
    const channels = {
      facebook: 'https://facebook.com/headerinteractive',
      instagram: 'https://instagram.com/headerinteractive',
      twitter: 'https://twitter.com/headerinteract',
      website: 'https://www.headerinteractive.com',
    };
    window.open(channels[channel], '_blank');
  }
}
</script>

<style lang="scss">
.menu-languages {
  /* border: none !important; */

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

.user-settings {
  .box-content {
    .content {
      position: relative;
      display: flex;
      flex-direction: row;
      justify-content: center;
      width: 100%;

      .content-header {
        font-size: 1.4em;
        font-weight: 500;
        color: #000000;
        padding: 12px 24px;
        border-bottom: 1px solid rgba(#000000, 0.1);
      }

      textarea {
        line-height: 1.5em;
      }

      .settings {
        margin-right: 6px;
        width: 100%;
        max-width: 360px;
        background-color: #ffffff;

        .user-avatar {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 240px;
          background: #fafafa;

          .user-avatar-input {
            position: relative;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            width: 96px;
            height: 96px;
            border-radius: 50%;
            background: #e6e6e6;

            .hi-avatar {
              font-size: 48px;
              color: rgba(#000000, 0.1);
            }

            &:hover {
              label {
                opacity: 1;
                visibility: visible;
                pointer-events: all;
              }
            }

            label {
              position: absolute;
              right: 0;
              bottom: 0;
              width: 30px;
              height: 30px;
              opacity: 0;
              visibility: hidden;
              pointer-events: none;
              cursor: pointer;

              i {
                width: 100%;
                height: 100%;
              }

              input {
                position: absolute;
                right: 0;
                bottom: 0;
                display: none;
                width: 100%;
                height: 100%;
              }
            }
          }

          .user-name {
            margin-top: 32px;
            font-size: 1.6em;
            font-weight: 600;
          }

          .user-position {
            font-size: 1.6em;
            font-weight: 600;
            color: rgba(#000000, 0.4);
          }
        }

        .content-settings {
          .settings-option {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 18px 24px;
            height: 48px;
            cursor: pointer;

            &:hover {
              background: #fafafa;
            }

            &.active {
              background: #f5f5f5;
            }

            .text {
              font-size: 1.4em;
              color: #000;
            }

            .hi-keyboard-arrow-right {
              font-size: 16px;
            }
          }
        }
      }

      .settings-forms {
        position: relative;
        margin-left: 6px;
        width: 100%;
        max-width: 700px;
        min-height: calc(100vh - 100px);
        background-color: #ffffff;

        &.has-alert {
          min-height: calc(100vh - 136px);

          [class^='content-']:not(.content-header) {
            max-height: calc(100vh - 188px);
          }
        }

        .v-stepper {
          width: 100%;
          background: transparent;

          .v-stepper__content {
            padding: 0;
          }
        }

        [class^='content-']:not(.content-header) {
          padding: 24px;
          max-height: calc(100vh - 142px);
          overflow-y: auto;

          &.no-padding {
            padding: 0;
          }

          .settings-row {
            display: flex;
            margin-top: 24px;

            & > div:not(:first-child) {
              margin-left: 8px;
            }
          }

          .label {
            margin-bottom: 12px;
            font-size: 1.2em;
            font-weight: 500;
            color: #000000;

            &:not(:first-child) {
              margin-top: 24px;

              &.label-dense {
                margin-top: 6px;
              }
            }
          }

          .label-fixed {
            margin-bottom: 8px;
            font-weight: 500;
            color: rgba(#000000, 0.3);

            &:not(:first-child) {
              margin-top: 24px;
            }
          }

          .v-input--switch {
            padding-top: 0;
          }

          button.language {
            margin-top: 8px;
            padding: 0;

            img {
              margin-right: 8px;
            }
          }

          .linked-accounts {
            display: flex;
            white-space: nowrap;

            .linked {
              padding: 10px 4px;
            }
          }

          .form-actions {
            display: flex;
            align-items: center;
            justify-content: flex-end;
            margin-top: 48px;
            width: 100%;

            .v-btn {
              min-width: 120px;

              &:not(:first-child) {
                margin-left: 8px;
              }
            }
          }
        }

        .content-about {
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          height: 100%;

          .about-option {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 18px 24px;
            height: 48px;
            cursor: pointer;

            &:hover {
              background: #fafafa;
            }

            .text {
              font-size: 1.4em;
              color: #000;

              .hi {
                margin-right: 6px;
              }
            }

            .hi-launch {
              font-size: 16px;
            }
          }

          .content-footer {
            margin: 24px;
            border-top: 1px solid rgba(0, 0, 0, 0.1);
            user-select: none;

            .text {
              font-size: 1.2em;
              color: rgba(0, 0, 0, 0.6);

              &.version {
                color: #000;
                margin: 24px 0;
              }
            }
          }
        }
      }
    }
  }
}
</style>
