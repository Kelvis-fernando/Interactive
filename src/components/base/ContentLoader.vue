<template>
  <svg
    v-bind="$attrs"
    :viewBox="`0 0 ${width} ${height}`"
    version="1.1"
    :preserveAspectRatio="preserveAspectRatio"
    v-on="$listeners"
  >
    <rect
      :style="`fill: url(${baseUrl}#${idGradient})`"
      :clip-path="`url(${baseUrl}#${idClip})`"
      x="0"
      y="0"
      :width="width"
      :height="height"
    />

    <defs>
      <clipPath :id="idClip">
        <slot />

        <rect
          v-if="!$scopedSlots['default']"
          x="0"
          y="0"
          rx="5"
          ry="5"
          :width="width"
          :height="height"
        />
      </clipPath>

      <linearGradient :id="idGradient">
        <stop
          offset="0%"
          :stop-color="primaryColor"
          :stop-opacity="primaryOpacity"
        >
          <animate
            v-if="animate"
            attributeName="offset"
            values="-2; 1"
            :dur="`${speed}s`"
            repeatCount="indefinite"
          />
        </stop>

        <stop
          offset="50%"
          :stop-color="secondaryColor"
          :stop-opacity="secondaryOpacity"
        >
          <animate
            v-if="animate"
            attributeName="offset"
            values="-1.5; 1.5"
            :dur="`${speed}s`"
            repeatCount="indefinite"
          />
        </stop>

        <stop
          offset="100%"
          :stop-color="primaryColor"
          :stop-opacity="primaryOpacity"
        >
          <animate
            v-if="animate"
            attributeName="offset"
            values="-1; 2"
            :dur="`${speed}s`"
            repeatCount="indefinite"
          />
        </stop>
      </linearGradient>
    </defs>
  </svg>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';

@Component
export default class ContentLoader extends Vue {
  @Prop({ default: 400 })
  private width!: number | string;

  @Prop({ default: 130 })
  private height!: number | string;

  @Prop({ default: 2 })
  private speed!: number;

  @Prop({ default: 'xMidYMid meet' })
  private preserveAspectRatio!: string;

  @Prop({ default: '' })
  private baseUrl!: string;

  @Prop({ default: '#f9f9f9' })
  private primaryColor!: string;

  @Prop({ default: '#ecebeb' })
  private secondaryColor!: string;

  @Prop({ default: 1 })
  private primaryOpacity!: number;

  @Prop({ default: 1 })
  private secondaryOpacity!: number;

  @Prop()
  private uniqueKey!: string;

  @Prop({ default: true })
  private animate!: boolean;

  idClip = this.uniqueKey ? `${this.uniqueKey}-idClip` : this.uid();
  idGradient = this.uniqueKey ? `${this.uniqueKey}-idGradient` : this.uid();

  uid(): string {
    return Math.random().toString(36).substring(2);
  }
}
</script>
