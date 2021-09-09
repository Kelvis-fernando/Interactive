<template>
  <v-app-bar app clipped-left color="#000" dark flat dense>
    <v-app-bar-nav-icon v-if="isActive" @click.stop="toggleMenu" />
    <img class="logo" src="@/assets/logo-light.svg" alt="Header" />

    <v-spacer />

    <v-toolbar-items>
      <h-toolbar-companies v-if="isActive && company" />
      <!-- <h-toolbar-downloads /> -->
      <!-- <h-toolbar-support /> -->
      <!-- <h-toolbar-notifications /> -->
      <h-toolbar-user />
    </v-toolbar-items>
  </v-app-bar>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { Getter, Mutation } from 'vuex-class';

import { ICompany } from '@/store/modules/companies';

@Component
export default class AppBar extends Vue {
  @Prop({ type: Boolean, default: false })
  private isActive!: boolean;

  @Getter('system/isMenuOpen')
  private isMenuOpen!: boolean;

  @Mutation('system/setMenuOpen')
  private setMenuOpen!: (data: boolean) => void;

  @Getter('companies/current')
  private company!: ICompany;

  toggleMenu(): void {
    this.setMenuOpen(!this.isMenuOpen);
  }
}
</script>

<style lang="scss">
.v-toolbar {
  .v-toolbar__content,
  .v-toolbar__extension {
    padding: 0 0 0 14px !important;
  }

  .logo {
    height: 10px;
    margin-left: 19px;
  }

  .v-btn.btn-toolbar-companies {
    font-size: 1.1em !important;
    font-weight: 400;

    i {
      font-size: 1.8em;
      font-weight: 100;
    }
  }

  .v-btn.btn-toolbar-user {
    font-size: inherit !important;

    .hi-person {
      font-size: 1.6em;
    }
  }
}
</style>
