<template>
  <v-dialog v-bind="$attrs" v-on="$listeners">
    <template
      v-for="(_, name) in $scopedSlots"
      :slot="name"
      slot-scope="slotData"
    >
      <slot :name="name" v-bind="slotData" />
    </template>

    <div
      :class="[
        'dialog-header',
        alert ? 'alert' : '',
        scrollable ? 'scrollable' : '',
      ]"
    >
      <slot name="title" />
      <div v-if="title" class="dialog-title">
        {{ title }}
        <v-icon class="dialog-close" @click="$emit('close')">hi-close</v-icon>
      </div>

      <div class="dialog-alert">
        <slot name="alert" />
      </div>

      <div class="dialog-content">
        <div v-if="type === 'delete'">
          <v-icon class="delete-icon">hi-delete</v-icon>
          <div v-if="deleteText" class="dialog-text">
            {{ `${$t('dialog.removeText')} ${deleteText}` }}
          </div>

          <div class="dialog-subtext">
            {{ $t('dialog.removeSub') }}
          </div>
        </div>

        <slot name="content" />
      </div>

      <div v-if="!hideActions" class="dialog-actions">
        <div
          v-if="!$scopedSlots['actions-message']"
          class="dialog-actions-message"
          :class="messageClasses"
        >
          {{ message }}
        </div>
        <slot name="actions-message" />
        <div v-if="!$scopedSlots['actions']" class="actions">
          <v-btn
            color="#0000004d"
            depressed
            tile
            outlined
            height="32px"
            @click="$emit('close')"
          >
            {{ cancelText || $t('dialog.cancel') }}
          </v-btn>

          <v-btn
            v-if="!$scopedSlots['actions']"
            class="white--text"
            color="#fa4600"
            depressed
            tile
            height="32px"
            :disabled="confirmDisabled"
            :loading="confirmLoading"
            @click="$emit('confirm')"
          >
            {{ confirmText || $t('dialog.confirm') }}
          </v-btn>
        </div>
        <slot name="actions" />
      </div>
    </div>
  </v-dialog>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';

@Component
export default class Dialog extends Vue {
  @Prop({ type: Boolean, default: false })
  private alert!: boolean;

  @Prop({ type: String, default: '' })
  private cancelText!: string;

  @Prop({ type: Boolean, default: false })
  private confirmDisabled!: boolean;

  @Prop({ type: Boolean, default: false })
  private confirmLoading!: boolean;

  @Prop({ type: String, default: '' })
  private confirmText!: string;

  @Prop({ type: String, default: '' })
  private deleteText!: string;

  @Prop({ type: Boolean, default: false })
  private hideActions!: boolean;

  @Prop({ type: Boolean, default: false })
  private scrollable!: boolean;

  @Prop({ type: String })
  private title!: string;

  @Prop({ type: String })
  private type!: string;

  @Prop({ type: String })
  private message!: string;

  @Prop({ type: String })
  private messageClasses!: string;
}
</script>

<style lang="scss">
.v-dialog {
  overflow: hidden;

  .dialog-header {
    position: relative;
    background: #ffffff;

    &.alert {
      text-align: center;
      padding: 32px 68px 24px;

      .dialog-actions {
        text-align: center;
        margin-top: 48px;
      }
    }

    &:not(.alert) {
      text-align: left;

      .dialog-content,
      .dialog-actions {
        padding: 24px;
      }

      .dialog-actions {
        text-align: right;
      }
    }

    &.scrollable {
      min-height: 510px;

      .dialog-content {
        position: absolute;
        top: 35px;
        width: 100%;
        bottom: 80px;
        max-height: 400px;
        overflow-y: auto;
        overflow-x: hidden;
      }

      .dialog-actions {
        position: absolute;
        right: 5px;
        bottom: 0;
      }
    }

    .dialog-title {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      padding: 12px 24px;
      height: 35px;
      font-size: 1.2em;
      font-weight: 600;
      line-height: 1;
      color: #000000;
      border-bottom: 1px solid rgba(#000000, 0.1);
      user-select: none;

      .dialog-close {
        color: #000000;
        cursor: pointer;
      }
    }

    .dialog-alert {
      .selected {
        padding: 16px 24px;
        font-size: 1.2em;
        color: rgba(#000000, 0.6);
        line-height: 1;
        width: 100%;
        height: 40px;
        background: #f5f5f5;
        user-select: none;
      }
    }

    .dialog-content {
      .delete-icon {
        margin-bottom: 24px;
        font-size: 4.8em;
        color: rgba(#000000, 0.3);
      }

      .dialog-row {
        display: flex;
        flex-direction: row;
        align-items: center;
      }

      .dialog-text {
        font-size: 1.8em;
        font-weight: 500;
        line-height: 1.3;
        color: #000000;
      }

      .dialog-subtext {
        margin-top: 16px;
        font-size: 1.2em;
        font-weight: 500;
        color: rgba(#000000, 0.6);
      }
    }

    .dialog-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;

      .dialog-actions-message {
        min-height: 20px;
        font-size: 1.2em;

        &__error {
          color: #ff0000;
        }
      }

      .v-btn {
        min-width: 85px;

        &:not(:first-child) {
          margin-left: 8px;
        }
      }
    }
  }
}
</style>
