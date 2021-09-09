<template>
  <h-dialog
    v-model="dialog"
    content-class="create-database"
    persistent
    :title="showTitle()"
    @close="close"
  >
    <template v-if="hasAtivator" #activator="{ on }">
      <v-btn class="white--text" color="#FA4600" tile depressed v-on="on">
        {{ $t('databases.create.title') }}
      </v-btn>
    </template>

    <template #content>
      <v-stepper v-model="step">
        <v-stepper-items>
          <v-stepper-content :step="1">
            <v-form ref="formStepOne" v-model="valid[1]" @submit.prevent>
              <div class="content database-name">
                <div class="label-name">
                  {{ $t('databases.create.name.label') }}
                </div>
                <v-text-field
                  v-model="form.params.name"
                  type="text"
                  :placeholder="$t('databases.create.name.placeholder')"
                  color="rgba(0,0,0,0.9)"
                  outlined
                  solo
                  flat
                  dense
                  autocomplete="off"
                  :rules="[rules.required]"
                />
                <div class="label-category">
                  {{ $t('databases.create.category.label') }}
                </div>
                <v-radio-group v-model="form.params.type" mandatory>
                  <v-radio
                    :label="$t('databases.create.category.prod')"
                    :ripple="false"
                    color="#FA6400"
                    :value="5"
                  />
                  <v-radio
                    :label="$t('databases.create.category.dev')"
                    :ripple="false"
                    color="#FA6400"
                    :value="4"
                  />
                </v-radio-group>
              </div>
            </v-form>
          </v-stepper-content>

          <v-stepper-content :step="2">
            <v-form ref="formStepTwo" v-model="valid[2]" @submit.prevent>
              <div class="content upload-question">
                <div class="label-upload">
                  {{ $t('databases.create.upload.label') }}
                </div>
                <v-radio-group v-model="uploadFile" mandatory>
                  <v-radio
                    :label="$t('default.yes')"
                    :ripple="false"
                    color="#FA6400"
                    :value="true"
                  />
                  <v-radio
                    :label="$t('default.no')"
                    :ripple="false"
                    color="#FA6400"
                    :value="false"
                  />
                </v-radio-group>
              </div>
            </v-form>
          </v-stepper-content>

          <v-stepper-content :step="3">
            <div class="upload-database">
              <div class="upload-box-tabs">
                <div class="tabs-label">
                  {{ $t('databases.create.upload.selectSource') }}
                </div>

                <h-box-tabs
                  :tabs="uploadTabs"
                  :active="uploadTab"
                  :full-width="false"
                  @tab="uploadTab = $event"
                />
              </div>

              <v-stepper v-model="uploadTab">
                <v-stepper-items>
                  <v-stepper-content :step="1">
                    <div class="upload-content tab-one">
                      <h-upload-file
                        :height="280"
                        @new-file="newFile"
                        @remove-file="removeFile"
                      />
                    </div>
                  </v-stepper-content>

                  <v-stepper-content :step="2">
                    <div class="upload-content tab-two">
                      <div :class="['table', loadingPreview && 'loading']">
                        <div v-if="loadingPreview" class="loading-preview">
                          <v-progress-circular
                            indeterminate
                            size="80"
                            width="2"
                            color="#00000099"
                          />
                        </div>

                        <h-data-table
                          class="table-data"
                          :headers="uploadHeaders"
                          :items="assets.items"
                          :loading="loadingAssets"
                          item-key="ID"
                          :item-class="isActive"
                          row-click
                          @click:row="setAsset"
                        >
                          <template #[`item.remove`]="{ item }">
                            <div
                              v-if="importing.params.asset_id === item.ID"
                              class="is-selected"
                            >
                              <v-icon>hi-file-blank</v-icon>
                            </div>
                            <div class="remove-file" @click.stop="removeFile">
                              <v-icon>close</v-icon>
                            </div>
                          </template>
                        </h-data-table>
                      </div>
                    </div>
                  </v-stepper-content>
                </v-stepper-items>
              </v-stepper>
            </div>
          </v-stepper-content>

          <v-stepper-content :step="4">
            <div class="data-preview">
              <div class="data-preview-actions">
                <div class="action-checkbox">
                  <v-checkbox
                    v-model="firstRowIsHeaders"
                    color="#fa4600"
                    :label="$t('databases.create.dataPreview.headers')"
                    hide-details
                    :ripple="false"
                    :rules="[rules.required]"
                    @input="validateDataPreview"
                  />
                </div>

                <div class="date-format">
                  <div>
                    {{ $t('databases.create.dataPreview.dateFormat') }}
                  </div>

                  <v-select
                    v-model="form.params.date_type"
                    color="rgba(0,0,0,0.9)"
                    :items="['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD']"
                    :label="$t('databases.create.dataPreview.selectFormat')"
                    solo
                    outlined
                    dense
                    hide-details
                    @change="validateDataPreview"
                  />
                </div>
              </div>

              <div class="content data-preview-content">
                <v-simple-table height="264px">
                  <template #default>
                    <thead>
                      <tr>
                        <th v-for="(header, hKey) in fileHeaders" :key="hKey">
                          {{ header }}
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      <tr v-for="(row, rKey) in fileItems" :key="rKey">
                        <td v-for="(column, cKey) in row" :key="cKey">
                          {{ column }}
                        </td>
                      </tr>
                    </tbody>
                  </template>
                </v-simple-table>
              </div>
            </div>
          </v-stepper-content>

          <v-stepper-content :step="5">
            <div class="map-fields">
              <div class="box-headers">
                <div class="file">
                  <div class="label">
                    {{ $t('databases.create.mapFields.from') }}
                  </div>
                  <div class="name">
                    <v-icon>hi-file-blank</v-icon>
                    <span>{{ file ? file.name : $t('files.noFile') }}</span>
                  </div>
                </div>

                <div class="database">
                  <div class="label">
                    {{ $t('databases.create.mapFields.to') }}
                  </div>
                  <div class="name">
                    <v-icon>hi-database</v-icon>
                    <span>{{ form && form.params.name }}</span>
                  </div>
                </div>
              </div>

              <div :class="['box-fields', mapping && 'mapping']">
                <div v-if="mapping" class="mapping">
                  <v-progress-circular
                    indeterminate
                    size="80"
                    width="2"
                    color="#00000099"
                  />
                </div>

                <div class="client-fields">
                  <div class="list">
                    <div
                      v-for="(item, index) in clientFields"
                      :key="index"
                      class="item-list"
                    >
                      <div class="item">{{ item.name }}</div>
                      <v-icon
                        :class="[
                          'arrow',
                          databaseFields[index] !== undefined ? 'active' : '',
                        ]"
                        >hi-transfer</v-icon
                      >
                    </div>
                  </div>
                </div>

                <div class="system-fields">
                  <div class="list">
                    <div
                      v-for="(item, index) in clientFields"
                      :key="index"
                      class="item"
                    >
                      <v-select
                        :key="
                          databaseFields[index]
                            ? databaseFields[index].name
                            : item.name
                        "
                        :value="databaseFields[index]"
                        :menu-props="{
                          contentClass: 'select-available-fields',
                        }"
                        :label="$t('databases.create.mapFields.select')"
                        :items="availableFields(databaseFields[index])"
                        item-text="name"
                        item-value="name"
                        outlined
                        solo
                        hide-details
                        return-object
                        @change="$emit('set-database-field', index, $event)"
                      />
                      <v-icon @click="removeField(index)">hi-close</v-icon>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </v-stepper-content>

          <v-stepper-content :step="6">
            <h-set-database-fields
              box-add-field
              :dialog-close="!dialog"
              :client-fields="clientFields"
              :form="form"
              :file="file"
              :hide-fields="hideFields"
              @close="close"
              @validate-resume="validateResume"
            />
          </v-stepper-content>

          <v-stepper-content :step="7">
            <div class="validate">
              <div class="validate-infos">
                <div>
                  <div class="database">
                    <div class="label">
                      {{ $t(`databases.create.database`) }}
                    </div>
                    <div class="name">
                      <v-icon>hi-database</v-icon>
                      {{ form.name }}
                    </div>
                  </div>

                  <div class="file">
                    <div class="label">
                      {{ $t('files.fileUploaded') }}
                    </div>
                    <div class="name">
                      <v-icon>hi-file-blank</v-icon>
                      {{ file ? file.name : $t('files.noFile') }}
                    </div>
                  </div>
                </div>

                <div class="rows">
                  {{
                    `${$tc(
                      'files.validRows',
                      validateData.valids.length,
                    )} / ${$tc('default.errors', validateData.invalids.length)}`
                  }}
                </div>
              </div>

              <div :class="['table', validating && 'validating']">
                <div v-if="validating" class="validating">
                  <v-progress-circular
                    indeterminate
                    size="80"
                    width="2"
                    color="#00000099"
                  />
                </div>

                <h-data-table
                  class="validate-table"
                  :headers="validateData.headers"
                  :items="validateData.valids.slice(0, 20)"
                  height="274px"
                  :show-timestamps="false"
                >
                  <template #[`item.created_at`]="">
                    {{ showDateTimeFormatted(new Date().toISOString()) }}
                  </template>

                  <template #[`item.updated_at`]="">
                    {{ showDateTimeFormatted(new Date().toISOString()) }}
                  </template>
                </h-data-table>
              </div>
            </div>
          </v-stepper-content>
        </v-stepper-items>
      </v-stepper>
    </template>

    <template #actions-message>
      <div class="actions-message">
        <a
          v-if="validateData.invalids.length > 0"
          :href="validateData.url"
          :download="validateData.exportedFilename"
        >
          <v-icon>hi-download</v-icon>
          {{ `${$tc('default.errors', validateData.invalids.length)}.` }}
          <span class="download">{{ $t('files.download') }}</span>
        </a>

        <span class="message">{{ dialogMessage() }}</span>
      </div>
    </template>

    <template #actions>
      <div class="actions">
        <v-btn color="#00000099" outlined depressed tile @click="backStep">
          {{
            step === 1
              ? $t('stepper.actions.cancel')
              : $t('stepper.actions.back')
          }}
        </v-btn>

        <v-btn
          class="white--text"
          color="#fa4600"
          depressed
          tile
          :disabled="!valid[step]"
          :loading="saving"
          @click="nextStep"
        >
          {{
            step === steps
              ? $t('stepper.actions.finish')
              : $t('stepper.actions.next')
          }}
        </v-btn>
      </div>
    </template>
  </h-dialog>
