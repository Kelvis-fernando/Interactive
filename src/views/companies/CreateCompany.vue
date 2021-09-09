<template>
  <div :class="['create-company', !!alertMessage && 'has-alert']">
    <div v-if="!isLoading">
      <v-progress-linear color="#fa4600" :value="progress" />
      <div class="box-new-company">
        <v-stepper v-model="step">
          <v-stepper-items>
            <v-stepper-content :step="1">
              <v-form v-model="valid[1]" @submit.prevent>
                <div class="header">
                  {{ $t('createCompany.header') }}
                </div>
                <div class="name">
                  {{ $t('createCompany.steps.one.title') }}
                </div>
                <v-text-field
                  v-model="form.name"
                  color="rgba(0,0,0,0.9)"
                  :label="$t('createCompany.steps.one.companyName')"
                  :rules="[rules.required]"
                  autocomplete="off"
                />

                <v-text-field
                  v-model="form.reference"
                  color="rgba(0,0,0,0.9)"
                  :label="$t('createCompany.steps.one.displayName')"
                  :rules="[rules.required]"
                />

                <v-autocomplete
                  v-model="form.industry_id"
                  color="rgba(0,0,0,0.9)"
                  :loading="industries.length === 0"
                  :items="industries"
                  :label="$t('createCompany.steps.one.industry')"
                  :no-data-text="$t('default.noDataText')"
                  item-value="ID"
                  item-text="NAME"
                  item-color="rgba(0,0,0,0.9)"
                  append-icon="hi-select"
                  autocomplete="off"
                  :rules="[rules.required]"
                />

                <v-text-field
                  v-model="form.domain"
                  color="rgba(0,0,0,0.9)"
                  :label="$t('createCompany.steps.one.domain')"
                  :rules="[rules.required]"
                  persistent-hint
                  :hint="domainMessage"
                  :loading="searchingDomain"
                  :error-messages="errors.domain.message"
                  @change="searchDomain()"
                  @keyup.enter="nextStep()"
                  @focus="success.domain.message = ''"
                />
              </v-form>
            </v-stepper-content>

            <v-stepper-content :step="2">
              <v-form v-model="valid[2]" @submit.prevent>
                <div class="header">
                  {{ $t('createCompany.header') }}
                </div>
                <div class="name">
                  {{ $t('createCompany.steps.two.title') }}
                </div>
                <v-autocomplete
                  v-model="form.country_id"
                  color="rgba(0,0,0,0.9)"
                  :items="countries"
                  item-value="ID"
                  item-text="NAME"
                  :no-data-text="$t('default.noDataText')"
                  :label="$t('createCompany.steps.two.country')"
                  append-icon="hi-select"
                  autocomplete="off"
                  :loading="countries.length === 0"
                  :rules="[rules.required]"
                />
                <v-autocomplete
                  v-model="form.currency_id"
                  color="rgba(0,0,0,0.9)"
                  :items="currencies"
                  item-value="ID"
                  :item-text="v => `${v.NAME} (${v.SYMBOL})`"
                  :label="$t('createCompany.steps.two.currency')"
                  :no-data-text="$t('default.noDataText')"
                  append-icon="hi-select"
                  autocomplete="off"
                  :loading="currencies.length === 0"
                  :rules="[rules.required]"
                />
              </v-form>
            </v-stepper-content>

            <!-- <v-stepper-content :step="3">
              <v-form v-model="valid[3]" @submit.prevent>
              <div class="header">{{ $t('createCompany.header') }}</div>
              <div class="name">Personalize your instance</div>
              <div class="drag-file" v-cloak @drop.prevent="fileDragged" @dragover.prevent>
                <div class="image">
                  <img class="image-preview" v-if="preview" :src="preview" alt />
                  <v-icon v-else size="30" color="#0000004D">hi-company</v-icon>
                  <v-progress-circular
                    v-if="!loading"
                    color="#fa4600"
                    :indeterminate="loading"
                    :width="2"
                    :size="50"
                  />
                </div>
                <div class="drag-title">Drag your company logo here to upload</div>
                <div class="drag-subtitle">
                  Or
                  <strong style="color: #FA4614">click here</strong> to browse
                  your logo file
                </div>
                <input type="file" class="inputFile" @change="previewFile($event.target.files)" />
              </div>
              </v-form>
            </v-stepper-content>

            <v-stepper-content :step="4">
              <v-form v-model="valid[4]" @submit.prevent>
              <div class="header">{{ $t('createCompany.header') }}</div>
              <div class="name">Personalize your instance</div>
              <div class="edit-image" v-cloak @drop.prevent="fileDragged" @dragover.prevent>
                <div class="image">
                  <img class="image-preview" v-if="preview" :src="preview" alt />
                  <v-icon v-else size="30" color="#0000004D">hi-company</v-icon>
                  <v-progress-circular
                    v-if="!loadingFile"
                    color="#fa4600"
                    :indeterminate="loadingFile"
                    :width="2"
                    :size="50"
                  />
                </div>
              </div>
              </v-form>
            </v-stepper-content>-->

            <v-stepper-content :step="3">
              <v-form v-model="valid[3]" @submit.prevent>
                <div class="header">
                  {{ $t('createCompany.header') }}
                </div>
                <div class="name">
                  {{ $t('createCompany.steps.three.title') }}
                </div>

                <div class="terms-of-service">
                  <div>
                    {{ termsOfService }}
                  </div>
                </div>
                <v-checkbox
                  v-model="form.terms"
                  color="#fa4600"
                  :ripple="false"
                  :label="$t('createCompany.steps.three.accept')"
                  :rules="[rules.required]"
                />
              </v-form>
            </v-stepper-content>
          </v-stepper-items>
        </v-stepper>
        <div class="actions">
          <v-btn color="#0000004D" outlined depressed tile @click="backStep">
            {{
              step === 1
                ? companies.length > 0
                  ? $t('stepper.actions.cancel')
                  : $t('createCompany.logout')
                : $t('stepper.actions.back')
            }}
          </v-btn>
          <v-btn
            color="#fa4600"
            depressed
            tile
            :disabled="!valid[step] || !success.domain.status"
            class="white--text"
            @click="nextStep"
          >
            {{
              step === steps
                ? $t('stepper.actions.finish')
                : $t('stepper.actions.next')
            }}
          </v-btn>
        </div>
      </div>
    </div>

    <div v-else class="loading">
      <v-progress-circular
        color="#fa4600"
        :width="3"
        :size="39.2"
        indeterminate
      />
      <div class="message">
        {{ $t('createCompany.creatingMessage') }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
/*
 * adicionei umas interface, pois geralmente vc terá que usar,
 * em algum retorno ou então para "tipar" alguma váriavel
 * pois em ts temos que tipar tudo
 */
import { Component, Vue, Watch } from 'vue-property-decorator';
import { Getter, Mutation, Action } from 'vuex-class';
import { TranslateResult } from 'vue-i18n';

import { api, retry } from '@/services/axios';

import { ICompany } from '@/store/modules/companies';
import { IIndustry } from '@/store/modules/system/industries';
import { ICountry } from '@/store/modules/system/countries';
import { ICurrency } from '@/store/modules/system/currencies';

import { isDomainValid } from '@/utils/helpers';

interface Form {
  name?: string;
  reference?: string;
  domain?: string;
  industry_id?: number;
  country_id?: number;
  currency_id?: number;
  terms: boolean;
}

@Component
export default class CreateCompany extends Vue {
  private valid = {
    1: false,
    2: false,
    3: false,
  };
  private termsOfService = '';
  private step: 1 | 2 | 3 = 1;
  private steps = 3;
  private progress = 100 / 3;
  private files: File[] = [];
  private loadingFile = false;
  private preview = '';
  private searchingDomain = false;
  private form: Form = {
    name: undefined,
    reference: undefined,
    domain: undefined,
    industry_id: undefined,
    country_id: undefined,
    currency_id: undefined,
    terms: false,
  };
  private errors: {
    domain: {
      status: boolean;
      message: string | TranslateResult;
    };
  } = {
    domain: {
      status: false,
      message: '',
    },
  };
  private success: {
    domain: {
      status: boolean;
      message: string | TranslateResult;
    };
  } = {
    domain: {
      status: false,
      message: '',
    },
  };

  private rules = {
    required: (value: string | undefined): boolean | TranslateResult =>
      !!value || this.$t('formRules.required.error'),
  };

  get domainMessage(): string | TranslateResult {
    return (
      this.success.domain.message || this.$t('formRules.domain.hint.example')
    );
  }

  get hasAlert(): boolean {
    return !!this.alertMessage;
  }

  @Getter('system/isLoading')
  private isLoading!: boolean;

  @Getter('system/alert')
  private alertMessage: string | undefined;

  @Getter('companies/list')
  private companies!: ICompany[];

  @Getter('industries/list')
  private industries!: IIndustry[];

  @Getter('countries/list')
  private countries!: ICountry[];

  @Getter('currencies/list')
  private currencies!: ICurrency[];

  @Mutation('system/setLoading')
  private setLoading!: (data: boolean) => void;

  @Mutation('auth/destroy')
  private logout!: () => Promise<void>;

  @Action('industries/getIndustries')
  private getIndustries!: () => IIndustry[];

  @Action('countries/getCountries')
  private getCountries!: () => ICountry[];

  @Action('currencies/getCurrencies')
  private getCurrencies!: () => ICurrency[];

  @Action('companies/store')
  private createCompany!: (data: Form) => Promise<ICompany>;

  @Watch('form.domain')
  onDomainChange(domain: string): void {
    if (domain.indexOf('http://') || domain.indexOf('https://')) {
      this.form.domain = domain.replace('https://', '');
      this.form.domain = domain.replace('http://', '');
    }
    this.success.domain.status = false;
  }

  created(): void {
    this.getIndustries();
  }

  backStep(): void {
    if (this.step === 1) {
      if (this.companies.length > 0) {
        this.$router.push('/companies/choose-company');
        return;
      }

      this.logout().then(() => this.$router.push('/auth/login'));
    }
    this.step -= 1;
    this.progress -= 100 / (this.steps - 1);
  }

  /*
   * tem que tipar o e
   */
  fileDragged(e: DragEvent): void {
    this.loadingFile = true;
    let droppedFiles = e.dataTransfer && e.dataTransfer.files;
    if (!droppedFiles) return;

    this.previewFile(droppedFiles);
    Array.from(droppedFiles).forEach(f => {
      this.files.push(f);
    });
  }

  /*
   * remover as "," entre os métodos
   */
  handleUpload(): void {
    // let formData = new FormData();
    // this.files.forEach((f, x) => {
    //   formData.append('file' + (x + 1), f);
    // });
    // api('upload', {
    //   method: 'POST',
    //   data: formData,
    // })
    //   .then(res => res.json())
    //   .then(res => {
    //     console.log('done uploading', res);
    //   })
    //   .catch(e => {
    //     console.error(JSON.stringify(e.message));
    //   });
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

  previewFile(file: FileList): void {
    if (file[0]) {
      this.isLoading = true;
      this.preview = URL.createObjectURL(file[0]);
      this.isLoading = false;
    }
  }

  save(): void {
    this.setLoading(true);
    this.createCompany(this.form)
      .then(() => {
        this.$router.push('/companies/ch oose-company');
      })
      .catch(() => {
        this.setLoading(false);
      });
  }

  searchDomain(): void {
    let val = this.form.domain;
    if (!val) return;

    if (val == '') {
      this.errors.domain.status = false;
      this.errors.domain.message = '';
      return;
    }

    this.searchingDomain = true;
    if (val.indexOf('://') >= 0) val = val.split('://')[1];
    if (val.indexOf(':\\') >= 0) val = val.split(':\\')[1];

    this.form.domain = val;
    if (!isDomainValid(this.form.domain)) return;

    retry<Record<string, string>>({
      axios: api,
      url: `/companies/domains/${this.form.domain}`,
    })
      .then(res => {
        this.searchingDomain = false;
        this.errors.domain.message = '';
        this.success.domain.message = this.$t(
          'formRules.domain.hint.available',
        );

        this.success.domain.status = true;

        if (!res.data.message) {
          this.success.domain.status = false;
          this.errors.domain.message = this.$t('formRules.domain.error.exists');
          this.success.domain.message = '';
        }
      })
      .catch(error => {
        this.searchingDomain = false;
        this.success.domain.status = false;
        this.errors.domain.message = error.message;
      });
  }
}
</script>

<style lang="scss">
.create-company {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: calc(100vh - 48px);

  &.has-alert {
    height: calc(100vh - 84px);
  }

  .v-input {
    font-size: inherit !important;

    .v-label {
      font-size: 1.4em !important;
    }

    input {
      font-size: 1.2em;
    }

    .v-text-field__details {
      font-size: 1.2em;
    }
  }

  .loading {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    .message {
      margin-top: 30px;
      color: #000;
      font-size: 2.2em;
      font-weight: 500;
    }
  }

  .box-new-company {
    position: relative;
    padding: 24px 24px 32px;
    width: 532px;
    max-width: 532px;
    height: 540px;
    background: #ffffff;

    .header {
      font-size: 1.4em;
      font-weight: 500;
      color: rgba(#000000, 0.3);
    }

    .name {
      width: 224px;
      margin: 10px 0 20px;
      font-size: 2.8em;
      font-weight: 300;
      line-height: 1.2;
    }

    .drag-file {
      border: 1.5px dashed rgba(#000000, 0.1);
      background: #fafafa;
    }

    .edit-image,
    .drag-file {
      position: relative;
      width: 436px;
      height: 248px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;

      .image {
        position: relative;
        display: flex;
        justify-content: center;
        width: 100px;
        height: 100px;
        padding: 20px;
        border-radius: 50%;
        border: 2px solid rgba(#000000, 0.1);

        .image-preview {
          position: absolute;
          top: 0;
          height: 100%;
          width: 100%;
          border-radius: 50%;
          background: transparent;
        }
      }
      .inputFile {
        position: absolute;
        width: 100%;
        height: 100%;
        opacity: 0;
        cursor: pointer;
      }
      .drag-title {
        margin-top: 32px;
        color: rgba(#000000, 0.6);
        font-size: 18px;
        font-weight: 400;
      }
      .drag-subtitle {
        color: rgba(#000000, 0.3);
        font-size: 12px;
      }
    }
    .terms-of-service {
      border: 1px solid rgba(#000000, 0.1);

      & > div {
        padding: 2em;
        min-height: 18em;
        height: 100%;
        max-height: 18em;
        white-space: pre-wrap;
        overflow-y: auto;
      }
    }

    .terms-of-service .ps {
      padding: 24px;
      max-height: 20em;
    }

    .terms-of-service div {
      font-size: 12px;
      color: rgba(#000000, 0.6);
    }
    .actions {
      position: absolute;
      right: 48px;
      bottom: 36px;
      text-align: right;

      button {
        margin-left: 12px;
        min-width: 124px;
      }
    }
  }
}
</style>
