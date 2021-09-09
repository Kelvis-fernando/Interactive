<template>
  <div class="set-database-fields">
    <div v-if="boxAddField" class="resume-actions">
      <div class="label">
        {{ $t('databases.create.setFields.label') }}
      </div>

      <v-form ref="formAdd" v-model="addValid" @submit.prevent="addField">
        <div class="add-field">
          <v-text-field
            v-if="canAddField"
            v-model="field.name"
            :label="$t('databases.create.setFields.name')"
            outlined
            solo
            flat
            dense
            :rules="[rule.required, rule.nameNotAvailable(field.name)]"
          />

          <v-text-field
            v-else
            v-model="field.name"
            :label="$t('databases.create.setFields.name')"
            outlined
            solo
            flat
            dense
          />

          <v-autocomplete
            v-if="canAddField"
            v-model="field.data_type"
            :label="$t('databases.create.setFields.data_type')"
            :items="types"
            :no-data-text="$t('default.noDataText')"
            outlined
            solo
            flat
            dense
            :rules="[rule.required]"
            autocomplete="off"
          />

          <v-autocomplete
            v-else
            v-model="field.data_type"
            :label="$t('databases.create.setFields.data_type')"
            :items="types"
            :no-data-text="$t('default.noDataText')"
            hide-selected
            outlined
            solo
            flat
            dense
            autocomplete="off"
          />

          <v-checkbox
            v-model="field.is_nullable"
            color="#fa4600"
            :label="$t('databases.create.setFields.not_nullable')"
            :ripple="false"
            :disabled="field.key"
          />

          <v-checkbox
            v-model="field.key"
            color="#fa4600"
            :label="$t('databases.create.setFields.key')"
            :ripple="false"
            @change="setFieldAsKey"
          />

          <v-btn
            type="submit"
            color="#fa4600"
            outlined
            tile
            depressed
            :disabled="!canAddField"
          >
            {{ $t(`databases.create.setFields.btnAdd`) }}
          </v-btn>
        </div>
      </v-form>
    </div>

    <div class="table" @click.prevent="boxAddField && resetValidation">
      <v-simple-table class="resume-table" fixed-header height="253px">
        <template #default>
          <thead>
            <tr>
              <th v-for="header in headers" :key="header.value">
                {{ header.name }}
              </th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="(column, i) in form.columns"
              :key="i"
              :class="{ disabled: isEditing && editingIndex !== i }"
              @dblclick.prevent
              @dblclick.stop="handleClickRow(column, i)"
            >
              <td class="key">
                <div
                  v-if="editingIndex === i && column.editable.includes('key')"
                >
                  <v-checkbox
                    v-model="field.key"
                    color="#fa4600"
                    :ripple="false"
                    hide-details
                    @change="editFieldAsKey($event, column)"
                  />
                </div>
                <div v-else>
                  <v-icon v-if="column.key" size="18">hi-key</v-icon>
                </div>
              </td>

              <td class="name">
                <div
                  v-if="editingIndex === i && column.editable.includes('name')"
                >
                  <v-text-field
                    v-model="column.name"
                    outlined
                    solo
                    flat
                    hide-details
                    dense
                    single-line
                    :rules="[rule.nameNotAvailable(column.name)]"
                    @keypress.enter="
                      rule.nameNotAvailable(column.name) && saveField(column)
                    "
                  />
                </div>
                <div v-else>
                  {{ column.name }}
                </div>
              </td>

              <td
                :class="[
                  'type',
                  column.data_type ===
                    $t('databases.create.setFields.missing') && 'type-error',
                ]"
              >
                <div
                  v-if="editingIndex === i && column.editable.includes('type')"
                >
                  <v-autocomplete
                    v-model="column.data_type"
                    :items="types"
                    :no-data-text="$t('default.noDataText')"
                    outlined
                    solo
                    flat
                    dense
                    autocomplete="off"
                    hide-details
                  />
                </div>

                <div v-else>
                  {{
                    column.default
                      ? $t('default.system')
                      : showType(column.data_type)
                      ? showType(column.data_type)
                      : $t('databases.create.setFields.missing')
                  }}
                </div>
              </td>

              <td class="required">
                <div v-if="column.editable.includes('required')">
                  <v-checkbox
                    v-model="column.is_nullable"
                    color="#fa4600"
                    :ripple="false"
                    hide-details
                    :disabled="column.key"
                  />
                </div>
                <div v-else>
                  {{ !column.is_nullable ? 'Yes' : 'No' }}
                </div>
              </td>

              <td>
                <div v-if="editingIndex !== i" class="table-actions">
                  <v-icon
                    v-if="column.editable.length > 0"
                    small
                    class="mr-2"
                    @click.stop="editField(column, i)"
                  >
                    hi-edit
                  </v-icon>
                  <v-icon
                    v-if="!column.default"
                    small
                    @click.prevent
                    @click.stop="deleteField(column)"
                  >
                    hi-delete
                  </v-icon>
                </div>

                <div v-else class="table-actions">
                  <v-icon
                    small
                    class="mr-2"
                    :disabled="!rule.nameNotAvailable(column.name)"
                    @click.stop="saveField(column)"
                  >
                    done
                  </v-icon>
                </div>
              </td>
            </tr>
          </tbody>
        </template>
      </v-simple-table>
    </div>
  </div>
