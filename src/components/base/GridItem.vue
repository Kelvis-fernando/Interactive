<template>
  <div ref="item" class="grid-item" :class="classObj" :style="style">
    <slot />
    <span
      v-if="resizableAndNotStatic"
      ref="handle"
      class="grid-resizable-handle"
    />
  </div>
</template>

<script lang="ts">
import {
  Component,
  Vue,
  Ref,
  Prop,
  Watch,
  Inject,
} from 'vue-property-decorator';

// import '@interactjs/auto-start';
// import '@interactjs/actions/drag';
// import '@interactjs/actions/resize';
// import '@interactjs/modifiers';
// import '@interactjs/dev-tools';
import interact from 'interactjs';
import { Interactable, ResizableOptions } from '@interactjs/types';

import { emitter } from '@/plugins/events';
import {
  createCoreData,
  getControlPosition,
  Position,
  Size,
} from '@/utils/grid-utils';

import GridLayout from './GridLayout.vue';

type Style = {
  position: string;
  top: string;
  left: string;
  width: string;
  height: string;
};

@Component
export default class GridItem extends Vue {
  @Inject() layout!: GridLayout;

  @Ref() readonly item!: HTMLDivElement;

  @Prop({ type: Boolean })
  private isDraggable!: boolean;

  @Prop({ type: Boolean })
  private isResizable!: boolean;

  @Prop({ type: Boolean, default: false })
  private static!: boolean;

  @Prop({ type: Number, default: 1 })
  private minW!: number;

  @Prop({ type: Number, default: 1 })
  private minH!: number;

  @Prop({ type: Number, default: Infinity })
  private maxW!: number;

  @Prop({ type: Number, default: Infinity })
  private maxH!: number;

  @Prop({ type: Number, required: true })
  private x!: number;

  @Prop({ type: Number, required: true })
  private y!: number;

  @Prop({ type: Number, required: true })
  private w!: number;

  @Prop({ type: Number, required: true })
  private h!: number;

  @Prop({ type: Number, required: true })
  private i!: number;

  @Prop({ type: String, default: 'a, button' })
  private dragIgnoreFrom!: string;

  @Prop({ type: String })
  private dragAllowFrom!: string;

  @Prop({ type: String, default: 'a, button' })
  private resizeIgnoreFrom!: string;

  @Prop({ type: Boolean, default: false })
  private preserveAspectRatio!: boolean;

  private cols = 1;
  private containerWidth = 100;
  private rowHeight = 30;
  private margin = [10, 10];
  private maxRows = Infinity;
  private draggable = false;
  private resizable = false;
  private isDragging = false;
  private dragging: Position | null = null;
  private isResizing = false;
  private resizing: Size | null = null;
  private lastX = NaN;
  private lastY = NaN;
  private lastW = NaN;
  private lastH = NaN;
  private style = {} as Style;
  private dragEventSet = false;
  private resizeEventSet = false;
  private previousW: number | null = null;
  private previousH: number | null = null;
  private previousX: number | null = null;
  private previousY: number | null = null;
  private innerX = this.x;
  private innerY = this.y;
  private innerW = this.w;
  private innerH = this.h;
  private interactObj: Interactable | null = null;

  get classObj(): Record<string, any> {
    return {
      resizable: this.resizableAndNotStatic,
      static: this.static,
      resizing: this.isResizing,
      'draggable-dragging': this.isDragging,
      'disable-userselect': this.isDragging,
      'no-touch': this.isAndroid && this.draggableOrResizableAndNotStatic,
    };
  }

  get draggableAndNotStatic(): boolean {
    return this.draggable && !this.static;
  }

  get resizableAndNotStatic(): boolean {
    return this.resizable && !this.static;
  }

  get draggableOrResizableAndNotStatic(): boolean {
    return (this.draggable || this.resizable) && !this.static;
  }

  get isAndroid(): boolean {
    return navigator.userAgent.toLowerCase().indexOf('android') !== -1;
  }

  get resizableHandleClass(): string {
    return 'grid-resizable-handle';
  }

  @Watch('isDraggable')
  onIsDraggableChange(): void {
    this.draggable = this.isDraggable;
  }

  @Watch('static')
  onStaticChange(): void {
    this.tryMakeDraggable();
    this.tryMakeResizable();
  }

