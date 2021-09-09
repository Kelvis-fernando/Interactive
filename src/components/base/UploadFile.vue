<template>
  <div class="upload-file">
    <div
      v-cloak
      class="drag-file"
      :style="`${showWidth}${showHeight}`"
      @drop.prevent="newFile($event.dataTransfer.files)"
      @dragover.prevent
    >
      <v-icon color="#0000004D">hi-upload-file</v-icon>
      <div class="drag-title">
        {{ $t('files.dragTitle') }}
      </div>
      <div class="drag-subtitle">
        <i18n path="files.dragSubtitle">
          <template #click>
            <strong style="color: #fa4614">
              {{ $t('default.clickHere') }}
            </strong>
          </template>
        </i18n>
      </div>

      <input
        ref="inputFile"
        type="file"
        class="inputFile"
        :accept="formats"
        @input="newFile($event.target.files)"
      />
    </div>

    <div v-if="file !== null && !hideDetails" class="box-file">
      <div class="file-area">
        <div class="file">
          <v-icon>hi-file-blank</v-icon>

          <div class="file-details">
            <div
              class="file-name"
              :style="!width ? 'width: 400px' : `width: ${width - 80}px`"
            >
              {{ file.name }}
            </div>
            <div class="file-size">{{ fileSize(file.size) }}</div>
          </div>
        </div>

        <v-btn color="gray" text icon :ripple="false" @click="removeFile">
          <v-icon>hi-close</v-icon>
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { PropType } from 'vue';
import { Component, Vue, Ref, Prop, Emit } from 'vue-property-decorator';

import { calcFileSize } from '@/utils/helpers';

@Component
export default class UploadFile extends Vue {
  @Ref('inputFile') private inputFile!: HTMLInputElement;

  @Prop({ type: Array as PropType<string[]>, default: () => [] })
  private formats!: string[];

  @Prop({ type: Number })
  private width!: number;

  @Prop({ type: Number, default: 284 })
  private height!: number;

  @Prop({ type: Boolean, default: false })
  private hideDetails!: boolean;

  @Emit()
  newFile(files: FileList): void {
    this.file = files[0];
  }

  @Emit()
  removeFile(): void {
    this.file = null;
  }

  private file: File | null = null;

  get showWidth(): string {
    return this.width ? `width: ${this.width - 80}px;` : `width: 100%;`;
  }

  get showHeight(): string {
    return this.file
      ? `height: ${this.height - 80}px;`
      : `height: ${this.height}px;`;
  }

  get fileSize(): typeof calcFileSize {
    return calcFileSize;
  }
}
</script>

<style lang="scss">
.upload-file {
  .drag-file {
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    border: 1.5px dashed rgba(#000000, 0.3);
    background: #fafafa;

    .inputFile {
      position: absolute;
      width: 100%;
      height: 100%;
      opacity: 0;
      cursor: pointer;
    }

    .hi-upload-file {
      font-size: 5.6em;
    }

    .drag-title {
      margin-top: 20px;
      color: rgba(#000000, 0.6);
      font-size: 1.6em;
      font-weight: 500;
    }

    .drag-subtitle {
      color: rgba(#000000, 0.3);
      font-size: 1.2em;
      font-weight: 500;
    }
  }

  .box-file {
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin-top: 20px;

    .file-area {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      min-height: 60px;
      background: #f5f5f5;

      .file {
        display: flex;

        i {
          font-size: 2.8em;
          margin: 16px;
          color: #000000;
        }

        .file-details {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: flex-start;

          .file-name,
          .file-size {
            font-size: 1.2em;
            font-weight: 500;
            color: rgba(#000000, 0.6);
          }

          .file-name {
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
          }

          .file-size {
            color: rgba(#000000, 0.3);
          }
        }
      }
      button {
        margin-right: 8px;
      }
    }
  }
}
</style>