</template>

<script lang="ts">
import { Component, Vue, Ref, Prop, Watch } from 'vue-property-decorator';
import { Getter, Action } from 'vuex-class';
import { TranslateResult } from 'vue-i18n';
import Worker from 'easy-web-worker';
import Papa from 'papaparse';

import { contentmanager, retry } from '@/services/axios';
import { calcFileSize, verifyFileRequeriments } from '@/utils/helpers';
import { Field, Rules } from '@/utils/types';
import { getDateTimeFormatted } from '@/utils/date';
import { toast } from '@/plugins/events';

import { IDatabase } from '@/store/modules/information-management/databases';
import { AssetState, IAsset } from '@/store/modules/content-manager/assets';
import { AxiosRequestConfig } from 'axios';

type Form = {
  params: {
    name: string | null;
    type: 4 | 5;
    contact_list_id: number | null;
    date_type: string | null;
    columns: Field[];
  };
  import?: Import;
};

type Import = {
  name: string | null;
  params: {
    asset_id: number | null;
    date_type: string | null;
    operation: string;
    columns: Record<'from' | 'to', string>[];
  };
};

type ValidateData = {
  total: number;
  headers: Record<string, any>[];
  invalids: Record<string, any>[];
  valids: Record<string, any>[];
  items: Record<string, any>[];
  exportedFilename: string;
  url: string;
};

