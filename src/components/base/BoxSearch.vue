<template>
  <div class="header-box-search">
    <v-form>
      <div
        class="search"
        :style="`display: ${search.type !== undefined ? 'flex' : 'none'}`"
      >
        <div v-if="search.type === 'database'" class="search-on-database">
          <v-autocomplete
            ref="searchAutocomplete"
            class="input-text"
            :label="search.label || $t('search.selectType')"
            :items="fields"
            :loading="loadingFields"
            :no-data-text="$t('default.noDataText')"
            outlined
            solo
            flat
            dense
            autocomplete="off"
            hide-details
            return-object
            @change="setColumn"
          />
          <v-select
            v-model="searchBox.operator"
            :items="operators()"
            solo
            dense
            hide-details
            :menu-props="{ offsetOverflow: false }"
          />
          <h-date-picker
            v-if="
              columnType &&
              (columnType === 'DATE' || columnType === 'TIMESTAMP')
            "
            v-model="searchBox.value"
            :input-props="{
              class: {
                'input-text': true,
                disabled:
                  searchBox.operator === 'isNull' ||
                  searchBox.operator === 'isNotNull',
              },
            }"
            @change="$emit('validate-configuration')"
          />
          <v-text-field
            v-else
            v-model="searchBox.value"
            class="input-text"
            type="text"
            color="rgba(0,0,0,0.9)"
            outlined
            solo
            flat
            dense
            hide-details
            autocomplete="off"
            :disabled="
              searchBox.operator === 'isNull' ||
              searchBox.operator === 'isNotNull'
            "
            @keypress.enter="handleSearch"
          />
          <div class="search" @click="handleSearch">
            <v-icon>hi-search</v-icon>
          </div>
        </div>
        <div v-else class="search-on-table">
          <v-icon>hi-search</v-icon>
          <v-text-field
            v-model="value"
            class="input-text"
            type="text"
            :placeholder="search.placeholder || $t('search.default')"
            color="rgba(0,0,0,0.9)"
            outlined
            solo
            flat
            dense
            hide-details
            autocomplete="off"
            @keyup="$emit('search', $event.target.value)"
          />
        </div>
      </div>
    </v-form>

    <div class="actions">
      <slot name="box-extra" />
      <v-btn
        v-if="added"
        color="#00000099"
        text
        tile
        depressed
        @click="$emit('add-item')"
      >
        <v-icon>{{ addIcon }}</v-icon>
        {{ addText }}
      </v-btn>
      <div
        v-if="$scopedSlots['box-extra'] || added"
        class="vertical-divider"
      ></div>

      <slot name="box-actions" />
      <div v-if="editable" class="action edit">
        <v-icon
          color="#fa4600"
          :disabled="badgeSelected !== 1"
          @click="$emit('edit')"
        >
          hi-edit
        </v-icon>
      </div>
      <div v-if="refresh" class="action refresh">
        <v-progress-circular
          v-if="loading"
          indeterminate
          color="#000000"
          size="18"
          width="1"
        />
        <div v-else class="refresh-icon" @click="$emit('refresh')">
          <v-icon>hi-refresh</v-icon>
        </div>
      </div>
      <div
        class="action delete-multiple"
        :class="{ disabled: !deletable }"
        @click="$emit('delete-multiple')"
      >
        <v-icon color="#fa4600"> hi-delete </v-icon>
        <div
          v-if="badgeSelected > 0"
          :class="['badge-selected', badgeSelected > 9 ? 'square' : '']"
        >
          {{ badgeSelected > 99 ? '99+' : badgeSelected }}
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import { TranslateResult } from 'vue-i18n';

import { toast } from '@/plugins/events';

interface IOperators {
  text: TranslateResult;
  value: string;
}

interface IColumn {
  name: string;
  type: string;
}

interface ISearchBox {
  column: string | null;
  operator: string;
  value: string | null;
}

@Component
export default class BoxSearch extends Vue {
  @Prop({ default: true })
  private added!: boolean;

  @Prop({ default: 'hi-add-circle' })
  private addIcon!: string;

  @Prop({ default: '' })
  private addText!: string;

  @Prop({ default: 0 })
  private badgeSelected!: number | string;

  @Prop({ default: false })
  private clear!: boolean;

  @Prop({ default: false })
  private deletable!: boolean;

  @Prop({ default: false })
  private editable!: boolean;

  @Prop({ default: () => [] })
  private fields!: [];

  @Prop({ default: false })
  private isLoading!: boolean;

  @Prop({ default: false })
  private isLoadingFields!: boolean;

  @Prop({ default: true })
  private refresh!: boolean;

  @Prop({
    default: () => ({
      type: '',
      value: '',
    }),
  })
  private search!: Record<string, string>;

  private searchBox: ISearchBox = {
    column: null,
    operator: 'contain',
    value: null,
  };
  private columnType: string | null = null;
  private value = '';