  @Watch('draggable')
  onDraggableChange(): void {
    this.tryMakeDraggable();
  }

  @Watch('isResizable')
  onIsResizableChange(): void {
    this.resizable = this.isResizable;
  }

  @Watch('resizable')
  onResizableChange(): void {
    this.tryMakeResizable();
  }

  @Watch('rowHeight')
  onRowHeightChange(): void {
    this.createStyle();
    this.emitContainerResized();
  }

  @Watch('cols')
  onColsChange(): void {
    this.tryMakeResizable();
    this.createStyle();
    this.emitContainerResized();
  }

  @Watch('containerWidth')
  onContainerWidthChange(): void {
    this.tryMakeResizable();
    this.createStyle();
    this.emitContainerResized();
  }

  @Watch('x')
  onXPropChange(newVal: number): void {
    this.innerX = newVal;
    this.createStyle();
  }

  @Watch('y')
  onYPropChange(newVal: number): void {
    this.innerY = newVal;
    this.createStyle();
  }

  @Watch('h')
  onHPropChange(newVal: number): void {
    this.innerH = newVal;
    this.createStyle();
  }

  @Watch('w')
  onWPropChange(newVal: number): void {
    this.innerW = newVal;
    this.createStyle();
  }

  @Watch('minH')
  onMinHChange(): void {
    this.tryMakeResizable();
  }

  @Watch('maxH')
  onMaxHChange(): void {
    this.tryMakeResizable();
  }

  @Watch('minW')
  onMinWChange(): void {
    this.tryMakeResizable();
  }

  @Watch('maxW')
  onMaxWChange(): void {
    this.tryMakeResizable();
  }

  @Watch('$parent.margin')
  onParentMarginChange(margin: number[]): void {
    if (
      !margin ||
      (margin[0] == this.margin[0] && margin[1] == this.margin[1])
    ) {
      return;
    }
    this.margin = margin.map(m => Number(m));
    this.createStyle();
    this.emitContainerResized();
  }

  created(): void {
    // emitter.on('updateWidth', this.updateWidth);
    // emitter.on('compact', this.createStyle);
    // emitter.on('setDraggable', this.setDraggableHandler);
    // emitter.on('setResizable', this.setResizableHandler);
    // emitter.on('setRowHeight', this.setRowHeightHandler);
    // emitter.on('setMaxRows', this.setMaxRowsHandler);
    // emitter.on('directionchange', this.directionchangeHandler);
    // emitter.on('setColNum', this.setColNum);
  }

  beforeDestroy(): void {
    //Remove listeners
    // emitter.off('updateWidth', this.updateWidth);
    // emitter.off('compact', this.createStyle);
    // emitter.off('setDraggable', this.setDraggableHandler);
    // emitter.off('setResizable', this.setResizableHandler);
    // emitter.off('setRowHeight', this.setRowHeightHandler);
    // emitter.off('setMaxRows', this.setMaxRowsHandler);
    // emitter.off('directionchange', this.directionchangeHandler);
    // emitter.off('setColNum', this.setColNum);
    if (this.interactObj) this.interactObj.unset(); // destroy interact intance
  }

  mounted(): void {
    this.cols = this.layout.colNum;

    this.rowHeight = this.layout.rowHeight;
    this.containerWidth = this.layout.width !== null ? this.layout.width : 100;
    this.margin =
      this.layout.margin !== undefined ? this.layout.margin : [10, 10];
    this.maxRows = this.layout.maxRows;

    this.draggable =
      this.isDraggable === null ? this.layout.isDraggable : this.isDraggable;

    this.resizable =
      this.isResizable === null ? this.layout.isResizable : this.isResizable;

    this.createStyle();
  }

  calcPosition(
    x: number,
    y: number,
    w: number,
    h: number,
  ): {
    left: number;
    top: number;
    width: number;
    height: number;
  } {
    const colWidth = this.calcColWidth();
    return {
      left: Math.round(colWidth * x + (x + 1) * this.margin[0]),
      top: Math.round(this.rowHeight * y + (y + 1) * this.margin[1]),
      // 0 * Infinity === NaN, which causes problems with resize constriants;
      // Fix this if it occurs.
      // Note we do it here rather than later because Math.round(Infinity) causes deopt
      width:
        w === Infinity
          ? w
          : Math.round(colWidth * w + Math.max(0, w - 1) * this.margin[0]),
      height:
        h === Infinity
          ? h
          : Math.round(
              this.rowHeight * h + Math.max(0, h - 1) * this.margin[1],
            ),
    };
  }

