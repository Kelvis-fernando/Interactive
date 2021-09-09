<template>
  <v-menu offset-y left bottom content-class="menu-support">
    <template #activator="{ on }">
      <v-btn dark text v-on="on">
        <v-icon size="16">hi-help-circle-outlined</v-icon>
      </v-btn>
    </template>

    <v-list class="h-dropdown" color="#3C3C3C">
      <v-list-item>
        <v-list-item-title>
          {{ $t('appbar.toolbarSupport.support') }}
        </v-list-item-title>
      </v-list-item>

      <v-list-item>
        <v-list-item-title>
          {{ $t('appbar.toolbarSupport.docs') }}
        </v-list-item-title>
      </v-list-item>

      <v-list-item>
        <v-list-item-title>
          {{ $t('appbar.toolbarSupport.userGuide') }}
        </v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component
export default class ToolbarSupport extends Vue {}
</script>

<style lang="scss" scoped>
.v-menu__content.menu-support {
  border-radius: 0;
  border: 0;

  .h-dropdown.v-list {
    min-width: 180px;
    padding: 0;
    border-radius: 0 !important;
    width: 100%;

    .v-list-item {
      padding: 0 28px;
      min-height: 44px !important;
      color: rgba(#ffffff, 0.6) !important;

      .v-list-item__title {
        font-size: 1.2em !important;
        font-weight: 300;
      }
    }
    .v-list-item:hover {
      color: #ffffff !important;
      background-color: rgba(#ffffff, 0.1) !important;
    }
    .v-list-item.v-list-item--active {
      background-color: rgba(#ffffff, 0.1) !important;
    }
  }
}
</style>
