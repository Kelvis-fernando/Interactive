<template>
  <div
    class="box-list-actions"
    :style="`${showViewModes ? '' : 'justify-content: flex-end'}`"
  >
    <div v-if="showViewModes" class="list-actions-view-mode">
      <v-icon
        :class="{ active: viewMode === 'list' }"
        @click="$emit('toggle-view-mode', 'list')"
      >
        hi-list
      </v-icon>
      <v-icon
        :class="{ active: viewMode === 'card' }"
        @click="$emit('toggle-view-mode', 'card')"
      >
        hi-view-module
      </v-icon>
      <slot name="viewMode" />
    </div>

    <div class="list-actions">
      <slot name="actions" />
      <div v-if="showActions || showRefresh" class="refresh">
        <v-progress-circular
          v-if="isLoading"
          indeterminate
          color="#000000"
          size="18"
          width="1"
        />
        <div v-else class="refresh">
          <v-icon @click="$emit('refresh')">hi-refresh</v-icon>
        </div>
      </div>
      <div
        v-if="showActions || showDeleteMultiple"
        :class="[
          'list-actions-delete-multiple',
          selected < 1 ? 'disabled' : '',
        ]"
        @click="$emit('delete-multiple')"
      >
        <v-icon color="#fa4600">hi-delete</v-icon>
        <div
          v-if="selected > 0"
          :class="['badge-selected', selected > 9 ? 'square' : '']"
        >
          {{ selected > 99 ? '99+' : selected }}
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';

@Component
export default class ListActions extends Vue {
  @Prop({ type: Boolean, required: true, default: false })
  private isLoading!: boolean;

  @Prop({ type: Boolean, default: true })
  private showViewModes!: boolean;

  @Prop({ type: String, default: '' })
  private viewMode!: string;

  @Prop({ type: Boolean, default: true })
  private showActions!: boolean;

  @Prop({ type: Boolean, default: false })
  private showRefresh!: boolean;

  @Prop({ type: Boolean, default: false })
  private showDeleteMultiple!: boolean;

  @Prop({ type: Number, default: 0 })
  private selected!: number;
}
</script>

<style lang="scss">
.box-list-actions {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 46px;

  .list-actions-view-mode {
    align-self: center;

    .v-icon.v-icon--link {
      user-select: none;
    }

    .hi {
      font-size: 1.6em;
      color: rgba(#000000, 0.3);
      user-select: none;

      &.active {
        user-select: none;
        pointer-events: none;
        color: #000000;
      }
    }

    .hi:not(:last-child) {
      margin-right: 10px;
    }
  }

  .list-actions {
    position: relative;
    display: flex;
    flex-direction: row;
    align-items: center;

    div:not(:last-child) {
      margin-right: 10px;
    }

    .vertical-divider {
      border-right: 1px solid rgba(#000000, 0.1);
    }

    div {
      display: flex;
      align-items: center;
      cursor: pointer;

      &.disabled {
        pointer-events: none;

        i {
          color: #0000004d !important;
        }
      }

      i {
        color: #000000;
        font-size: 1.6em;
      }
    }

    .refresh {
      display: flex;
      flex-direction: row;
      cursor: pointer;

      .refresh-text {
        align-self: center;
      }

      .hi-refresh {
        font-size: 1.8em;
        color: #000000;
      }
    }

    .list-actions-delete-multiple {
      position: relative;
      cursor: pointer;

      &.disabled {
        pointer-events: none;

        .hi-delete {
          color: #0000004d !important;
        }
      }

      .hi-delete {
        font-size: 1.8em;
      }

      .badge-selected {
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        position: absolute;
        right: -5px;
        bottom: -3px;
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