  calcXY(top: number, left: number): { x: number; y: number } {
    const colWidth = this.calcColWidth() + this.margin[0];
    const rowH = this.rowHeight + this.margin[1];
    const x = Math.round((left - this.margin[0]) / colWidth);
    const y = Math.round((top - this.margin[1]) / rowH);
    // Capping
    return {
      x: Math.max(Math.min(x, this.cols - this.innerW), 0),
      y: Math.max(Math.min(y, this.maxRows - this.innerH), 0),
    };
  }

  calcColWidth(): number {
    const colWidth =
      (this.containerWidth - this.margin[0] * (this.cols + 1)) / this.cols;
    return colWidth;
  }

  calcWH(height: number, width: number): { w: number; h: number } {
    const colWidth = this.calcColWidth() + this.margin[0];
    const rowH = this.rowHeight + this.margin[1];
    const w = Math.round((width + this.margin[0]) / colWidth);
    const h = Math.round((height + this.margin[1]) / rowH);
    // Capping
    return {
      w: Math.max(Math.min(w, this.cols - this.innerX), 0),
      h: Math.max(Math.min(h, this.maxRows - this.innerY), 0),
    };
  }

  createStyle(): void {
    if (this.x + this.w > this.cols) {
      this.innerX = 0;
      this.innerW = this.w > this.cols ? this.cols : this.w;
    } else {
      this.innerX = this.x;
      this.innerW = this.w;
    }
    let pos = this.calcPosition(
      this.innerX,
      this.innerY,
      this.innerW,
      this.innerH,
    );

    if (this.isDragging && this.dragging) {
      pos.top = this.dragging.top;
      pos.left = this.dragging.left;
    }

    if (this.isResizing && this.resizing) {
      pos.width = this.resizing.width;
      pos.height = this.resizing.height;
    }

    this.style = {
      position: 'absolute',
      top: pos.top + 'px',
      left: pos.left + 'px',
      width: pos.width + 'px',
      height: pos.height + 'px',
    };
  }

  emitContainerResized(): void {
    // this.style has width and height with trailing 'px'. The
    // resized event is without them
    let styleProps = {} as Style;
    const props: Array<'width' | 'height'> = ['width', 'height'];
    for (let prop of props) {
      let val = this.style[prop];

      let matches = val.match(/^(\d+)px$/);
      if (!matches) return;

      styleProps[prop] = matches[1];
    }

    this.$emit(
      'container-resized',
      this.i,
      this.h,
      this.w,
      styleProps.height,
      styleProps.width,
    );
  }

  handleDrag(event: any): void {
    if (this.static) return;
    if (this.isResizing) return;
    const position = getControlPosition(event);
    if (position === null) return;

    const { x, y } = position;
    const newPosition = { top: 0, left: 0 };

    switch (event.type) {
      case 'dragstart': {
        this.previousX = this.innerX;
        this.previousY = this.innerY;
        const parentRect = event.target.offsetParent.getBoundingClientRect();
        const clientRect = event.target.getBoundingClientRect();
        newPosition.left = clientRect.left - parentRect.left;
        newPosition.top = clientRect.top - parentRect.top;
        this.dragging = newPosition;
        this.isDragging = true;
        break;
      }

      case 'dragend': {
        if (!this.isDragging) return;
        const parentRect = event.target.offsetParent.getBoundingClientRect();
        const clientRect = event.target.getBoundingClientRect();
        newPosition.left = clientRect.left - parentRect.left;
        newPosition.top = clientRect.top - parentRect.top;
        this.dragging = null;
        this.isDragging = false;
        break;
      }

      case 'dragmove': {
        const coreEvent = createCoreData(this.lastX, this.lastY, x, y);
        newPosition.left =
          (this.dragging ? this.dragging.left : 0) + coreEvent.deltaX;
        newPosition.top =
          (this.dragging ? this.dragging.top : 0) + coreEvent.deltaY;
        this.dragging = newPosition;
        break;
      }
    }
    // Get new XY
    let pos;
    pos = this.calcXY(newPosition.top, newPosition.left);
    this.lastX = x;
    this.lastY = y;
    if (this.innerX !== pos.x || this.innerY !== pos.y) {
      this.$emit('move', this.i, pos.x, pos.y);
    }
    if (
      event.type === 'dragend' &&
      (this.previousX !== this.innerX || this.previousY !== this.innerY)
    ) {
      this.$emit('moved', this.i, pos.x, pos.y);
    }

    emitter.emit('dragEvent', {
      type: event.type,
      i: this.i,
      x: pos.x,
      y: pos.y,
      innerH: this.innerH,
      innerW: this.innerW,
    });
  }

