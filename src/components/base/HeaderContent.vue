<template>
  <div
    :class="[
      'box-header-content',
      height < 76 && 'fixed',
      !!alertMessage && 'has-alert',
    ]"
  >
    <div
      :class="['header-content', !$scopedSlots['boxes'] && 'box-shadow']"
      :style="`height: ${height}px; width: ${width}`"
    >
      <div class="box">
        <div class="box-path">
          <div class="path-from" :style="`opacity: ${opacity}`">
            {{ pathFrom }}
          </div>
          <div
            class="path-title"
            :class="{ loading: savingName }"
            :style="`font-size: ${fontSizeTitle / 10}em`"
          >
            <div v-if="editable && isEditing" class="path-editable">
              <v-text-field
                :autofocus="isEditing"
                class="path-title-editable"
                :value="pathTitle"
                hide-details
                autocomplete="off"
                @keyup="changeTitle($event.target.value)"
                @keypress.enter="$emit('save-path-title', $event.target.value)"
              />
            </div>
            <div
              v-else
              class="path-title-fixed"
              :style="editable ? 'max-width: 90%' : ''"
            >
              <div v-if="!pathTitle" style="height: 30px; width: 280px">
                <h-content-loader
                  :height="30"
                  :width="280"
                  :speed="2"
                  primary-color="#f0f0f0"
                  secondary-color="#cccccc"
                >
                  <rect x="0" y="0" rx="0" ry="0" width="280" height="30" />
                </h-content-loader>
              </div>
              <div v-else>{{ pathTitle }}</div>
            </div>
            <div
              v-if="editable"
              class="path-edit"
              :class="{ editing: editable && isEditing }"
            >
              <v-progress-circular
                v-if="savingName"
                indeterminate
                color="#000000"
                size="18"
                width="1"
              />
              <v-icon
                v-if="isEditing && !isForm"
                :style="`font-size: ${iconSize / 10}em`"
                @click="$emit('save-path-title', path)"
              >
                done
              </v-icon>
              <v-icon
                v-if="!isEditing && !isForm"
                :style="`font-size: ${iconSize / 10}em`"
                @click="editName"
              >
                hi-edit
              </v-icon>
            </div>
          </div>

          <div class="path-footer" :style="`opacity: ${opacity}`">
            <div v-if="pathFooter === ''" style="height: 15px; width: 120px">
              <h-content-loader
                :height="15"
                :width="120"
                :speed="2"
                primary-color="#f0f0f0"
                secondary-color="#cccccc"
              >
                <rect x="0" y="0" rx="0" ry="0" width="120" height="15" />
              </h-content-loader>
            </div>
            <div v-else>{{ pathFooter }}</div>
          </div>
        </div>
        <div class="box-extra">
          <slot name="box-extra" v-bind="{ opacity, fontSize }" />
        </div>
      </div>
      <div class="actions">
        <slot name="actions" />
      </div>
    </div>
    <div class="boxes" :style="`top: ${48 + height}px; width: ${width}`">
      <slot name="boxes" />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import { Getter } from 'vuex-class';

@Component
export default class HeaderContent extends Vue {
  @Prop({ type: Boolean, default: false })
  private editable!: boolean;

  @Prop({ type: Boolean, default: false })
  private isEditing!: boolean;

  @Prop({ type: Boolean, default: false })
  private isForm!: boolean;

  @Prop({ type: Boolean, default: false })
  private savingName!: boolean;

  @Prop({ type: String, default: '' })
  private pathFrom!: string;

  @Prop({ type: String, default: '' })
  private pathTitle!: string;

  @Prop({ type: String })
  private pathFooter!: string;

  private active = false;
  private height = 124;
  private width = '100%';
  private iconSize = 7;
  private fontSize = 16;
  private fontSizeTitle = 28;
  private opacity = 0.3;
  private currentScroll = 0;
  private path: string | null | undefined = null;

  get hasAlert(): boolean {
    return !!this.alertMessage;
  }

  @Getter('system/alert')
  private alertMessage!: string;

  @Watch('$vuetify.application.left')
  onLeftChange(left: number): void {
    this.width = `calc(100% - ${left}px)`;
  }

