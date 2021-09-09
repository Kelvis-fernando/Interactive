<template>
  <div :class="['header-box-tabs', fullWidth && 'full-width']">
    <div class="tabs">
      <div
        v-for="(tab, key) in tabs"
        :id="`box-tab-${key + 1}`"
        :key="key + 1"
        :class="[
          'tab',
          `tab-${key + 1}`,
          `${key + 1 === active ? 'active' : ''}`,
        ]"
        @click="toggleTabs(key + 1)"
      >
        <v-icon v-if="tab.icon" class="tab-icon">{{ tab.icon }}</v-icon>
        <div class="tab-text">{{ tab.text }}</div>
      </div>

      <div
        class="tab-slider"
        :style="`width: ${sliderWidth}px;left: ${sliderLeft}px`"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import { PropType } from 'vue';

export type Tab = {
  icon?: string;
  text: string;
};

@Component
export default class BoxTabs extends Vue {
  @Prop({ type: Number, default: 1 })
  private active!: number;

  @Prop({ type: Boolean, default: true })
  private fullWidth!: boolean;

  @Prop({ type: Array as PropType<Tab[]>, default: (): Tab[] => [] })
  private tabs!: Tab[];

  private sliderWidth = 0;
  private sliderLeft = 0;

  @Watch('active')
  onActiveSet(active: number): void {
    this.toggleTabs(active);
  }

  mounted(): void {
    this.toggleTabs(this.active);
  }

  toggleTabs(index: number): void {
    if (this.active !== index) this.$emit('tab', index);
    setTimeout(() => {
      const tab = document.getElementById(`box-tab-${index}`);
      if (tab) {
        this.sliderWidth = tab.offsetWidth;
        this.sliderLeft = tab.offsetLeft;
        // this.sliderWidth = this.$refs[index][0].offsetWidth;
        // this.sliderLeft = this.$refs[index][0].offsetLeft;
      }
    }, 150);
  }
}
</script>

<style lang="scss">
.header-box-tabs {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  height: 38px;
  padding: 0 40px;
  transition-duration: 0.2s;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform;
  transition-property: transform, width;

  &.full-width {
    width: 100%;
  }

  .tabs {
    position: relative;
    display: flex;
    flex-direction: row;
    width: 100%;
    height: 100%;
    overflow-x: auto;

    &::-webkit-scrollbar {
      height: 3px !important;
    }

    .tab {
      display: flex;
      flex-direction: row;
      padding: 12px 14px;
      height: 100%;
      font-size: 1em;
      letter-spacing: 0.5px;
      color: rgba(#000000, 0.6);
      cursor: pointer;
      user-select: none;

      &.active {
        .tab-icon,
        .tab-text {
          color: #000000;
        }
      }

      .tab-icon {
        margin-right: 8px;
        font-size: 1.6em;
        pointer-events: none;
      }

      .tab-text {
        font-size: 1.2em;
        white-space: nowrap;
        pointer-events: none;
      }
    }

    .tab-slider {
      position: absolute;
      bottom: 0px;
      height: 2px;
      background: #fa4600;
      z-index: 1;
      transition: 0.25s cubic-bezier(0.25, 0.8, 0.5, 1);
    }
  }
}
</style>