type ValidateParams = {
  headers: Field[];
  fileContent: string[][];
  equivalentFields: Record<string, any>;
  errors: {
    missing: string;
    invalid: string;
    duplicated: string;
  };
};

type ValidateResponse = {
  invalids: Record<string, any>[];
  valids: Record<string, any>[];
  csv: string[][];
};

type SetItemsResponse = {
  isInvalid: boolean;
  row: Record<string, any>;
  email: string;
};

@Component
export default class CreateDatabase extends Vue {
  @Ref('formStepOne') private formStepOne!: HTMLFormElement;

  @Prop({ type: Object, default: () => ({}) })
  private editItem!: Record<string, any>;

  @Prop({ type: Boolean, default: false })
  private externalDialog!: boolean;

  @Prop({ type: Boolean, default: false })
  private hasAtivator!: boolean;

  @Prop({ type: Boolean, default: false })
  private isEditing!: boolean;

  private dialog = false;
  private loading = false;
  private validating = true;
  private saving = false;
  private mapping = false;

  private editID: number | null = null;
  private step = 1;
  private steps = 7;
  private valid = {
    1: false,
    2: true,
    3: false,
    4: false,
    5: false,
    6: false,
    7: false,
  };

  private loadingAssets = false;
  private uploadFile = true;
  private fromCM = false;
  private uploadTab = 0;
  private uploadTabs = [
    {
      text: this.$t('databases.create.upload.local'),
    },
    {
      text: this.$t('databases.create.upload.contentManager'),
    },
  ];
  private uploadHeaders = [
    {
      text: this.$t('default.headers.id'),
      value: 'ID',
    },
    {
      text: '',
      value: 'REMOVE',
      sortable: false,
    },
    {
      text: this.$t('default.headers.name'),
      value: 'NAME',
    },
    {
      text: this.$t('default.headers.format'),
      value: 'FORMAT_TYPE',
    },
    {
      text: this.$t('default.headers.size'),
      value: 'LENGTH_CONVERTED',
    },
    {
      text: this.$t('default.headers.owner'),
      value: 'OWNER',
    },
  ];
  private valueSeparetedBy = ',';
  private file: File | null = null;
  private loadingPreview = false;
  private firstRowIsHeaders = false;
  private filePreview: string[][] = [];
  private columns: Field[] = [
    {
      name: this.$t('databases.create.mapFields.personalField') as string,
      lookup_key: false,
      required: false,
      default: false,
      type: 'missing',
      editable: ['name', 'type', 'required', 'key'],
    },
  ];

  private defaultFields: Field[] = [
    {
      name: 'EMAIL',
      type: 'text',
      lookup_key: false,
      required: true,
      value: null,
      editable: [],
      default: true,
    },
    {
      name: 'LEAD SOURCE',
      type: 'text',
      lookup_key: false,
      required: false,
      value: null,
      editable: [],
      default: true,
    },
    {
      name: 'EMAIL TYPE',
      type: 'text',
      lookup_key: false,
      required: false,
      value: null,
      editable: [],
      default: true,
    },
    {
      name: 'EMAIL STATUS',
      type: 'text',
      lookup_key: false,
      required: false,
      value: null,
      editable: [],
      default: true,
    },
    {
      name: 'SMS STATUS',
      type: 'text',
      lookup_key: false,
      required: false,
      value: null,
      editable: [],
      default: true,
    },
    {
      name: 'PUSH STATUS',
      type: 'text',
      lookup_key: false,
      required: false,
      value: null,
      editable: [],
      default: true,
    },
    {
      name: 'OMNI STATUS',
      type: 'text',
      lookup_key: false,
      required: false,
      value: null,
      editable: [],
      default: true,
    },
    {
      name: 'SENTIMENT',
      type: 'text',
      lookup_key: false,
      required: false,
      value: null,
      editable: [],
      default: true,
    },
    {
      name: 'BEHAVIOR',
      type: 'text',
      lookup_key: false,
      required: false,
      value: null,
      editable: [],
      default: true,
    },
    {
      name: 'SCORE',
      type: 'numeric',
      lookup_key: false,
      required: false,
      value: null,
      editable: [],
      default: true,
    },
    {
      name: 'RANK',
      type: 'text',
      lookup_key: false,
      required: false,
      value: null,
      editable: [],
      default: true,
    },
    {
      name: 'MOBILE',
      type: 'text',
      lookup_key: false,
      required: false,
      value: null,
      editable: ['required', 'key'],
      default: true,
    },
    {
      name: 'EMAIL_VALIDATION',
      type: 'timestamp',
      lookup_key: false,
      required: false,
      value: false,
      editable: [],
      default: true,
    },
    {
      name: 'VALIDATION_RESULT',
      type: 'text',
      lookup_key: false,
      required: false,
      value: false,
      editable: [],
      default: true,
    },
    {
      name: 'REASON',
      type: 'text',
      lookup_key: false,
      required: false,
      value: false,
      editable: [],
      default: true,
    },
    {
      name: 'RISK',
      type: 'text',
      lookup_key: false,
      required: false,
      value: false,
      editable: [],
      default: true,
    },
    {
      name: 'IDENTIFIED',
      type: 'boolean',
      lookup_key: false,
      required: false,
      value: false,
      editable: [],
      default: true,
    },
    {
      name: 'FIRST_NAME',
      type: 'text',
      lookup_key: false,
      required: false,
      value: false,
      editable: [],
      default: true,
    },
    {
      name: 'LAST_NAME',
      type: 'text',
      lookup_key: false,
      required: false,
      value: false,
      editable: [],
      default: true,
    },
    {
      name: 'FULL_NAME',
      type: 'text',
      lookup_key: false,
      required: false,
      value: false,
      editable: [],
      default: true,
    },
    {
      name: 'GENDER',
      type: 'text',
      lookup_key: false,
      required: false,
      value: false,
      editable: [],
      default: true,
    },
    {
      name: 'BIRTHDAY',
      type: 'timestamp',
      lookup_key: false,
      required: false,
      value: false,
      editable: [],
      default: true,
    },
    {
      name: 'AGE',
      type: 'integer',
      lookup_key: false,
      required: false,
      value: false,
      editable: [],
      default: true,
    },
    {
      name: 'GENERATION',
      type: 'text',
      lookup_key: false,
      required: false,
      value: false,
      editable: [],
      default: true,
    },
    {
      name: 'ZODIAC_SIGN',
      type: 'text',
      lookup_key: false,
      required: false,
      value: false,
      editable: [],
      default: true,
    },
    {
      name: 'MARITAL_STATUS',
      type: 'text',
      lookup_key: false,
      required: false,
      value: false,
      editable: [],
      default: true,
    },
  ];

