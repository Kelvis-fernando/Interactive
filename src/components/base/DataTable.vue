<template>
  <v-data-table
    v-bind="$attrs"
    :class="{ 'row-click': rowClick }"
    loader-height="1"
    disable-pagination
    hide-default-footer
    :sort-by="sortBy"
    :sort-desc="sortDesc"
    :loading-text="$t('default.loadingText')"
    :no-data-text="$t('default.noDataText')"
    v-on="$listeners"
  >
    <template
      v-for="(_, name) in $scopedSlots"
      :slot="name"
      slot-scope="slotData"
    >
      <slot :name="name" v-bind="slotData" />
    </template>

    <template #[`header.data-table-select`]="{ on, props }">
      <v-simple-checkbox
        v-bind="props"
        color="#FA6400"
        hide-details
        :ripple="false"
        v-on="on"
      />
    </template>

    <template #[`item.data-table-select`]="{ isSelected, select }">
      <v-simple-checkbox
        color="#FA4600"
        :ripple="false"
        :value="isSelected"
        @input="select($event)"
      />
    </template>

    <template v-if="showTimestamps" #[`item.CREATED_AT`]="{ value }">
      {{ dateTimeFormatted(value) }}
    </template>

    <template v-if="showTimestamps" #[`item.UPDATED_AT`]="{ value }">
      {{ dateTimeFormatted(value) }}
    </template>

    <template #[`item.OWNER`]="{ item }">
      <div class="owner" :title="item.USER && item.USER.EMAIL">
        {{
          (item.USER && `${item.USER.FIRST_NAME} ${item.USER.LAST_NAME}`) ||
          item.OWNER
        }}
      </div>
    </template>

    <template #[`item.actions`]="{ item }">
      <div class="row-actions">
        <slot name="actions" v-bind="{ item }" />
        <div
          v-if="editable && (item.editable || item.OWNER)"
          class="edit"
          @click.stop="$emit('edit', item)"
        >
          <v-icon small class="mr-2"> hi-edit </v-icon>
        </div>

        <div
          v-if="deletable && (item.deletable || item.OWNER)"
          class="delete"
          @click.stop="$emit('delete', item)"
        >
          <v-icon small> hi-delete </v-icon>
        </div>
      </div>
    </template>
  </v-data-table>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';

import { getDateTimeFormatted } from '@/utils/date';

@Component
export default class DataTable extends Vue {
  @Prop({ type: Boolean, default: true })
  private deletable!: boolean;

  @Prop({ type: Boolean, default: true })
  private editable!: boolean;

  @Prop({ type: Boolean, default: false })
  private rowClick!: boolean;

  @Prop({ type: Boolean, default: true })
  private showTimestamps!: boolean;

  @Prop({ type: String, default: 'UPDATED_AT' })
  private sortBy!: string;

  @Prop({ type: Boolean, default: true })
  private sortDesc!: boolean;

  get dateTimeFormatted(): typeof getDateTimeFormatted {
    return getDateTimeFormatted;
  }
}
</script>

<style lang="scss">
.v-data-table {
  &.row-click {
    .v-data-table__wrapper {
      tbody {
        tr {
          cursor: pointer;
        }
      }
    }
  }

  .v-data-table__wrapper {
    thead.v-data-table-header {
      tr {
        &:hover {
          background: #fafafa !important;

          th {
            .table-actions {
              display: block;
            }
          }
        }

        th {
          font-size: 1em;
          color: #000000 !important;
          height: 32px;
          white-space: nowrap;

          span {
            margin-right: 6px;
          }

          .v-data-table-header__icon {
            opacity: 1;
          }
        }
      }
    }
    tbody {
      tr {
        position: relative;

        &:hover {
          background: #fafafa !important;

          td {
            .row-actions {
              opacity: 1;
              pointer-events: all;
            }
          }
        }

        &.v-data-table__selected {
          background: #fafafa;
        }

        td {
          white-space: nowrap;
          font-size: 1.2em !important;
          color: rgba(#000000, 0.6);

          .key-hash {
            position: relative;

            .hash {
              max-width: 50px;
              display: none;
              opacity: 0;
              visibility: hidden;
            }

            .copy {
              position: absolute;
              top: -2px;
              left: 40px;
              cursor: pointer;

              .hi-flip-front {
                font-size: 1.6em;
                pointer-events: none;
              }
            }
          }
        }

        .show-details {
          font-size: 1.4em;
        }

        .row-actions {
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          opacity: 0;
          pointer-events: none;
          transition: 0.3s;

          & > div {
            display: flex;
            align-items: center;
            height: 100%;
            cursor: pointer;

            &:hover {
              .hi {
                color: rgba(#000000, 0.9);
              }
            }
          }
        }
      }
    }
  }
}
</style>
