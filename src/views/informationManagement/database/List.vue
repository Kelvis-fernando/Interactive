<template>
  <div class="databases">
    <h-header-content
      :path-from="$t('menus.InformationManagement.name')"
      :path-title="$t('databases.title')"
    >
      <template #actions>
        <h-create-database has-ativator @refresh="refreshData" />
      </template>
    </h-header-content>

    <div class="box-content list-actions">
      <h-list-actions
        :is-loading="loading"
        :view-mode="viewMode"
        :selected="selected.length"
        @refresh="refreshData"
        @delete-multiple="deleteMultiple"
        @toggle-view-mode="viewMode = $event"
      />

      <div v-if="viewMode === 'list'" class="view-list">
        <h-data-table
          v-model="selected"
          :headers="headers"
          :items="items"
          :loading="loading"
          item-key="id"
          row-click
          show-select
          @edit="editItem"
          @delete="deleteItem"
          @click:row="viewDatabase"
        >
          <template #[`item.TYPE_ID`]="{ value }">
            <div
              :class="['type', getType(value) === 'PROD' ? 'prod' : 'dev']"
              style="text-align: center"
            >
              {{ getType(value) }}
            </div>
          </template>
        </h-data-table>
      </div>

      <div v-else class="view-card">
        <div v-if="items.length < 1" class="no-data">
          {{ loading ? $t('default.loadingText') : $t('default.noDataText') }}
        </div>
        <h-card-default
          v-for="item in items"
          :key="item.ID"
          :data="item"
          icon="hi-database"
          @show="viewDatabase"
          @edit="editItem"
          @delete="deleteItem"
        >
          <template #details="data">
            <div class="name">
              {{
                data.NAME.length > 34
                  ? data.NAME.substring(0, 34).concat('...')
                  : data.NAME
              }}
            </div>
            <div class="description">
              {{ `${$t('cards.audience')} ${data.ROWS}` }}
            </div>
            <div class="description">ID {{ data.ID }}</div>
          </template>

          <template #footer="data">
            <div class="detail">
              {{ showDateTime(data.UPDATED_AT) }}
            </div>
            <div
              :class="[
                'type',
                getType(data.TYPE_ID) === 'PROD' ? 'prod' : 'dev',
              ]"
              style="text-align: center"
            >
              {{ getType(data.TYPE_ID) }}
            </div>
          </template>

          <template #actions="data">
            <div class="action" @click.stop="editItem(data)">
              {{ $t('cards.edit') }}
            </div>
            <div class="action" @click.stop="deleteItem(data)">
              {{ $t('cards.delete') }}
            </div>
          </template>
        </h-card-default>
      </div>
    </div>

    <h-dialog
      v-model="editDialog"
      width="390"
      :title="$t('dialog.edit')"
      :confirm-loading="saving"
      @close="close"
      @confirm="save"
    >
      <template #content>
        <div class="label">
          {{ $t('databases.create.name.label') }}
        </div>
        <v-text-field
          v-model="form.name"
          type="text"
          :placeholder="$t('databases.create.name.placeholder')"
          color="rgba(0,0,0,0.9)"
          outlined
          solo
          flat
          dense
        />

        <div class="label">
          {{ $t('databases.create.category.label') }}
        </div>
        <v-radio-group v-model="form.type" mandatory hide-details>
          <v-radio
            :label="$t('databases.create.category.prod')"
            :ripple="false"
            color="#FA6400"
            :value="types[0]"
          />
          <v-radio
            :label="$t('databases.create.category.dev')"
            :ripple="false"
            color="#FA6400"
            :value="types[1]"
          />
        </v-radio-group>
      </template>
    </h-dialog>

    <h-dialog
      v-model="deleteDialog"
      max-width="400"
      alert
      type="delete"
      :delete-text="removeText"
      :confirm-loading="deleting"
      @close="close"
      @confirm="destroy"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { Getter, Mutation, Action } from 'vuex-class';
import { TranslateResult } from 'vue-i18n';

import { ViewMode, ViewModeKeys, ViewModeParams } from '@/store/modules/system';
import { IDatabase } from '@/store/modules/information-management/databases';
import { toast } from '@/plugins/events';
import { Type } from '@/utils/types';
import { getDateTimeFormatted } from '@/utils/date';

interface Form {
  id: number | null;
  name: string | null;
  type: Type | null;
}

@Component
export default class ListDatabases extends Vue {
  private loading = false;
  private saving = false;

  private form: Form = {
    id: null,
    name: null,
    type: null,
  };

  private editDialog = false;
  private deleteDialog = false;
  private multiple = false;
  private removeText: TranslateResult | null = null;
  private deleting = false;
  private types = [
    {
      text: 'PROD',
      value: 5,
    },
    {
      text: 'DEV',
      value: 4,
    },
  ];