  private hideFields = [
    'UID',
    'HUID',
    'CID',
    'CREATED_AT',
    'UPDATED_AT',
    'LEAD_SOURCE_DETAILS',
    'LEAD_SOURCE',
    'EMAIL_TYPE',
    'EMAIL_STATUS',
    'SMS_STATUS',
    'PUSH_STATUS',
    'OMNI_STATUS',
    'SENTIMENT',
    'BEHAVIOR',
    'SCORE',
    'RANK',
    'EMAIL_VALIDATION',
    'VALIDATION_RESULT',
    'REASON',
    'RISK',
    'SUPPRESSED',
    'IDENTIFIED',
  ];

  private clientFields: Field[] = [];
  private clientFieldsBkp: Field[] = [];
  private databaseFields: Field[] = [];
  private equivalentFields: Record<string, any> = {};
  private mapFieldsError: string | null = null;

  private validateData: ValidateData = {
    total: 0,
    headers: [],
    invalids: [],
    valids: [],
    items: [],
    exportedFilename: '',
    url: '',
  };

  private validatePercentage: number | null = null;

  private uploadPercentage = 0;
  private uploadMessage = '';
  private resumeMessage = '';

  private importing: Import = {
    name: null,
    params: {
      asset_id: null,
      date_type: null,
      operation: 'append',
      columns: [],
    },
  };

  private form: Form = {
    params: {
      name: null,
      type: 5,
      contact_list_id: null,
      date_type: null,
      columns: [],
    },
  };

  private rules: Rules = {
    required: value => !!value || this.$t('formRules.required.error'),
  };

  get fileSize(): string {
    return this.file === null ? '0kb' : calcFileSize(this.file?.size || 0);
  }