</template>

<script lang="ts">
import { PropType } from 'vue';
import { Component, Vue, Ref, Prop, Watch } from 'vue-property-decorator';

import { Field, Rules, RuleFn } from '@/utils/types';

type Form = {
  name: string | null;
  type_id: 1;
  category_id: 1 | 2;
  upload: Upload | null;
  columns: Field[];
};

type Upload = {
  name: string | null;
  asset_id: number | null;
  date_type: string | null;
  operation: 'append' | 'overwrite';
  columns: Record<'from' | 'to', string>[];
};

@Component
export default class SetDatabaseFields extends Vue {
  @Ref('formAdd') private formAdd!: HTMLFormElement;

  @Prop({ type: Boolean, default: false })
  private boxAddField!: boolean;

  @Prop({ type: Boolean, default: false })
  private dialogClose!: boolean;

  @Prop({ type: Array as PropType<Field[]>, default: () => [] })
  private clientFields!: Field[];

  @Prop({ type: Array as PropType<Field[]>, default: () => [] })
  private databaseFields!: Field[];

  @Prop({ type: Array as PropType<string[]>, default: () => [] })
  private hideFields!: string[];

  @Prop({ type: File, default: null })
  private file!: File;

  @Prop({ type: Object as PropType<Form> })
  private form!: Form;

  private editingIndex = -1;
  private isEditing = false;
  private isValid = false;
  private addValid = false;

  private types = [
    { text: 'Text', value: 'varchar' },
    { text: 'True/false', value: 'boolean' },
    { text: 'Number', value: 'number' },
    { text: 'Integer', value: 'integer' },
    { text: 'Float', value: 'float' },
    { text: 'Double', value: 'double' },
    { text: 'Date', value: 'date' },
    { text: 'Time', value: 'time' },
    { text: 'Timestamp', value: 'timestamp' },
  ];
  private field: Field = {
    name: '',
    lookup_key: false,
    required: false,
    default: false,
    type: 'missing',
    editable: [],
  };

  private headers = [
    {
      name: this.$t('databases.create.setFields.key'),
      value: 'key',
    },
    {
      name: this.$t('databases.create.setFields.name'),
      value: 'name',
    },
    {
      name: this.$t('databases.create.setFields.data_type'),
      value: 'data_type',
    },
    {
      name: this.$t('databases.create.setFields.not_nullable'),
      value: 'is_nullable',
    },
  ];

  private rule: Rules = {
    required: v => !!v || '',
    nameNotAvailable: v =>
      (!!v &&
        !this.form.columns.some(
          (item, i) =>
            item.name.replace(/(-)?(_)?( )?/g, '') ===
              v
                .replace(/(-)?(_)?( )?/g, '')
                .trim()
                .toUpperCase() && i !== this.editingIndex,
        ) &&
        !this.hideFields.some(
          item =>
            item.replace(/(-)?(_)?( )?/g, '') ===
            v.replace(/(-)?(_)?( )?/g, '').toUpperCase(),
        )) ||
      '',
  };

  private rules: { [x: string]: RuleFn[] } = {
    names: [v => !!v],
    columns: [
      v => !!v,
      v => v !== this.$t('databases.create.setFields.missing'),
    ],
  };

  get canAddField(): boolean {
    return !!this.field.name && !!this.field.type;
  }

  @Watch('dialogClose')
  onDialogCloseChange(close: boolean): void {
    if (close) this.close();
  }

  @Watch('field')
  onFieldChange(): void {
    this.validateFields();
  }

  @Watch('isValid')
  onIsValidChange(valid: boolean): void {
    this.$emit('validate-resume', valid);
  }

  addField(): void {
    if (this.addValid) {
      this.resetValidation();
      this.$emit('add-field', {
        ...this.field,
        editable: ['name', 'type', 'required', 'key'],
        name: this.field.name.toUpperCase(),
      });
      this.field = {
        name: '',
        lookup_key: false,
        required: false,
        default: false,
        type: 'missing',
        editable: [],
      };
    }
  }

  close(): void {
    this.resetValidation();
    this.$emit('close');
  }