  private selected: IDatabase[] = [];
  private headers = [
    {
      text: this.$t('default.headers.id'),
      value: 'ID',
    },
    {
      text: this.$t('default.headers.name'),
      value: 'NAME',
    },
    {
      text: this.$t('default.headers.type'),
      value: 'TYPE_ID',
    },
    {
      text: this.$t('default.headers.audience'),
      value: 'ROWS',
    },
    {
      text: this.$t('default.headers.created'),
      value: 'CREATED_AT',
    },
    {
      text: this.$t('default.headers.updated'),
      value: 'UPDATED_AT',
    },
    {
      text: this.$t('default.headers.owner'),
      value: 'OWNER',
    },
    {
      text: this.$t('default.headers.actions'),
      value: 'ACTIONS',
      sortable: false,
      align: 'center',
    },
  ];

  get viewMode(): ViewMode {
    return this.allViewMode.databases;
  }

  set viewMode(mode: ViewMode) {
    this.setViewMode({
      key: 'databases',
      mode,
    });
  }

  get showDateTime(): typeof getDateTimeFormatted {
    return getDateTimeFormatted;
  }

  @Getter('system/viewMode')
  private allViewMode!: Record<ViewModeKeys, ViewMode>;

  @Getter('information-management/databases/list')
  private items!: IDatabase[];

  @Mutation('system/setViewMode')
  private setViewMode!: (data: ViewModeParams) => void;

  @Mutation('information-management/databases/setCurrent')
  private setCurrent!: (data: IDatabase | null) => void;

  @Action('information-management/databases/index')
  private getDatabases!: () => Promise<IDatabase[]>;

  @Action('information-management/databases/update')
  private update!: (data: Form) => Promise<IDatabase>;

  @Action('information-management/databases/delete')
  private delete!: (data: number[]) => Promise<void>;

  created(): void {
    this.refreshData();
    console.log(this.viewMode);
  }

  close(): void {
    this.editDialog = false;
    this.deleteDialog = false;
  }

  deleteItem(item: IDatabase): void {
    this.multiple = false;
    this.removeText = this.removeText = this.$tc(
      'default.delete.databases',
      1,
      {
        name:
          item.NAME.length > 20
            ? ` ${item.NAME.substring(0, 20).concat('...')}`
            : ` ${item.NAME}`,
      },
    );
    this.selected = [item];
    this.deleteDialog = true;
  }

  deleteMultiple(): void {
    this.multiple = true;
    if (this.selected.length < 2) {
      this.deleteItem(this.selected[0]);
      return;
    }
    this.removeText = this.$tc(
      'default.delete.databases',
      this.selected.length === this.items.length ? 0 : this.selected.length,
    );

    this.deleteDialog = true;
  }

  destroy(): void {
    this.$log.debug(`deleting databases`);

    const criteria = this.selected.map(i => i.ID);
    this.delete(criteria)
      .then(() => {
        toast.success(this.$tc('toast.databases.deleted', criteria.length));
        this.refreshData();
        this.deleteDialog = false;
        this.multiple = false;
        this.deleting = false;
      })
      .catch(() => {
        this.deleting = false;
      });
  }

  editItem(item: IDatabase): void {
    this.selected = [item];
    this.form = {
      id: item.ID,
      name: item.NAME,
      type: item.TYPE,
    };
    this.editDialog = true;
  }

  getType(id: number): string {
    const index = this.types.findIndex(item => item.value === id);
    return index >= 0 ? this.types[index].text : '';
  }

  refreshData(): void {
    this.$log.debug(`Getting databases`);

    this.loading = true;
    this.selected = [];

    this.getDatabases()
      .then(() => {
        this.loading = false;
      })
      .catch(() => {
        this.loading = false;
      });
  }

  save(): void {
    if (!this.form.id) return;
    this.$log.debug(`Updating database ${this.form.id}`);

    this.saving = true;

    this.update(this.form)
      .then(() => {
        toast.success(this.$t('toast.databases.updated'));
        this.refreshData();
        this.editDialog = false;
        this.form = {
          id: null,
          name: null,
          type: null,
        };
        this.saving = false;
      })
      .catch(() => {
        this.saving = false;
      });
  }

  viewDatabase(database: IDatabase): void {
    this.setCurrent(database);
    this.$router.push(`/information-management/databases/view/${database.ID}`);
  }
}
</script>

<style lang="scss">
.databases {
  .box-content {
    .view-list {
      width: 100%;

      .type {
        max-width: 55px;
        color: #ffffff;
        padding: 6px 10px;
        line-height: 1;

        &.prod {
          background: #2fd100;
        }
        &.dev {
          background: #ffc505;
        }
      }
    }

    .view-card {
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      flex: 1;
      width: 100%;

      .no-data {
        font-size: 1.2em;
        text-align: center;
        width: 100%;
      }

      .card-default {
        .footer {
          .type {
            color: #ffffff;
            padding: 6px 12px;
            line-height: 1;

            &.prod {
              background: #2fd100;
            }
            &.dev {
              background: #ffc505;
            }
          }
        }
      }

      /* .flex-cards {
        position: relative;
        display: flex;
        align-items: flex-start;
        flex-wrap: wrap;
        height: auto;
        padding: 25px 34px;
        overflow: hidden;
        transition: all 0.9s ease;

        &.hidden {
          background: rgb(240, 240, 240);
        }

        .box-card {
          position: relative;
          box-sizing: border-box;
          overflow: hidden;
          margin: 5px;
          cursor: pointer;
        }
      } */
    }
  }
}
</style>