  handleResize(event: any): void {
    if (this.static) return;
    const position = getControlPosition(event);
    // Get the current drag point from the event. This is used as the offset.
    if (position == null) return; // not possible but satisfies flow
    const { x, y } = position;
    const newSize = { width: 0, height: 0 };
    let pos;
    switch (event.type) {
      case 'resizestart': {
        this.previousW = this.innerW;
        this.previousH = this.innerH;
        pos = this.calcPosition(
          this.innerX,
          this.innerY,
          this.innerW,
          this.innerH,
        );
        newSize.width = pos.width;
        newSize.height = pos.height;
        this.resizing = newSize;
        this.isResizing = true;
        break;
      }
      case 'resizemove': {
        const coreEvent = createCoreData(this.lastW, this.lastH, x, y);
        newSize.width =
          (this.resizing ? this.resizing.width : 0) + coreEvent.deltaX;
        newSize.height =
          (this.resizing ? this.resizing.height : 0) + coreEvent.deltaY;
        this.resizing = newSize;
        break;
      }
      case 'resizeend': {
        pos = this.calcPosition(
          this.innerX,
          this.innerY,
          this.innerW,
          this.innerH,
        );
        newSize.width = pos.width;
        newSize.height = pos.height;
        this.resizing = null;
        this.isResizing = false;
        break;
      }
    }
    // Get new WH
    pos = this.calcWH(newSize.height, newSize.width);
    if (pos.w < this.minW) pos.w = this.minW;
    if (pos.w > this.maxW) pos.w = this.maxW;
    if (pos.h < this.minH) pos.h = this.minH;
    if (pos.h > this.maxH) pos.h = this.maxH;
    if (pos.h < 1) pos.h = 1;
    if (pos.w < 1) pos.w = 1;

    this.lastW = x;
    this.lastH = y;
    if (this.innerW !== pos.w || this.innerH !== pos.h) {
      this.$emit('resize', this.i, pos.h, pos.w, newSize.height, newSize.width);
    }
    if (
      event.type === 'resizeend' &&
      (this.previousW !== this.innerW || this.previousH !== this.innerH)
    ) {
      this.$emit(
        'resized',
        this.i,
        pos.h,
        pos.w,
        newSize.height,
        newSize.width,
      );
    }

    emitter.emit('resizeEvent', {
      type: event.type,
      i: this.i,
      innexX: this.innerX,
      innerY: this.innerY,
      h: pos.h,
      w: pos.w,
    });
  }

  tryMakeDraggable(): void {
    if (this.interactObj === null || this.interactObj === undefined) {
      this.interactObj = interact(this.item);
      this.interactObj.styleCursor(false);
    }
    if (this.draggableAndNotStatic) {
      const opts = {
        ignoreFrom: this.dragIgnoreFrom,
        allowFrom: this.dragAllowFrom,
      };
      this.interactObj.draggable(opts);
      if (!this.dragEventSet) {
        this.dragEventSet = true;
        this.interactObj.on('dragstart dragmove dragend', this.handleDrag);
      }
    } else {
      this.interactObj.draggable({
        enabled: false,
      });
    }
  }

  setDraggableHandler(isDraggable: boolean): void {
    if (this.isDraggable === null) this.draggable = isDraggable;
  }

  setResizableHandler(isResizable: boolean): void {
    if (this.isResizable === null) this.resizable = isResizable;
  }

  setRowHeightHandler(rowHeight: number): void {
    this.rowHeight = rowHeight;
  }