  deleteField(item: Field): void {
    this.editingIndex = -1;
    this.isEditing = false;
    this.$emit(
      'set-columns',
      this.form.columns.filter(column => column.name !== item.name),
    );
    this.$emit('remove-field', item);
    this.validateFields();
  }

  editField(field: Field, index: number): void {
    this.editingIndex = index;
    this.isEditing = true;
  }

  editFieldAsKey(isRequired: boolean, field: Field): void {
    field.required = isRequired;
  }

  handleClickRow(field: Field & { editable: string[] }, index: number): void {
    if (!this.form.columns[index]) return;
    if (field.editable.length === 0) return;
    if (index === this.editingIndex && this.rule.nameNotAvailable(field.name)) {
      this.saveField(field);
      return;
    }
    this.editField(field, index);
  }

  resetValidation(): void {
    if (this.formAdd) this.formAdd.resetValidation();
  }

  saveField(field: Field): void {
    this.isEditing = false;
    this.editingIndex = -1;
    field.name = field.name.toUpperCase();
    this.validateFields();
  }

  setFieldAsKey(isRequired: boolean): void {
    this.field.required = isRequired;
  }

  showType(type: string): string | null {
    let name: string | null = null;
    this.types.forEach(item => {
      if (item.value === type) name = item.text;
    });
    return name;
  }

  validateFields(): void {
    this.isValid = this.validateNames() && this.validateTypes();
  }

  validateNames(): boolean {
    var countErrors = 0;
    this.rules.names.forEach(rule => {
      this.form.columns.forEach(field => {
        var isValid = rule(field.name);
        if (!isValid) countErrors++;
      });
    });

    return countErrors === 0;
  }

  validateTypes(): boolean {
    var countErrors = 0;
    this.rules.columns.forEach(rule => {
      this.form.columns.forEach(field => {
        var isValid = rule(field.type);
        if (!isValid) countErrors++;
      });
    });

    return countErrors === 0;
  }
}
</script>

<style lang="scss">
.set-database-fields {
  min-width: 836px;

  .v-text-field {
    .v-label {
      color: rgba(#000000, 0.3) !important;
    }

    &.v-input--dense > .v-input__control {
      min-height: 28px;
    }
  }

  .v-autocomplete {
    .v-label {
      color: rgba(#000000, 0.3) !important;
    }
  }

  .resume-actions {
    .label {
      font-size: 1.2em;
      color: #000000;
    }
    .add-field {
      display: flex;
      flex-direction: row;
      align-items: center;

      .v-input {
        margin-right: 12px;
        min-height: 32px !important;
        max-height: 32px !important;

        &.v-text-field {
          font-size: 1.2em;
        }

        &.v-input--checkbox {
          margin-top: -4px !important;

          .v-label {
            color: rgba(#000000, 0.6);
          }
        }
      }

      button {
        height: 32px;
        margin-left: 64px;
      }
    }
  }

  .table {
    margin-top: 15px;
    border: 1px solid rgba(#000000, 0.1);

    .v-data-table {
      thead {
        th {
          white-space: nowrap;
          height: 32px;
          font-size: 1em;
          color: #000000;
        }
      }
      tbody {
        tr {
          td {
            height: 40px;
            font-size: 1.2em;
            color: rgba(#000000, 0.6);
            cursor: default;

            &.key {
              width: 60px;
              max-width: 60px;
            }

            &.name {
              padding: 0 16px;
              width: 360px;
              max-width: 360px;
            }

            &.type {
              width: 200px;
              max-width: 200px;
            }

            > div {
              overflow: hidden;
              white-space: nowrap;
              text-overflow: ellipsis;

              .v-text-field {
                max-width: 300px;
                font-size: 1em !important;

                input {
                  overflow: hidden;
                  white-space: nowrap;
                  text-overflow: ellipsis;
                }
              }

              .v-autocomplete {
                max-width: 100px;

                &.v-select.v-input--is-focused {
                  input {
                    min-width: 42px !important;
                  }
                }
              }

              .v-input--selection-controls {
                margin-top: 0;
                padding-top: 0;

                .v-input--selection-controls__input {
                  margin-right: 0;

                  i {
                    font-size: 1.6em;
                  }
                }
              }
            }

            &.type-error {
              color: #ff0000;
            }
          }

          .table-actions {
            min-width: 40px;
            text-align: right;
            opacity: 0;
          }

          &:hover {
            td {
              color: #000000;

              i {
                color: #000000;
              }
            }

            .table-actions {
              opacity: 1;

              button:hover {
                color: rgba(#000000, 0.9);
              }
            }
          }

          &.disabled {
            background-color: #fcfcfc !important;
            pointer-events: none;
            opacity: 0.4;

            .table-actions {
              opacity: 0;
            }
          }
        }
      }
    }
  }
}
</style>
