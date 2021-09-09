<template>
  <v-menu offset-y bottom left content-class="menu-notifications">
    <template #activator="{ on }">
      <v-btn dark text small v-on="on">
        <div class="badge">
          <span v-if="notifications.length > 0" class="hasNotification"></span>
          <v-icon size="16">hi-notifications</v-icon>
        </div>
      </v-btn>
    </template>

    <div class="subheader">
      {{ $t('appbar.toolbarNotifications.title') }}
    </div>

    <v-list class="h-dropdown" color="#3C3C3C">
      <v-list-item v-if="notifications.length < 1">
        <v-list-item-title class="content">
          <div class="message">
            {{ $t('default.noDataText') }}
          </div>
        </v-list-item-title>
      </v-list-item>

      <v-list-item v-for="(notification, i) in show" :key="i">
        <v-list-item-title class="content">
          <div class="time">
            {{ $date.formatDistanceToNow(notification.time) }}
          </div>
          <div class="message">
            {{ formatMessage(notification.message) }}
          </div>
        </v-list-item-title>
      </v-list-item>
    </v-list>

    <div class="actions">
      <v-btn
        v-if="notifications.length > 1"
        class="clear-all"
        text
        color="#ffffff99"
        @click.stop="clearAll"
      >
        {{ $t('appbar.toolbarNotifications.clearAll') }}
      </v-btn>

      <v-btn v-if="notifications.length > 1" class="more" text color="#fa4600">
        {{ $t('appbar.toolbarNotifications.more') }}
      </v-btn>
    </div>
  </v-menu>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { Action, Getter } from 'vuex-class';
import { TranslateResult } from 'vue-i18n';

import { INotification } from '@/store/modules/system/notifications';

@Component
export default class ToobalNotifications extends Vue {
  @Getter('notifications/list')
  private notifications!: INotification[];

  get show(): INotification[] {
    return this.notifications.slice(
      this.notifications.length - 3,
      this.notifications.length,
    );
  }

  @Action('notification/setAllAsRead')
  private setAllAsRead!: () => Promise<INotification[]>;

  clearAll(): void {
    console.log('clear-all');
  }

  formatMessage(message: string | Record<string, any>): TranslateResult {
    if (typeof message === 'string') return message;

    return this.$t(`notifications.${message.type}`, { item: message.item });
  }
}
</script>

<style lang="scss" scoped>
.badge {
  .hasNotification {
    display: block;
    position: absolute;
    top: -1px;
    right: -1px;
    border-radius: 50%;
    background: #fa4600;
    width: 8px;
    height: 8px;
  }
}

.v-menu__content.menu-notifications {
  border-radius: 0;
  border: 0;
  background: #3c3c3c;

  .subheader {
    font-size: 2.2em;
    font-weight: 300;
    color: #ffffff !important;
    padding: 28px 28px 24px;
    background: #3c3c3c;
    cursor: default;
  }

  .h-dropdown.v-list {
    min-width: 180px;
    max-width: 272px;
    /* max-height: 185px;
    overflow-y: auto; */
    padding: 0;
    border-radius: 0 !important;
    width: 100%;

    .v-list-item {
      padding: 0 28px;
      min-width: 266px;
      min-height: 60px !important;
      max-height: 60px !important;
      color: rgba(#ffffff, 0.6) !important;

      .v-list-item__title.content {
        font-size: inherit;
        padding: 12px 0;

        .time {
          font-size: 1em;
          font-weight: 200;
          color: rgba(#ffffff, 0.3);
        }
        .message {
          font-size: 1.2em;
          font-weight: 300;
          color: rgba(#ffffff, 0.6);
          margin-top: 12px;
          white-space: nowrap;
          text-overflow: ellipsis;
          overflow: hidden;
        }
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
  .actions {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    padding: 10px;
    background: #3c3c3c;

    .see-all {
      color: #ffffff;
      font-size: 1.2em;
      font-weight: 200;
    }
  }
}
</style>
