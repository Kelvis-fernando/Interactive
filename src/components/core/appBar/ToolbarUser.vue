<template>
  <v-menu offset-y bottom left content-class="menu-user">
    <template #activator="{ on }">
      <v-btn class="btn-toolbar-user" dark text v-on="on">
        <v-icon>hi-person</v-icon>
      </v-btn>
    </template>

    <v-card color="#3C3C3C" class="h-dropdown-user">
      <v-card-title>
        <div class="image">
          <v-icon size="22" color="#FFFFFF4D">hi-person</v-icon>
        </div>
        <div class="user-name">
          {{ `${user ? user.first_name : ''} ${user ? user.last_name : ''}` }}
        </div>
        <div class="user-email">
          {{ user ? user.email : '' }}
        </div>
        <router-link class="settings" color="#ffffff99" to="/user/settings">
          {{ $t('appbar.toolbarUser.settings') }}
          <v-icon size="14" color="#ffffff99">chevron_right</v-icon>
        </router-link>
      </v-card-title>

      <div class="actions">
        <v-btn
          class="signout"
          color="#fa4600"
          tile
          depressed
          text
          @click="signOut"
        >
          {{ $t('appbar.toolbarUser.signOut') }}
        </v-btn>
      </div>
    </v-card>
  </v-menu>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { Getter, Mutation } from 'vuex-class';

import { IUserLogged } from '@/store/modules/user';

@Component
export default class ToolbarUser extends Vue {
  @Getter('auth/token')
  private token!: string;

  @Getter('user/profile')
  private user!: IUserLogged;

  @Mutation('auth/destroySession')
  private signOut!: () => void;
}
</script>

<style lang="scss">
.v-menu__content.menu-user {
  border-radius: 0;
  border: 0;
  background: #3c3c3c;

  .h-dropdown-user {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    min-width: 272px;

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
        border: 1.5px solid #ffffff4d;
      }

      .user-name {
        font-size: 2em;
        font-weight: 400;
        line-height: 1.2;
        color: #ffffff;
        cursor: default;
      }

      .user-email {
        margin-top: 8px;
        font-size: 1.1em;
        font-weight: 400;
        line-height: 1;
        color: rgba(#ffffff, 0.6) !important;
        cursor: default;
      }

      .settings {
        margin-top: 24px;
        line-height: 1;
        font-size: 1.2em !important;
        font-weight: 400;
        color: rgba(#ffffff, 0.6) !important;
        cursor: pointer;

        i {
          font-size: 1.2em;
        }
      }
    }

    .actions {
      position: relative;
      width: 100%;
      padding: 10px;
      text-align: right;

      .change-user {
        position: absolute;
        left: 10px;
        font-size: 1.3em;
      }
    }
  }
}
</style>