  setMaxRowsHandler(maxRows: number): void {
    this.maxRows = maxRows;
  }

  setColNum(colNum: string): void {
    this.cols = parseInt(colNum);
  }

  tryMakeResizable(): void {
    if (this.interactObj === null || this.interactObj === undefined) {
      this.interactObj = interact(this.item);
      this.interactObj.styleCursor(false);
    }
    if (this.resizable && !this.static) {
      let maximum = this.calcPosition(0, 0, this.maxW, this.maxH);
      let minimum = this.calcPosition(0, 0, this.minW, this.minH);

      const opts: ResizableOptions = {
        edges: {
          left: false,
          right: '.grid-resizable-handle',
          bottom: '.grid-resizable-handle',
          top: false,
        },
        ignoreFrom: this.resizeIgnoreFrom,
        // restrictSize: {
        //   min: {
        //     height: minimum.height,
        //     width: minimum.width,
        //   },
        //   max: {
        //     height: maximum.height,
        //     width: maximum.width,
        //   },
        // },
      };
      if (this.preserveAspectRatio) {
        opts.modifiers = [
          interact.modifiers.aspectRatio({
            ratio: 'preserve',
          }),
        ];
      }
      this.interactObj.resizable(opts);
      if (!this.resizeEventSet) {
        this.resizeEventSet = true;
        this.interactObj.on(
          'resizestart resizemove resizeend',
          this.handleResize,
        );
      }
    } else {
      this.interactObj.resizable({
        enabled: false,
      });
    }
  }

  updateWidth(width: number, colNum?: number | null): void {
    this.containerWidth = width;
    if (colNum !== undefined && colNum !== null) this.cols = colNum;
  }
}
</script>

<style lang="scss">
.grid-item {
  /* transition-duration: 0.2s;
  transition-timing-function: cubic-bezier(.4,0,.2,1);
  will-change: transform;
  transition-property: left, top, right, transform, width; */
  transition-property: left, top, right, height;
  transition: all 10ms ease;

  &.no-touch {
    touch-action: none;
  }

  &.resizing {
    opacity: 0.6;
    z-index: 3;
  }

  &.draggable-dragging {
    transition: none;
    z-index: 3;
  }

  &.grid-placeholder {
    background: #aaa;
    opacity: 0.2;
    transition-duration: 100ms;
    z-index: 2;
    user-select: none;
  }

  &.disable-userselect {
    user-select: none;
  }

  & > .grid-resizable-handle {
    position: absolute;
    width: 20px;
    height: 20px;
    bottom: 0;
    right: 0;
    background: url('data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBzdGFuZGFsb25lPSJubyI/Pg08IS0tIEdlbmVyYXRvcjogQWRvYmUgRmlyZXdvcmtzIENTNiwgRXhwb3J0IFNWRyBFeHRlbnNpb24gYnkgQWFyb24gQmVhbGwgKGh0dHA6Ly9maXJld29ya3MuYWJlYWxsLmNvbSkgLiBWZXJzaW9uOiAwLjYuMSAgLS0+DTwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+DTxzdmcgaWQ9IlVudGl0bGVkLVBhZ2UlMjAxIiB2aWV3Qm94PSIwIDAgNiA2IiBzdHlsZT0iYmFja2dyb3VuZC1jb2xvcjojZmZmZmZmMDAiIHZlcnNpb249IjEuMSINCXhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHhtbDpzcGFjZT0icHJlc2VydmUiDQl4PSIwcHgiIHk9IjBweCIgd2lkdGg9IjZweCIgaGVpZ2h0PSI2cHgiDT4NCTxnIG9wYWNpdHk9IjAuMzAyIj4NCQk8cGF0aCBkPSJNIDYgNiBMIDAgNiBMIDAgNC4yIEwgNCA0LjIgTCA0LjIgNC4yIEwgNC4yIDAgTCA2IDAgTCA2IDYgTCA2IDYgWiIgZmlsbD0iIzAwMDAwMCIvPg0JPC9nPg08L3N2Zz4=');
    background-position: bottom right;
    padding: 0 3px 3px 0;
    background-repeat: no-repeat;
    background-origin: content-box;
    box-sizing: border-box;
    cursor: se-resize;
  }
}
</style>