  get fileHeaders(): any[] {
    if (this.filePreview && this.filePreview[0]) {
      return this.filePreview[0].map(h => h.replace(/"/g, '').toUpperCase());
    }

    return [];
  }

  get fileItems(): any[] {
    if (this.firstRowIsHeaders) return this.filePreview.slice(1, 6);
    if (!this.filePreview) return [];
    return this.filePreview.slice(0, 6);
  }

  get availableFields(): (field: Field) => Field[] {
    return field => {
      const data = this.columns.filter(item => {
        if (item.name === 'PERSONAL FIELD') return true;
        return (
          this.databaseFields.findIndex(d => d && d.name === item.name) < 0
        );
      });

      if (field !== undefined) return [field, ...data];
      return data;
    };
  }

  get showDateTimeFormatted(): typeof getDateTimeFormatted {
    return getDateTimeFormatted;
  }

  @Getter('content-manager/assets/data')
  private assets!: AssetState;

  @Getter('content-manager/assets/create')
  private uploadAsset!: (
    data: FormData,
    options?: AxiosRequestConfig,
  ) => Promise<IAsset>;

  @Action('databases/create')
  private create!: (data: Form) => Promise<IDatabase>;

  @Watch('step')
  onStepChange(step: 1 | 2 | 3 | 4 | 5 | 6 | 7): void {
    if (step === 2) {
      this.importing.params.date_type = null;
      if (this.uploadTab === 0) this.uploadTab = 1;
    }
    if (this.step === 4) this.compareFields();
    if (this.step === 7) this.validate();
  }

  @Watch('uploadFile')
  onUploadFileChange(val: boolean): void {
    this.steps = 7;
    if (!val) this.removeFile();
  }

  mounted(): void {
    this.columns = [...this.columns, ...this.defaultFields];
  }

  addFormField(field: Field): void {
    this.form.params.columns.push(field);
    this.validateData.headers.push(field);
  }

  backStep(): void {
    if (this.step === 1) {
      this.close();
      return;
    }

    if (this.step === 6 && !this.uploadFile) {
      this.step = 2;
      return;
    }
    this.step -= 1;
  }

  clear(): void {
    this.loadingPreview = false;
    this.loadingAssets = false;
    this.editID = null;
    this.step = 1;
    this.valid = {
      1: false,
      2: true,
      3: false,
      4: false,
      5: false,
      6: false,
      7: false,
    };

    this.uploadFile = true;
    this.clientFields = [];
    this.clientFieldsBkp = [];
    this.databaseFields = [];
    this.equivalentFields = {};
    this.mapFieldsError = null;
    this.validateData = {
      total: 0,
      headers: [],
      invalids: [],
      valids: [],
      items: [],
      exportedFilename: '',
      url: '',
    };

    this.uploadPercentage = 0;

    this.importing = {
      name: null,
      params: {
        asset_id: null,
        date_type: null,
        operation: 'append',
        columns: [],
      },
    };

    this.form = {
      params: {
        name: null,
        type: 5,
        contact_list_id: null,
        date_type: null,
        columns: [],
      },
    };

    this.removeFile();
  }

  close(): void {
    this.formStepOne.resetValidation();
    this.dialog = false;
    this.clear();
  }

  compareFields(): void {
    this.mapping = true;
    this.clientFields.forEach((clientField, index) => {
      const field = this.hideFields.find(hideField => {
        return clientField.name.replace(' ', '_') === hideField;
      });

      if (field) clientField.name += '_';

      this.columns.forEach(databaseField => {
        this.databaseFields[index] = this.databaseFields[index] || {
          name: this.$t('databases.create.mapFields.personalField'),
        };
        if (
          clientField.name.replace(' ', '_').toLowerCase() ===
          databaseField.name.replace(' ', '_')
        ) {
          this.databaseFields[index] = databaseField;
        }
      });
    });

    this.validateMapFields();
    this.mapping = false;
  }

  contentManagerFile(item: IAsset): void {
    if (this.importing.params.asset_id === item.ID) return;

    const asset_id = item.ID;

    this.fromCM = true;
    this.loadingPreview = true;
    this.valid[3] = false;

    this.$log.debug(`Getting asset ${asset_id} preview`);

    retry({ axios: contentmanager, url: `/assets/${asset_id}/preview` })
      .then(() => {
        this.importing.params.asset_id = item.ID;
        // this.file = new File(response.data.preview, item.name, {
        //   type: item.format_type,
        //   lastModified: item.updated_at,
        // });
        // const result = response.data.preview;
        // this.clientFieldsBkp = result[0].map((header, index) => {
        //   const name = header.replace(/"/g, '').trim().toUpperCase();

        //   return {
        //     id: index + 1,
        //     key: false,
        //     name,
        //     required: false,
        //     type: 'missing',
        //     lookup_key: false,
        //     editable: ['name', 'type', 'required', 'key'],
        //   };
        // });

        // const exclude = [];

        // this.filePreview = result.map(rows => {
        //   return rows
        //     .map(value => value.replace(/"/g, ''))
        //     .filter((_, index) => {
        //       if (!result[0][index]) return false;

        //       if (
        //         this.hideFields.includes(this.clientFieldsBkp[index].name)
        //       ) {
        //         exclude.push(index);
        //         return false;
        //       }

        //       return true;
        //     });
        // });

        // this.clientFieldsBkp = this.clientFieldsBkp.filter((_, id) => {
        //   return !exclude.includes(id);
        // });
        this.loadingPreview = false;
        this.valid[3] = true;
      })
      .catch(() => {
        this.valid[3] = false;
        this.loadingPreview = false;
      });
  }

  dialogMessage(): string {
    if (this.step === 5 && this.mapFieldsError) return this.mapFieldsError;
    if (this.step === 7) {
      if (this.validating) {
        return `${this.$t('files.validating')} ${
          this.validatePercentage ? `: ${this.validatePercentage}%` : ''
        }`;
      }
      if (!this.fromCM && this.uploadPercentage > 0) {
        return this.$t('files.uploadProgress', {
          progress: this.uploadPercentage,
        }) as string;
      }
    }
    return '';
  }

  async handleUpload(): Promise<void> {
    if (!this.file) return;
    let formData = new FormData();

    formData.append('file', this.file);
    formData.append('name', this.file.name);

    this.$log.debug(`Uploading asset to content manager`);

    await this.uploadAsset(formData, {
      onUploadProgress: e => {
        this.uploadPercentage = Math.round((e.loaded * 100) / e.total);
      },
    })
      .then(response => {
        this.importing.params.asset_id = response.ID;
        this.uploadPercentage = 0;
      })
      .catch(() => {
        this.uploadPercentage = 0;
      });
  }

  isActive(item: IAsset): string {
    if (this.importing.params.asset_id === item.ID) return 'active';
    return '';
  }

  nextStep(): void {
    if (this.step === 2 && !this.uploadFile) {
      this.step = 6;
      this.steps = 6;
      return;
    }

    if (this.step === 6 && this.uploadFile) this.setFormFields();

    if (this.step === this.steps) {
      this.$emit('refresh');
      this.save();
      return;
    }

    this.step += 1;
  }

  async newFile(files: FileList): Promise<void> {
    if (
      verifyFileRequeriments(
        files[0],
        ['text/csv', 'application/vnd.ms-excel'],
        50000000,
      )
    ) {
      this.fromCM = false;
      this.file = files[0];

      if (this.file) {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const self = this;
        Papa.parse<string[]>(this.file, {
          worker: true,
          complete: results => {
            self.filePreview = results.data;
            self.clientFieldsBkp = results.data[0].map((header, index) => {
              const name = header.replace(/"/g, '').trim().toUpperCase();

              return {
                id: index + 1,
                key: false,
                name,
                required: false,
                type: 'missing',
                lookup_key: false,
                default: false,
                editable: ['name', 'type', 'required', 'key'],
              };
            });
            self.clientFields = self.clientFieldsBkp;
            self.valid[3] = true;
          },
        });
      }
      this.uploadMessage = this.$t('files.readingFile') as string;
    }
  }

  prepareDownload(csv: string): void {
    var fileTitle = this.file?.name.replace('.csv', '');

    this.validateData.exportedFilename =
      fileTitle + ' - Invalid.csv' || 'export.csv';

    var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    if (navigator.msSaveBlob) {
      navigator.msSaveBlob(blob, this.validateData.exportedFilename);
    } else {
      this.validateData.url = URL.createObjectURL(blob);
    }
  }

  removeField(index: number): void {
    this.databaseFields = this.databaseFields.filter((_, i) => i !== index);
  }

  removeFile(): void {
    this.valid[3] = false;
    this.file = null;
    this.uploadMessage = '';
    this.filePreview = [];
    this.clientFields = [];
    this.databaseFields = [];
    this.validateData.items = [];
  }

  async save(): Promise<void> {
    this.saving = true;

    this.$log.debug(`Creating database`);

    const data = this.form;

    if (!this.fromCM && this.file) {
      await this.handleUpload();
      if (!this.importing.name) this.importing.name = this.form.params.name;

      data.import = { ...this.importing };
    }

    if (this.uploadFile) data.import = { ...this.importing };

    this.create(data)
      .then(() => {
        toast.success(this.$t('toast.databases.created'));
        this.$emit('refresh');
        this.close();
        this.saving = false;
      })
      .catch(() => {
        this.saving = false;
      });
  }

  setAsset(item: IAsset): void {
    this.importing.params.asset_id === item.ID;
    this.valid[3] = !!this.importing.params.asset_id;
  }

  setBkpClientFields(items: Field[]): void {
    this.clientFieldsBkp = items;
  }

  setClientFields(index: number): void {
    this.clientFields = this.clientFields.filter((_, i) => i !== index);
    this.filePreview = this.filePreview.map(row =>
      row.filter((item, i) => i !== index),
    );
  }

  setDatabaseField(index: number, value: Field): void {
    this.databaseFields[index] = value;
    this.validateMapFields();
  }

  setDatabaseFields(items: Field[]): void {
    this.databaseFields = items;
    this.validateMapFields();
  }

  setFormFields(): void {
    var personalField = this.$t('databases.create.mapFields.personalField');

    this.equivalentFields = {};
    this.importing.params.columns = [];

    var merged = this.clientFields.map((item, index) => {
      if (
        this.databaseFields[index] &&
        this.databaseFields[index].name === personalField
      ) {
        return item;
      }
      this.equivalentFields[item.name] = this.databaseFields[index].name;
      this.importing.params.columns.push({
        from: item.name,
        to: this.databaseFields[index].name,
      });
      return this.databaseFields[index];
    });

    var contain = false;
    var defaults: Field[] = [];
    var mergedIndexes: number[] = [];

    this.defaultFields.forEach((def, index) => {
      merged.forEach((mer, i) => {
        if (mer.name === def.name) {
          contain = true;
          defaults[index] = def;
          mergedIndexes.push(i);
          return;
        }
      });
      if (!contain) defaults.push(def);

      contain = false;
    });

    merged = merged.filter((item, index) => !mergedIndexes.includes(index));

    this.form.params.columns = [...defaults, ...merged];
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    var emailField = defaults.shift()!;
    defaults = [
      emailField,
      {
        name: 'CREATED AT',
        type: 'timestamp',
        lookup_key: false,
        required: false,
        default: true,
        value: false,
      },
      {
        name: 'UPDATED AT',
        type: 'timestamp',
        lookup_key: false,
        required: false,
        default: true,
        value: false,
      },
      ...defaults,
    ];
    this.validateData.headers = [...defaults, ...merged];
    this.validateResume(
      this.form.params.columns.every(item => item.type !== 'missing'),
    );
  }

  showTitle(): TranslateResult {
    switch (this.step) {
      case 1:
      case 2:
        return this.$t('databases.create.title');

      case 3:
        return this.$t('databases.create.upload.title');

      case 4:
        return this.$t('databases.create.dataPreview.title');

      case 5:
        return this.$t('databases.create.mapFields.title');

      case 6:
        return this.$t('databases.create.setFields.title');

      case 7:
        return this.$t('databases.create.validate.title');

      default:
        return this.$t('databases.create.title');
    }
  }

  async validate(): Promise<void> {
    this.validating = true;

    const worker = new Worker<ValidateParams, ValidateResponse>(easyWorker => {
      const isInvalidEmail = (email: string): boolean => {
        if (email.indexOf('@') < 0) return true;
        const usuario = email.substring(0, email.indexOf('@'));
        const dominio = email.substring(email.indexOf('@') + 1, email.length);

        return !(
          usuario.length >= 1 &&
          usuario.search('@') === -1 &&
          usuario.search(' ') === -1 &&
          usuario.search(',') === -1 &&
          dominio.length >= 3 &&
          dominio.search('@') === -1 &&
          dominio.search(' ') === -1 &&
          dominio.search(',') === -1 &&
          dominio.search('..') !== -1 &&
          dominio.search('.') !== -1 &&
          dominio.indexOf('.') >= 1 &&
          dominio.lastIndexOf('.') < dominio.length - 1
        );
      };

      const setItems = (
        row: Record<string, any>,
        emails: string[],
        errors: Record<string, string>,
      ): SetItemsResponse => {
        let isInvalid = false;
        if (row && !row['EMAIL']) {
          row['_REASON_'] = errors.missing;
          isInvalid = true;
        } else if (row && row['EMAIL'] && isInvalidEmail(row['EMAIL'])) {
          row['_REASON_'] = errors.invalid;
          isInvalid = true;
        } else if (row && row['EMAIL'] && emails.indexOf(row['EMAIL']) >= 0) {
          row['_REASON_'] = errors.duplicated;
          isInvalid = true;
        }

        return {
          isInvalid,
          row,
          email: (row['EMAIL'] as string) || '',
        };
      };

      easyWorker.onMessage(message => {
        const { payload } = message;
        const { headers, fileContent, equivalentFields, errors } = payload;
        const { length: total } = fileContent;
        const progressPerItem = total ? 100 / total : 0;

        const invalids: Record<string, any>[] = [];
        const valids: Record<string, any>[] = [];
        const emails: string[] = [];

        const firstRow = headers.map(item => item.name);
        firstRow.push('_REASON_');
        const csv = [firstRow];

        let currentProgress = 0;
        fileContent.forEach((rows, index) => {
          if (index > 0) {
            const row: Record<string, any> = {};
            headers.forEach((header, id) => {
              const value = rows[id];
              if (Object.hasOwnProperty.call(equivalentFields, header.name)) {
                row[equivalentFields[header.name].replace(' ', '_')] = value;
                return;
              }
              row[header.name.replace(' ', '_')] = value || '';
            });

            const res = setItems(row, emails, errors);
            if (res.isInvalid) {
              invalids.push(res.row);
              const csvRow: string[] = Object.keys(res.row).map(k => {
                return res.row[k] || '';
              });
              csv.push(csvRow);
            } else {
              emails.push(res.email);
              valids.push(res.row);
            }

            currentProgress += progressPerItem;
            message.reportProgress(currentProgress);
          }
        });

        message.resolve({
          invalids,
          valids,
          csv,
        });
      });
    });

    const params = {
      headers: this.clientFields,
      fileContent: this.filePreview,
      equivalentFields: this.equivalentFields,
      errors: {
        missing: this.$t('files.invalid.missingEmail') as string,
        invalid: this.$t('files.invalid.email') as string,
        duplicated: this.$t('files.invalid.duplicated') as string,
      },
    };

    const validated = await worker.send(params).onProgress(perc => {
      this.validatePercentage = Math.ceil(perc);
    });

    this.validateData.headers = this.clientFields.map(header => ({
      ...header,
      text: header.name,
      value: header.name,
    }));
    this.validateData.invalids = validated.invalids;
    this.validateData.valids = validated.valids;

    this.prepareDownload(Papa.unparse(validated.csv));
    this.valid[5] = true;
    this.validating = false;
  }

  validateDataPreview(): void {
    console.log(!!this.form.params.date_type);
    console.log(this.firstRowIsHeaders);
    this.valid[4] = !!this.form.params.date_type && this.firstRowIsHeaders;
  }

  validateMapFields(): void {
    if (this.databaseFields.length !== this.clientFields.length) {
      this.mapFieldsError = this.$t(
        'databases.create.mapFields.missingEquivalent',
      ) as string;
      this.valid[5] = false;
      return;
    }
    this.mapFieldsError = null;
    if (this.databaseFields.some(item => item.name === 'email')) {
      this.valid[5] = true;
      return;
    }
    this.mapFieldsError = this.$t(
      'databases.create.mapFields.missingEmail',
    ) as string;
    this.valid[5] = false;
  }

  validateResume(value: boolean): void {
    this.valid[6] = value;
  }
}
</script>

<style lang="scss">
.select-available-fields {
  .v-list {
    .v-list-item {
      min-height: 42px;

      .v-list-item__title {
        font-size: 1.2em;
      }
    }
  }
}

.create-database {
  position: relative;
  min-width: 448px;
  background: #ffffff;

  .v-stepper__content {
    padding: 0 !important;
    max-width: 837px;
  }
  .v-text-field--solo,
  .v-text-field--outlined {
    border-radius: 0px;
  }

  .v-input {
    .v-radio.v-item--active {
      .v-label {
        color: #000000;
      }
    }

    .v-input__control {
      .v-input__slot {
        min-height: 30px !important;
      }
      .v-text-field__details {
        padding: 0;
      }
    }
  }

  .dialog-content {
    .v-input--radio-group {
      margin-top: 0;
    }

    [class^='label-'] {
      margin-bottom: 6px;
      font-size: 1.2em;
      font-weight: 400;
      color: #000000;
    }

    .upload-database {
      min-width: 542px;

      .upload-box-tabs {
        position: relative;
        display: flex;
        flex-direction: row;
        align-items: baseline;
        height: 100%;

        .tabs-label {
          font-size: 1.2em;
          font-weight: 500;
        }
      }

      .upload-content {
        &.tab-two {
          display: flex;
          flex-direction: row;
          justify-content: space-between;

          .table {
            position: relative;
            height: 280px;
            width: 100%;
            border: 1px solid rgba(#000000, 0.3);
            max-height: 400px;
            overflow: auto;

            &.full-width {
              margin-bottom: 56px;
              height: 282px;
            }

            &.loading {
              pointer-events: none;
              opacity: 0.5;
            }

            .loading-preview {
              position: absolute;
              display: flex;
              align-items: center;
              top: calc(50% - 40px);
              left: calc(50% - 40px);
              z-index: 1000;
            }

            .v-data-table {
              thead {
                th {
                  height: 32px;
                  font-size: 1em;
                  color: #000000;
                }
              }
              tbody {
                tr {
                  cursor: pointer;

                  &.active {
                    background: #f0f0f0;

                    &:hover {
                      background: #f0f0f0 !important;

                      .remove-file {
                        display: flex;
                      }

                      .is-selected {
                        display: none;
                      }
                    }
                  }

                  .remove-file {
                    display: none;
                    align-items: center;
                    justify-content: center;

                    i {
                      font-size: 16px;
                    }
                  }

                  td {
                    height: 40px;
                    font-size: 1.2em;
                    font-weight: 500;
                    color: rgba(#000000, 0.6);

                    &:nth-child(2) {
                      padding: 0;
                      max-width: 20px;
                    }

                    &:nth-child(3) {
                      max-width: 200px;
                      text-overflow: ellipsis;
                      overflow: hidden;
                      white-space: nowrap;
                    }

                    .is-selected {
                      display: flex;
                      align-items: center;
                      justify-content: center;

                      .hi-file-blank {
                        font-size: 16px;
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    .data-preview {
      min-width: 542px;

      .data-preview-actions {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;

        .action-checkbox {
          display: flex;
          flex-direction: row;
          align-items: center;

          .v-input--checkbox {
            padding-top: 2px;
            margin: 0 8px 0px 0 !important;

            .v-input__slot {
              min-height: 26px !important;
            }

            .v-label {
              color: rgba(#000000, 0.6);
            }
          }

          .hi-help-circle {
            font-size: 1.6em;
            margin-bottom: 4px;
          }
        }

        .date-format {
          display: flex;
          align-items: center;
          font-size: 1.2em;
          color: rgba(#000000, 0.6);

          .v-select {
            margin-left: 16px;
            max-height: 40px;
            max-width: 160px;
            font-size: inherit !important;

            .v-input__control {
              min-height: 30px !important;
            }

            .v-select__slot {
              color: rgba(#000000, 0.3) !important;
            }

            i {
              font-size: 2em;
            }
          }
        }
      }

      .data-preview-content {
        .v-data-table {
          .v-data-table__wrapper {
            border: 1px solid rgba(#000000, 0.1);
          }

          thead {
            th {
              height: 32px;
              font-size: 1em;
              color: #000000 !important;
              overflow: hidden;
              white-space: nowrap;
            }
          }
          tbody {
            td {
              height: 40px;
              font-size: 1.2em;
              font-weight: 500;
              color: rgba(#000000, 0.6);
              overflow: hidden;
              white-space: nowrap;
              cursor: default;
            }
          }
        }
      }
    }

    .map-fields {
      display: flex;
      flex-direction: column;
      justify-content: center;
      width: 837px;

      .box-headers {
        display: flex;
        align-items: center;
        margin-bottom: 16px;

        & > div {
          .label {
            margin-bottom: 8px;
            font-weight: 300;
            color: rgba(#000000, 0.6);
          }
          .name {
            max-width: 370px;
            font-size: 1.2em;
            font-weight: 500;
            color: #000000;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
          }
        }

        .file {
          min-width: 420px;
        }
      }

      .box-fields {
        position: relative;
        display: flex;
        justify-content: space-between;
        height: 257px;
        max-height: 257px;
        overflow-y: auto;
        border: 1px solid rgba(#000000, 0.1);

        &.mapping {
          pointer-events: none;
          opacity: 0.5;
        }

        .mapping {
          position: absolute;
          display: flex;
          align-items: center;
          top: calc(50% - 40px);
          left: calc(50% - 40px);
          z-index: 1000;
        }

        .client-fields {
          width: 100%;

          .list {
            padding: 12px 0 12px 12px;

            .item-list {
              display: flex;
              align-items: center;
              width: 100%;

              .item {
                display: flex;
                align-items: center;
                padding: 10px 16px;
                margin-bottom: 8px;
                width: 100%;
                height: 32px;
                font-size: 1.2em;
                border: 1px solid rgba(#000000, 0.1);
                background: #f5f5f5;
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;

                .v-input__control {
                  min-height: 28px;
                }

                .nameChanged {
                  font-weight: 700;
                }
              }

              i {
                color: rgba(#000000, 0.3);
                padding: 4px 10px;
                margin-bottom: 8px;
              }

              &.active {
                i {
                  color: rgba(#000000, 0.6);
                }
              }
            }
          }
        }

        .system-fields {
          width: 100%;

          .list {
            padding: 12px 12px 12px 0;

            .item {
              display: flex;
              align-items: center;
              margin-bottom: 8px;

              .v-input__control {
                min-height: 32px;
              }

              .hi-close {
                margin-left: 12px;
                font-size: 2.4em;
              }
            }
          }
        }
      }
    }

    .validate {
      min-width: 837px;

      .validate-infos {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        height: 42px;

        & > div {
          display: flex;
          flex-direction: row;
          align-items: center;

          .database {
            margin-right: 48px;
          }

          .database,
          .file {
            .label {
              margin-bottom: 8px;
              font-weight: 300;
              color: rgba(#000000, 0.6);
            }
            .name {
              font-size: 1.2em;
              font-weight: 500;
              color: #000000;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;

              [class^='hi-'] {
                margin-right: 6px;
                font-size: 1.6em;
                color: #000000;
              }
            }
          }

          .database {
            .name {
              max-width: 150px;
            }
          }

          .file {
            .name {
              max-width: 320px;
            }
          }
        }

        .rows {
          font-size: 1.2em;
          height: 100%;
          align-items: flex-end;
        }
      }

      .table {
        position: relative;
        margin-top: 15px;
        border: 1px solid rgba(#000000, 0.1);

        &.validating {
          pointer-events: none;
          opacity: 0.5;
        }

        .validating {
          position: absolute;
          display: flex;
          align-items: center;
          top: calc(50% - 40px);
          left: calc(50% - 40px);
          z-index: 1000;
        }

        .v-data-table {
          height: 261px;

          thead {
            th {
              height: 32px;
              font-size: 1em !important;
              color: #000000 !important;
              overflow: hidden;
              white-space: nowrap;
            }
          }
          tbody {
            td {
              height: 40px;
              font-size: 1.2em !important;
              font-weight: 500 !important;
              color: rgba(#000000, 0.6) !important;
              overflow: hidden;
              white-space: nowrap;
            }
          }
        }
      }
    }
  }

  .actions-message {
    display: flex;
    flex-direction: row;
    align-items: center;
    height: 32px;

    &.disabled {
      pointer-events: none;
    }

    a {
      margin-right: 8px;
      padding: 12px;
      background: #f5f5f5;

      span {
        font-weight: 400;
      }

      .hi-download {
        margin-right: 12px;
        font-size: 1.328em;
      }

      .download {
        color: #fa4600;
      }
    }

    span.message {
      font-size: 1.2em;
    }
  }

  .dialog-actions {
    padding: 0 24px 24px !important;

    .v-btn {
      width: 90px;
    }
  }
}
</style>
