<template>
  <div ref="item" class="grid-layout" :style="mergedStyle">
    <slot />

    <h-grid-item
      v-show="isDragging"
      class="grid-placeholder"
      :x="placeholder.x"
      :y="placeholder.y"
      :w="placeholder.w"
      :h="placeholder.h"
      :i="placeholder.i"
    />
  </div>
</template>

<script lang="ts">
import { PropType } from 'vue';
import {
  Component,
  Vue,
  Provide,
  Ref,
  Prop,
  Watch,
} from 'vue-property-decorator';

import elementResizeDetectorMaker from 'element-resize-detector';

import { emitter } from '@/plugins/events';
import {
  compact,
  moveElement,
  validateLayout,
  getAllCollisions,
} from '@/utils/grid-utils';

import type { Layout, LayoutItem } from '@/utils/grid-utils';

@Component
export default class GridLayout extends Vue {
  @Provide('layout') layoutProvided = this;

  @Ref() readonly item!: HTMLDivElement;

  @Prop({ type: Number, default: 12 })
  colNum!: number;

  @Prop({ type: Number, default: 150 })
  rowHeight!: number;

  @Prop({ type: Number, default: Infinity })
  maxRows!: number;

  @Prop({ type: Array, default: () => [10, 10] })
  margin!: number[];

  @Prop({ type: Boolean, default: true })
  isDraggable!: boolean;

  @Prop({ type: Boolean, default: true })
  isResizable!: boolean;

  @Prop({ type: Boolean, default: true })
  private verticalCompact!: boolean;

  @Prop({ type: Array as PropType<Layout>, default: () => [] })
  private layout!: Layout;

  @Prop({ type: Boolean, default: false })
  private preventCollision!: boolean;

  width: number | null = null;
  private mergedStyle = {};
  private lastLayoutLength = 0;
  private isDragging = false;
  private placeholder = {
    x: 0,
    y: 0,
    w: 0,
    h: 0,
    i: -1,
  };
  private layouts = {};
  private originalLayout: Layout | null = null;
  private erd: elementResizeDetectorMaker.Erd | null = null;

  @Watch('width')
  onWidthChange(newval: number, oldval: number): void {
    this.$nextTick(function () {
      //this.$broadcast("updateWidth", this.width);
      this.$emit('update-width', this.width);
      emitter.emit('updateWidth', this.width);

      if (oldval === null) {
        this.$nextTick(() => {
          this.$emit('layout-ready', this.layout);
        });
      }
      this.updateHeight();
    });
  }

  @Watch('layout')
  onLayoutChange(val: Layout): void {
    if (val.length > 0) this.layoutUpdate();
  }

  @Watch('colNum')
  onColNumChange(val: number): void {
    emitter.emit('setColNum', val);
  }

  @Watch('rowHeight')
  onRowHeightChange(): void {
    emitter.emit('setRowHeight', this.rowHeight);
  }

  @Watch('isDraggable')
  onIsDraggableChange(): void {
    emitter.emit('setDraggable', this.isDraggable);
  }

  @Watch('isResizable')
  onIsResizableChange(): void {
    emitter.emit('setResizable', this.isResizable);
  }

  @Watch('maxRows')
  onMaxRowsChange(): void {
    emitter.emit('setMaxRows', this.maxRows);
  }

  @Watch('margin')
  onMarginChange(): void {
    this.updateHeight();
  }

  created(): void {
    // emitter.on('resizeEvent', this.resizeEvent);
    // emitter.on('dragEvent', this.dragEvent);
    this.$emit('layout-created', this.layout);
  }

  beforeDestroy(): void {
    //Remove listeners
    // emitter.off('resizeEvent', this.resizeEvent);
    // emitter.off('dragEvent', this.dragEvent);

    window.removeEventListener('resize', this.onWindowResize);
    if (this.erd) this.erd.uninstall(this.item);
  }

  mounted(): void {
    this.$emit('layout-mounted', this.layout);
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;

    this.$nextTick(() => {
      validateLayout(this.layout);
      this.originalLayout = this.layout;

      this.$nextTick(function () {
        this.onWindowResize();
        // self.width = self.$el.offsetWidth;
        window.addEventListener('resize', this.onWindowResize);

        compact(this.layout, this.verticalCompact);
        this.updateHeight();
        self.$nextTick(function () {
          self.erd = elementResizeDetectorMaker({
            strategy: 'scroll', //<- For ultra performance.
            callOnAdd: false,
          });

          self.erd.listenTo(self.item, function () {
            self.onWindowResize();
          });
        });
      });
    });
  }