  @Watch('pathTitle')
  onPathTitleChange(title: string | undefined): void {
    this.path = title;
  }

  beforeMount(): void {
    window.addEventListener('scroll', this.onScroll);
    this.width = `calc(100% - ${this.$vuetify.application.left}px)`;
  }

  mounted(): void {
    this.path = this.pathTitle;
  }

  changeTitle(title: string): void {
    this.path = title;
    if (this.isForm) this.$emit('change-title', title);
  }

  editName(): void {
    this.path = this.pathTitle;
    this.$emit('edit-name');
  }

  onScroll(): void {
    this.currentScroll = window.scrollY;
    const min = 64;
    const max = 124;
    this.height = Math.max(min, max - this.currentScroll * 1);

    this.fontSizeTitle =
      (this.height / max) * 28 > 18 ? Math.round((this.height / max) * 28) : 18;
    this.fontSize =
      (this.height / max) * 16 > 14 ? Math.round((this.height / max) * 16) : 12;
    this.iconSize =
      (this.height / max) * 5 > 18 ? Math.round((this.height / max) * 5) : 7;
    this.opacity = (this.height / max) * 0.3;
  }
}
</script>

<style lang="scss">
.box-header-content {
  position: fixed;
  top: 48px;
  width: 100%;
  z-index: 4;
  transition-duration: 0.2s;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform;
  transition-property: transform, width;

  &.fixed {
    box-shadow: 4px 4px 6px 1px rgba(#000000, 0.1) !important;

    .header-content {
      padding: 10px 40px;

      .box-path {
        .path-from,
        .path-footer {
          display: none;
        }
      }

      .box-extra {
        display: flex;
        flex-direction: row;
        align-items: center;
        min-height: 30px;

        > div {
          display: flex;
          flex-direction: row;
          align-items: baseline;

          .label {
            margin-right: 10px;
            margin-bottom: 0 !important;
          }
        }
      }

      .box-default {
        display: flex;

        .default-label {
          margin-right: 5px;
          opacity: 0.4 !important;
        }
      }
    }
  }

  &.has-alert {
    top: 84px;
  }

  .header-content {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding: 0 40px;
    background: #fafafa;
    z-index: 4;
    transition-duration: 0.2s;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    will-change: transform;
    transition-property: transform, width;

    .box {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(20px, 100%));
      grid-column-gap: 20px;
      align-items: center;
      margin-right: 20px;

      .box-path {
        grid-column: 1;

        .path-from,
        .path-footer {
          font-weight: 500;
          color: #000000;
          text-overflow: ellipsis;
          white-space: nowrap;
          cursor: default;
        }

        .path-from {
          font-size: 1.2em;
        }

        .path-title {
          display: flex;
          align-items: baseline;
          font-weight: 500;
          color: #000000;
          cursor: default;

          &:not(.loading):hover {
            .path-edit {
              .hi-edit {
                opacity: 1;
              }
            }
          }

          .path-title-fixed {
            > div:last-child {
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }
          }

          .path-editable {
            .v-text-field {
              margin-top: 0;
              padding-top: 0;
              font-size: inherit !important;
            }
          }

          .path-edit {
            grid-column: 2;
            margin-left: 10px;

            .hi-edit {
              opacity: 0;
              transition: 0.3s;
            }

            &.editing {
              i {
                color: #000000;
              }
            }
          }
        }
      }

      .box-extra {
        grid-column: 2;
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(20px, 100%));
        grid-column-gap: 20px;

        .label,
        .value {
          color: #000000;
          line-height: 1;
          text-overflow: ellipsis;
          white-space: nowrap;
          cursor: default;
        }

        .label {
          margin-bottom: 8px;
          font-weight: 500;
        }

        .value {
          font-weight: 600;
        }
      }
    }

    .actions {
      display: flex;

      button:not(:first-child) {
        margin-left: 12px;
        min-width: 90px;
      }
    }
  }

  .boxes {
    z-index: 4;
    background: #fafafa;
    transition-duration: 0.2s;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    will-change: transform;
    transition-property: transform, width;
  }
}
</style>
