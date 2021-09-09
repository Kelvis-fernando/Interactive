<template>
  <div
    ref="toast"
    class="toast"
    :style="`transform: translateX(${position}px)`"
  >
    <v-snackbar
      v-model="snackbar"
      v-bind="$attrs"
      :timeout="3000"
      style="padding-top: 0"
      v-on="$listeners"
    >
      <v-icon class="type" color="#ffffff">{{ icon }}</v-icon>
      <div class="text">
        {{ toast.text }}
      </div>

      <v-progress-linear
        class="timeout"
        color="#ffffff99"
        :value="progress"
        height="4"
      />
      <template #action>
        <v-icon color="#ffffff" @click="snackbar = false">hi-close</v-icon>
      </template>
    </v-snackbar>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';

import { emitter } from '@/plugins/events';

type Type = 'success' | 'info' | 'warn' | 'error';

export interface IToast {
  type: Type;
  text: string;
}

@Component
export default class Toast extends Vue {
  @Prop({ type: Object, required: true })
  private toast!: IToast;

  private snackbar = true;
  private interval?: number = undefined;
  private time?: number = undefined;
  private progress = 100;
  private position = 360;

  get icon(): string {
    const icons: Record<Type, string> = {
      success: 'check_circle_outline',
      info: 'error_outline',
      warn: 'warning',
      error: 'error',
    };

    return icons[this.toast.type];
  }

  @Watch('snackbar')
  onOpen(open: boolean): void {
    if (!open) {
      clearInterval(this.interval);
      clearTimeout(this.time);
      emitter.emit('remove-toast', this.$refs.toast);
    }
  }

  @Watch('toast.progress')
  onProgressChange(value: number): void {
    if (value === 100) {
      this.interval = window.setInterval(() => {
        this.progress -= 1.75;
      }, 50);
    }
  }

  beforeMount(): void {
    this.time = window.setTimeout(() => {
      this.position = 0;
    }, 100);
  }

  created(): void {
    this.interval = window.setInterval(() => {
      this.progress -= 1.75;
    }, 50);
  }
}
</script>

<style lang="scss">
.toast {
  margin: 5px 0;
  transition-duration: 0.3s;

  .v-snack:not(.v-snack--absolute) {
    position: relative;
    font-size: inherit;
    height: 100%;

    .v-snack__wrapper {
      min-width: 300px;
      max-width: 300px;

      .v-snack__content {
        display: flex;
        font-size: inherit;

        .type {
          font-size: 1.8em;
          margin-right: 10px;
        }

        .text {
          font-size: 1.2em;
          user-select: none;
          max-width: 270px;

          .progress {
            display: flex;
            align-items: center;
            margin-top: 5px;
            min-height: 20px;
            width: 100%;

            .message {
              opacity: 0.5;
            }
          }
        }

        .timeout {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
        }
      }
    }
  }
}
</style>