  layoutUpdate(): void {
    if (this.layout !== undefined && this.originalLayout !== null) {
      if (this.layout.length !== this.originalLayout.length) {
        // console.log("### LAYOUT UPDATE!", this.layout.length, this.originalLayout.length);
        const diff = this.findDifference(this.layout, this.originalLayout);
        if (diff.length > 0) {
          // console.log(diff);
          if (this.layout.length > this.originalLayout.length) {
            this.originalLayout = this.originalLayout.concat(diff);
          } else {
            this.originalLayout = this.originalLayout.filter(obj => {
              return !diff.some(obj2 => obj.i === obj2.i);
            });
          }
        }

        this.lastLayoutLength = this.layout.length;
      }

      compact(this.layout, this.verticalCompact);
      this.$emit('update-width', this.width);
      emitter.emit('updateWidth', this.width);
      this.updateHeight();
      this.$emit('layout-updated', this.layout);
    }
  }

  updateHeight(): void {
    this.mergedStyle = {
      height: this.containerHeight(),
    };
  }

  onWindowResize(): void {
    if (this.item !== null && this.item !== undefined) {
      this.width = this.item.offsetWidth;
    }

    emitter.emit('resizeEvent');
  }

  containerHeight(): string {
    const bottom = this.layout.reduce((acc, item) => {
      if (item.y + item.h > acc) acc = item.y + item.h;
      return acc;
    }, 0);

    return bottom * (this.rowHeight + this.margin[1]) + this.margin[1] + 'px';
  }

  dragEvent(
    eventName: string,
    id: number,
    x: number,
    y: number,
    h: number,
    w: number,
  ): void {
    let item = this.layout[id];
    if (!item) item = { x: 0, y: 0 } as LayoutItem;

    if (eventName === 'dragmove' || eventName === 'dragstart') {
      this.placeholder.i = id;
      this.placeholder.x = item.x;
      this.placeholder.y = item.y;
      this.placeholder.w = w;
      this.placeholder.h = h;
      this.isDragging = true;
      this.$emit('update-width', this.width);
      emitter.emit('updateWidth', this.width);
    } else {
      this.isDragging = false;
    }
    // Move the element to the dragged location.
    this.$emit(
      'update:layout',
      moveElement(this.layout, item, x, y, true, this.preventCollision),
    );

    compact(this.layout, this.verticalCompact);
    emitter.emit('compact');

    this.updateHeight();
    if (eventName === 'dragend') {
      this.$emit('dragend', this.layout);
      this.$emit('layout-updated', this.layout);
    }
  }

  resizeEvent(
    eventName: string,
    id: number,
    x: number,
    y: number,
    h: number,
    w: number,
  ): void {
    let item = this.layout[id];
    if (!item) item = { h: 0, w: 0 } as LayoutItem;

    let hasCollisions;
    if (this.preventCollision) {
      const collisions = getAllCollisions(this.layout, {
        ...item,
        w,
        h,
      }).filter(layoutItem => layoutItem.i !== item.i);
      hasCollisions = collisions.length > 0;
      // If we're colliding, we need adjust the placeholder.
      if (hasCollisions) {
        // adjust w && h to maximum allowed space
        let leastX = Infinity,
          leastY = Infinity;
        collisions.forEach(layoutItem => {
          if (layoutItem.x > item.x) leastX = Math.min(leastX, layoutItem.x);
          if (layoutItem.y > item.y) leastY = Math.min(leastY, layoutItem.y);
        });
        if (Number.isFinite(leastX)) item.w = leastX - item.x;
        if (Number.isFinite(leastY)) item.h = leastY - item.y;
      }
    }

    if (!hasCollisions) {
      // Set new width and height.
      item.w = w;
      item.h = h;
    }

    if (eventName === 'resizestart' || eventName === 'resizemove') {
      this.placeholder.i = id;
      this.placeholder.x = x;
      this.placeholder.y = y;
      this.placeholder.w = item.w;
      this.placeholder.h = item.h;
      this.isDragging = true;
      this.$emit('update-width', this.width);
      emitter.emit('updateWidth', this.width);
    } else {
      this.isDragging = false;
    }

    compact(this.layout, this.verticalCompact);
    emitter.emit('compact');

    this.updateHeight();
    if (eventName === 'resizeend') {
      this.$emit('resizeend', this.layout);
      this.$emit('layout-updated', this.layout);
    }
  }

  // find difference in layouts
  findDifference(layout: Layout, originalLayout: Layout): Layout {
    //Find values that are in result1 but not in result2
    const uniqueResultOne = layout.filter(obj => {
      return !originalLayout.some(obj2 => obj.i === obj2.i);
    });

    //Find values that are in result2 but not in result1
    const uniqueResultTwo = originalLayout.filter(obj => {
      return !layout.some(obj2 => obj.i === obj2.i);
    });

    //Combine the two arrays of unique entries#
    return uniqueResultOne.concat(uniqueResultTwo);
  }
}
</script>

<style lang="scss">
.grid-layout {
  position: relative;
  transition: height 200ms ease;
}
</style>
