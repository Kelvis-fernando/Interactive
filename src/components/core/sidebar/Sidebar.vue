<template>
  <v-navigation-drawer
    v-if="isActive"
    v-model="drawer"
    :class="[hasAlert && 'has-alert']"
    app
    clipped
    :width="236"
  >
    <h-content-loader
      v-if="isLoadingMenus"
      :height="500"
      :width="236 * 1.2"
      :speed="2"
      style="padding: 40px 12px 12px 12px"
      primary-color="#f3f3f3"
      secondary-color="#cccccc"
    >
      <circle cx="30" cy="20" r="15" />
      <rect x="65" y="13" rx="0" ry="0" width="160" height="15" />
      <rect x="65" y="45" rx="0" ry="0" width="160" height="15" />
      <rect x="65" y="75" rx="0" ry="0" width="160" height="15" />
      <rect x="65" y="105" rx="0" ry="0" width="160" height="15" />

      <circle cx="30" cy="187" r="15" />
      <rect x="65" y="180" rx="0" ry="0" width="160" height="15" />
      <rect x="65" y="210" rx="0" ry="0" width="160" height="15" />
      <rect x="65" y="240" rx="0" ry="0" width="160" height="15" />
      <rect x="65" y="270" rx="0" ry="0" width="160" height="15" />
    </h-content-loader>

    <v-list v-else :class="{ 'is-loading': isLoadingMenus }">
      <div v-for="(menu, i) in menusAvailable" :key="i" class="h-list-group">
        <v-list-item class="ativator" :ripple="false">
          <v-icon class="append-icon">{{ menu.icon }}</v-icon>

          <span>{{ menuName(menu.name) }}</span>
        </v-list-item>

        <div class="h-sub-group">
          <v-list-item
            v-for="(child, key) in menu.children"
            :key="key"
            :class="{ disabled: !child.status }"
            :ripple="false"
            :to="child.url"
            active-class="active-route"
            link
          >
            <v-list-item-title>
              {{ submenuName(menu.name, child.name) }}
            </v-list-item-title>

            <div v-if="child.new" class="new">
              {{ $t('menus.new') }}
            </div>
          </v-list-item>
        </div>
      </div>
    </v-list>
  </v-navigation-drawer>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import { Getter, Mutation } from 'vuex-class';
import { TranslateResult } from 'vue-i18n';

import { IMenu } from '@/store/modules/system';

@Component
export default class Sidebar extends Vue {
  @Prop({ default: false })
  private isActive!: boolean;

  get drawer(): boolean {
    return this.isMenuOpen;
  }

  set drawer(open: boolean) {
    this.setMenuOpen(open);
  }

  get menusAvailable(): IMenu[] {
    return this.userMenus.filter(menu => {
      menu.children = menu.children.filter(child => child.status);
      return menu.status && menu.children.length > 0;
    });
  }

  get hasAlert(): boolean {
    return !!this.alertMessage;
  }

  @Getter('system/isLoadingMenus')
  private isLoadingMenus!: boolean;

  @Getter('system/menus')
  private userMenus!: IMenu[];

  @Getter('system/isMenuOpen')
  private isMenuOpen!: boolean;

  @Getter('system/alert')
  private alertMessage!: string;

  @Mutation('system/setMenuOpen')
  private setMenuOpen!: (data: boolean) => void;

  @Watch('loading')
  onLoadingChange(value: boolean): void {
    if (!value) {
      setTimeout(() => {
        const active = document.querySelector('.active-route') as HTMLElement;
        if (active) {
          const tag = document.querySelector('.v-navigation-drawer__content');
          if (tag)
            tag.scrollTop = active.offsetTop - (window.innerHeight / 2 - 40);
        }
      }, 100);
    }
  }

  menuName(name: string): TranslateResult | string {
    return this.$te(`menus.${name.replace(' ', '')}.name`)
      ? this.$t(`menus.${name.replace(' ', '')}.name`)
      : name;
  }

  submenuName(name: string, child: string): TranslateResult | string {
    return this.$te(
      `menus.${name.replace(' ', '')}.children.${child.replace(' ', '')}`,
    )
      ? this.$t(
          `menus.${name.replace(' ', '')}.children.${child.replace(' ', '')}`,
        )
      : child;
  }
}
</script>

<style lang="scss">
.v-navigation-drawer {
  &.has-alert {
    top: 84px !important;
  }

  &.v-navigation-drawer--is-mobile {
    top: 48px !important;
  }

  .v-navigation-drawer__content {
    padding-bottom: 48px;

    &::-webkit-scrollbar {
      height: 5px;
      width: 5px;
    }

    &::-webkit-scrollbar-track {
      border-radius: 50%;
    }

    &::-webkit-scrollbar-thumb {
      background: rgba(200, 200, 200);
      opacity: 0.4;
      border-radius: 10px;
    }

    &::-webkit-scrollbar-thumb:hover {
      background: rgba(190, 190, 190);
    }

    @media (hover: none) and (pointer: coarse) {
      & {
        overflow-y: auto !important;
      }
    }
    @media (hover: hover) {
      & {
        overflow-y: hidden !important;

        .v-list.is-loading {
          opacity: 0;
          pointer-events: none;
        }

        &:hover {
          overflow-y: auto !important;

          .h-list-group {
            .ativator {
              .submenu {
                display: block;
              }
            }
          }
        }
      }
    }
  }

  .v-navigation-drawer__border {
    background-color: #ffffff !important;
  }

  .h-list-group {
    a {
      opacity: 1 !important;
    }

    .ativator {
      overflow: hidden;
      position: relative;
      margin-top: 32px;
      font-weight: 600;

      &:hover::before {
        opacity: 0;
      }
      .append-icon {
        color: #000000;
        font-size: 2em;
        font-weight: 500;
        margin: 0 12px;
      }

      span {
        font-size: 1.4em;
        white-space: normal;
        line-height: 1.2;
      }
      .submenu {
        display: none;
        position: absolute;
        right: 12px;
        color: #000000;
        font-weight: 500;
        transform: rotate(0);

        &.open {
          transform: rotate(180deg);
        }
      }
    }

    .h-sub-group {
      .v-list-item {
        display: flex;
        min-height: 36px !important;

        &:hover::before {
          opacity: 0;
        }

        &.disabled {
          pointer-events: none;

          .v-list-item__title {
            color: rgba(#000000, 0.3);
          }
        }

        .v-list-item__title {
          display: flex;
          flex: none;
          padding-left: 50px;
          font-size: inherit;
          color: rgba(#000000, 0.9);
        }

        .new {
          display: flex;
          align-items: center;
          padding: 3px 8px;
          margin-left: 12px;
          color: #ffffff;
          font-size: 0.67em;
          font-weight: 300;
          line-height: 1;
          background: rgba(#707070, 0.7);
        }

        &:hover .v-list-item__title {
          color: #000000;
        }

        &.v-list-item--active {
          background-color: #f5f5f5 !important;

          .v-list-item__title {
            color: #000000 !important;
            font-weight: 700;
          }
          &::before {
            opacity: 0 !important;
          }
        }
      }
    }
  }
}
</style>