  get operators() {
    return (): IOperators[] => {
      const ops = [
        {
          text: this.$t('search.operators.equals'),
          value: 'equal',
        },
        {
          text: this.$t('search.operators.notEqual'),
          value: 'notEqual',
        },

        {
          text: this.$t('search.operators.isNull'),
          value: 'isNull',
        },
        {
          text: this.$t('search.operators.isNotNull'),
          value: 'isNotNull',
        },
      ];

      if (this.columnType === 'DATE' || this.columnType === 'TIMESTAMP') {
        return [
          {
            text: this.$t('search.operators.greater'),
            value: 'greater',
          },
          {
            text: this.$t('search.operators.greaterEqual'),
            value: 'greaterEqual',
          },
          {
            text: this.$t('search.operators.less'),
            value: 'less',
          },
          {
            text: this.$t('search.operators.lessEqual'),
            value: 'lessEqual',
          },

          ...ops,
        ];
      }

      return [
        {
          text: this.$t('search.operators.contains'),
          value: 'contain',
        },
        {
          text: this.$t('search.operators.notContains'),
          value: 'notContain',
        },
        // {
        //   text: this.$t('search.operators.startsWith'),
        //   value: 'startsWith',
        // },
        // {
        //   text: this.$t('search.operators.notStartsWith'),
        //   value: 'notStartsWith',
        // },
        {
          text: this.$t('search.operators.endsWith'),
          value: 'endsWith',
        },
        {
          text: this.$t('search.operators.notEndsWith'),
          value: 'notEndssWith',
        },
        ...ops,
      ];
    };
  }

  @Watch('clear')
  onClearChange(clear: boolean): void {
    if (clear) {
      this.value = '';
      this.searchBox.column = null;
      this.searchBox.value = null;
      this.searchBox.operator = 'contain';
      if (this.columnType === 'DATE' || this.columnType === 'TIMESTAMP') {
        this.searchBox.operator = 'greater';
      }

      this.$emit('search', '');
      this.$emit('empty');
    }
  }

  @Watch('searchBox.operator')
  onOperatorChange(operator: string): void {
    if (operator === 'isNull' || operator === 'isNotNull') {
      this.searchBox.value = null;
    }
  }

  created(): void {
    this.$emit('empty');
  }

  handleSearch(): void {
    if (
      (this.searchBox.column && this.searchBox.operator === 'isNull') ||
      (this.searchBox.column && this.searchBox.operator === 'isNotNull')
    ) {
      this.$emit('search', {
        column: this.searchBox.column,
        operator: this.searchBox.operator,
      });
      return;
    }

    if (this.searchBox.column && this.searchBox.value) {
      this.$emit('search', {
        column: this.searchBox.column,
        operator: this.searchBox.operator,
        value: this.searchBox.value,
      });
      return;
    }

    toast.error(this.$t('toast.search.invalid'));
  }

  setColumn(column: IColumn): void {
    this.searchBox.column = column.name;
    this.columnType = column.type.toUpperCase();
    this.searchBox.operator = 'contain';
    this.searchBox.value = null;

    if (this.columnType === 'data' || this.columnType === 'timestamp') {
      this.searchBox.operator = 'greater';
    }
  }
}
</script>

<style lang="scss">
.header-box-search {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 64px;
  padding: 0 40px;
  border-top: 1px solid rgba(#000000, 0.1);
  transition-duration: 0.2s;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform;
  transition-property: transform, width;

  .search {
    .search-on-database {
      .hi-search {
        margin-left: 16px;
      }
    }

    .search-on-table {
      .hi-search {
        margin-right: 16px;
      }
    }

    .search-on-database,
    .search-on-table {
      display: flex;
      flex-direction: row;
      align-items: center;

      .hi-search {
        font-size: 1.6em;
        color: #000000;
        cursor: pointer;
      }

      .input-text {
        .v-input__slot {
          background: #f0f0f0;
        }
      }

      .v-select:not(.v-autocomplete) {
        width: 160px;

        .v-input__slot {
          background: transparent;

          .v-select__selections {
            color: #000000;
          }
        }
      }

      .v-input {
        &.v-text-field--outlined {
          fieldset {
            border: none !important;
          }
        }

        &.v-input--is-disabled {
          .v-input__slot {
            background: #f2f2f2;
          }
        }

        .v-input__control {
          min-height: 28px !important;
          .v-input__slot {
            min-height: 28px !important;
          }
        }
      }
    }
  }

  .actions {
    position: relative;
    display: flex;
    flex-direction: row;
    align-items: center;

    .v-btn {
      padding: 0 12px !important;

      span {
        line-height: 1;

        i {
          margin-right: 8px;
          font-size: 1.3em;
        }
      }
    }

    .action {
      margin-left: 12px;
      cursor: pointer;

      &.disabled {
        pointer-events: none;
        cursor: default;

        i {
          color: rgba(#000000, 0.3) !important;
        }
      }
    }

    .hi {
      font-size: 2em;

      &.hi-play {
        font-size: 1.6em;
      }
    }

    .vertical-divider {
      height: 24px;
      margin-left: 12px;
      border-right: 1px solid rgba(#000000, 0.1);
    }

    .refresh {
      display: flex;
      flex-direction: row;

      .hi-refresh {
        color: #000000;
      }
    }

    .delete-multiple {
      position: relative;

      &.disabled {
        pointer-events: none;

        .hi-delete {
          color: rgba(#000000, 0.3) !important;
        }
      }

      .badge-selected {
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        position: absolute;
        right: -4px;
        bottom: 0;
        padding: 7px 5px;
        width: 13px;
        height: 13px;
        line-height: 1;
        border-radius: 50%;
        color: #ffffff;
        background: #fa4600;

        &.square {
          right: -10px;
          width: auto;
          border-radius: 8px;
        }
      }
    }
  }
}
</style>
