<template>
  <v-menu offset-y left content-class="menu-companies">
    <template #activator="{ on }">
      <v-btn class="btn-toolbar-companies" dark text v-on="on">
        {{ company.NAME }}

        <v-icon>hi-select</v-icon>
      </v-btn>
    </template>

    <v-card class="h-dropdown-companies" tile color="#3C3C3C">
      <v-card-title class="h-dropdown-title">
        <div class="image">
          <v-icon size="22" color="#FFFFFF4D">hi-company</v-icon>
        </div>
        <div class="company-name">{{ company.NAME }}</div>

        <router-link
          v-if="company.ROLE === 'Owner'"
          color="#ffffff99"
          to="/companies/settings"
        >
          {{ $t('appbar.toolbarCompanies.settings') }}
          <v-icon size="14" color="#ffffff99">chevron_right</v-icon>
        </router-link>
      </v-card-title>

      <v-list v-if="showCompanies.length > 0" color="#3C3C3C">
        <div class="subheader">
          {{ $t('appbar.toolbarCompanies.subheader') }}
        </div>
        <v-list-item
          v-for="comp in showCompanies"
          :key="comp.CID"
          @click="changeCompany(comp)"
        >
          <v-list-item-title>{{ comp.NAME }}</v-list-item-title>
        </v-list-item>
      </v-list>

      <div class="actions">
        <v-btn
          v-if="companies.length > 1"
          class="see-all"
          text
          color="#FFFFFF"
          @click="seeAll"
        >
          {{ $t('appbar.toolbarCompanies.seeAll') }}
        </v-btn>
        <v-btn class="add" text color="#FA4600" to="/companies/create-company">
          <v-icon>add</v-icon>
          {{ $t('appbar.toolbarCompanies.add') }}
        </v-btn>
      </div>
    </v-card>
  </v-menu>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { Getter, Mutation } from 'vuex-class';

import { ICompany } from '@/store/modules/companies';

@Component
export default class ToolbarCompanies extends Vue {
  private open = false;

  @Getter('companies/list')
  private companies!: ICompany[];

  @Getter('companies/current')
  private company!: ICompany;

  get showCompanies(): ICompany[] {
    return this.companies
      .filter((item: ICompany) => item.CID !== this.company.CID)
      .filter((_: ICompany, index: number) => index < 3);
  }

  @Mutation('companies/setCurrent')
  private setCurrentCompany!: (data: ICompany) => void;

  changeCompany(company: ICompany): void {
    if (this.$route.params.ID) {
      this.$router.push(this.$route.matched[1].path.split(':')[0]);
    }

    this.setCurrentCompany(company);
  }

  seeAll(): void {
    this.$router.push('/companies/choose-company');
  }
}
</script>

<style lang="scss">
.v-menu__content.menu-companies {
  border-radius: 0;
  border: 0;

  .h-dropdown-companies {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    min-width: 272px;
    max-width: 272px;

    .v-card__title {
      padding: 24px 28px 20px;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      font-size: inherit;

      .image {
        position: relative;
        display: flex;
        justify-content: center;
        margin-bottom: 16px;
        width: 48px;
        height: 48px;
        border-radius: 50%;
        border: 1.5px solid rgba(#ffffff, 0.3);
      }

      .company-name {
        font-size: 2em;
        font-weight: 400;
        line-height: 1.3;
        color: #ffffff;
        white-space: pre-wrap;
        max-width: 250px;
        cursor: default;
      }

      a {
        font-size: 1.2em !important;
        font-weight: 400;
        color: rgba(#ffffff, 0.6) !important;
      }
    }

    .v-list {
      margin-top: 20px;
      width: 100%;

      .subheader {
        font-size: 1.2em;
        font-weight: 400;
        color: rgba(#ffffff, 0.5) !important;
        margin-left: 28px;
        cursor: default;
      }

      .theme--light.v-list-item {
        padding: 0 28px;
        min-height: 36px !important;
        font-size: 1.2em !important;
        font-weight: 200;
        color: #ffffff !important;

        .v-list-item__title {
          font-size: inherit;
        }
      }
      .theme--light.v-list-item:hover {
        background-color: rgba(#ffffff, 0.1) !important;
      }
      .theme--light.v-list-item.v-list-item--active {
        background-color: rgba(#ffffff, 0.1) !important;
      }
    }

    .actions {
      display: flex;
      flex-direction: row;
      justify-content: flex-end;
      margin-top: 16px;
      padding: 10px;

      .see-all {
        font-size: 1.2em;
        font-weight: 400;
        color: rgba(#ffffff, 0.5) !important;
      }

      .add {
        font-size: 1.3em !important;

        i {
          font-size: 1.1em;
          font-weight: 700;
        }
      }
    }
  }
}
</style>
