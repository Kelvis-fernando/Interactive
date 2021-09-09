<template>
  <v-menu
    ref="menu"
    v-model="menu"
    content-class="menu-time-picker"
    offset-y
    :close-on-content-click="false"
    :min-width="120"
    :max-width="width"
    v-bind="$attrs"
  >
    <template #activator="{ on }">
      <v-text-field
        :placeholder="useSeconds ? 'HH:MM:SS' : 'HH:MM'"
        class="input-date-picker"
        color="rgba(0,0,0,0.9)"
        solo
        outlined
        dense
        hide-details
        readonly
        autocomplete="off"
        :disabled="disabled"
        :value="timeToShow()"
        :style="`width: ${width}px`"
        v-on="on"
      >
        <template #append>
          <div class="open-datepicker" v-on="on">
            <v-icon>hi-clock</v-icon>
          </div>
        </template>
      </v-text-field>
    </template>

    <div class="time-picker">
      <div id="hours" class="hours" :style="`width: ${compWidth}px`">
        <div
          v-for="hour in getHours"
          :key="hour"
          :class="[
            'item',
            inputHour == hour && 'active-hour',
            !isAllowedHour(hour) && 'disabled',
          ]"
          @click="isAllowedHour(hour) ? setHour(hour) : null"
        >
          {{ showHour(hour) }}
        </div>
      </div>
      <div id="minutes" class="minutes" :style="`width: ${compWidth}px`">
        <div
          v-for="minute in createRange(60)"
          :key="minute"
          :class="[
            'item',
            inputMinute == minute && 'active-minute',
            !isAllowedMinute(minute) && 'disabled',
          ]"
          @click="isAllowedMinute(minute) ? setMinute(minute) : null"
        >
          {{ pad(minute) }}
        </div>
      </div>
      <div
        v-if="useSeconds"
        id="seconds"
        class="seconds"
        :style="`width: ${compWidth}px;`"
      >
        <div
          v-for="second in createRange(60)"
          :key="second"
          :class="[
            'item',
            inputSecond == second && 'active-second',
            !isAllowedSecond(second) && 'disabled',
          ]"
          @click="isAllowedSecond(second) ? setSecond(second) : null"
        >
          {{ pad(second) }}
        </div>
      </div>
      <div v-if="isAmPm" class="am-pm" :style="`width: ${compWidth}px`">
        <div :class="['am', am && 'active']" @click="am = true">AM</div>
        <div :class="['pm', !am && 'active']" @click="am = false">PM</div>
      </div>
    </div>
  </v-menu>
</template>

<script lang="ts">
import { Component, Vue, Prop, VModel, Watch } from 'vue-property-decorator';
import { toDate } from 'date-fns-tz';

type Values = {
  value: number;
  disabled: boolean;
};

@Component
export default class TimePicker extends Vue {
  @Prop({ type: Array, default: () => [] })
  private allowedHours!: number[];

  @Prop({ type: Array, default: () => [] })
  private allowedMinutes!: number[];

  @Prop({ type: Array, default: () => [] })
  private allowedSeconds!: number[];

  @Prop({ type: Boolean, default: false })
  private disabled!: boolean;

  @Prop({
    type: String,
    default: 'ampm',
    validator: v => ['ampm', '24hr'].indexOf(v) !== 1,
  })
  private format!: string;

  @Prop({ type: Boolean, default: false })
  private isToday!: boolean;

  @Prop({ type: String, default: '00:00:00' })
  private min!: string;

  @Prop({ type: String, default: '23:59:59' })
  private max!: string;

  @Prop({ type: Boolean, default: false })
  private useSeconds!: boolean;

  @Prop({ type: [Number], default: 180 })
  private width!: number;

  @VModel({ type: String }) name!: string;

  private menu = false;
  private am = true;

  private inputHour: number | null = null;
  private inputMinute: number | null = null;
  private inputSecond: number | null = null;

  private hours: Values[] = [];
  private minutes: Values[] = [];
  private seconds: Values[] = [];

  private isAllowedHourCb: null | ((v: number) => boolean) = null;
  private isAllowedMinuteCb: null | ((v: number) => boolean) = null;
  private isAllowedSecondCb: null | ((v: number) => boolean) = null;

  get compWidth(): number {
    return this.useSeconds ? this.width / 4 : this.width / 3;
  }

  get getMax(): string {
    return this.max ? this.max : '23:59:59';
  }

  get getMin(): string {
    return this.isToday
      ? `${new Date().getHours()}:${new Date().getMinutes()}`
      : this.min
      ? this.min
      : '00:00:00';
  }

  get getHours(): number[] {
    return this.isAmPm
      ? (this.inputHour && this.inputHour < 12) || this.am
        ? this.createRange(12)
        : this.createRange(12).map(v => v + 12)
      : this.createRange(24);
  }

  get isAllowedHour(): (v: number) => boolean {
    let cb: ((v: number) => boolean) | null = null;

    if (this.allowedHours instanceof Array) {
      cb = val => this.allowedHours.includes(val);
    } else {
      cb = this.allowedHours;
    }

    if (!this.min && !this.max) return cb;

    const minHour = Number(this.getMin.split(':')[0]);
    const maxHour = Number(this.getMax.split(':')[0]);

    return (val: number) => {
      return val >= minHour * 1 && val <= maxHour * 1 && (!cb || cb(val));
    };
  }

  get isAllowedMinute(): (v: number) => boolean {
    let cb: ((v: number) => boolean) | null = null;

    const isHourAllowed =
      !this.isAllowedHourCb ||
      this.inputHour === null ||
      this.isAllowedHourCb(this.inputHour);

    if (this.allowedMinutes instanceof Array) {
      cb = val => this.allowedMinutes.includes(val);
    } else {
      cb = this.allowedMinutes;
    }

    if (!this.min && !this.max) {
      return isHourAllowed ? cb : () => false;
    }

    const [minHour, minMinute] = this.getMin.split(':').map(Number);
    const [maxHour, maxMinute] = this.getMax.split(':').map(Number);

    const minTime = minHour * 60 + minMinute * 1;
    const maxTime = maxHour * 60 + maxMinute * 1;

    return val => {
      const time = 60 * (this.inputHour || 0) + val;

      return (
        time >= minTime && time <= maxTime && isHourAllowed && (!cb || cb(val))
      );
    };
  }

  isAllowedSecond(): (v: number) => boolean {
    let cb: ((v: number) => boolean) | null = null;

    const isHourAllowed =
      !this.isAllowedHourCb ||
      this.inputHour === null ||
      this.isAllowedHourCb(this.inputHour);

    const isMinuteAllowed =
      isHourAllowed &&
      (!this.isAllowedMinuteCb ||
        this.inputMinute === null ||
        this.isAllowedMinuteCb(this.inputMinute));

    if (this.allowedSeconds instanceof Array) {
      cb = val => this.allowedSeconds.includes(val);
    } else {
      cb = this.allowedSeconds;
    }

    if (!this.min && !this.max) {
      return isMinuteAllowed ? cb : () => false;
    }

    const [minHour, minMinute, minSecond] = this.getMin.split(':').map(Number);
    const [maxHour, maxMinute, maxSecond] = this.getMax.split(':').map(Number);
    const minTime = minHour * 3600 + minMinute * 60 + (minSecond || 0) * 1;
    const maxTime = maxHour * 3600 + maxMinute * 60 + (maxSecond || 0) * 1;

    return val => {
      const time =
        3600 * (this.inputHour || 0) + 60 * (this.inputMinute || 0) + val;
      return (
        time >= minTime &&
        time <= maxTime &&
        isMinuteAllowed &&
        (!cb || cb(val))
      );
    };
  }

  get isAmPm(): boolean {
    return this.format === 'ampm';
  }

  @Watch('am')
  onAmChange(): void {
    this.isAmPm && this.changePeriod();
  }

  @Watch('inputHour')
  onInputHourChange(): void {
    this.valuesToCenter('hour');
  }

  @Watch('inputMinute')
  onInputMinuteChange(): void {
    this.valuesToCenter('minute');
  }

  @Watch('inputSecond')
  onInputSecondChange(): void {
    this.useSeconds && this.valuesToCenter('second');
  }

  @Watch('isToday')
  onIsTodayChange(value: boolean): void {
    if (value && this.name) this.name = this.getMin;
  }

  @Watch('menu')
  onOpenChange(open: boolean): void {
    if (open) {
      this.valuesToCenter('hour');
      this.valuesToCenter('minute');
      if (this.useSeconds) this.valuesToCenter('second');
    }
  }

  @Watch('value')
  onValueChange(val: string): void {
    this.setInputData(val);
  }

  mounted(): void {
    this.setInputData(this.name);
  }

  changePeriod(): void {
    if (this.inputHour !== null) {
      this.inputHour = this.inputHour + (this.am ? -12 : 12);
      this.inputHour = this.firstAllowed('hour', this.inputHour);
      this.inputMinute = this.firstAllowed('minute', this.inputMinute);
      this.emitValue();
    }
  }

  convert24to12(hour: number | null): number {
    return hour ? ((hour - 1) % 12) + 1 : 12;
  }

  convert12to24(hour: number | null, am = false): number {
    return ((hour || 0) % 12) + (!am ? 12 : 0);
  }

  createRange(length: number): number[] {
    return Array.from({ length }, (v, k) => k);
  }

  emitValue(): void {
    const value = this.genValue();
    if (value !== null) this.$emit('input', value);
  }

  firstAllowed(
    type: 'hour' | 'minute' | 'second',
    value: number | null = 0,
  ): number {
    const allowedFn = {
      hour: this.isAllowedHour,
      minute: this.isAllowedMinute,
      second: this.isAllowedSecond,
    };

    const range = type === 'hour' ? this.getHours : this.createRange(60);
    const first = range.find(v => {
      return allowedFn[type](((v + (value || 0)) % range.length) + range[0]);
    });
    return (((first || 0) + (value || 0)) % range.length) + range[0];
  }

  genValue(): string | void {
    if (
      this.inputHour !== null &&
      this.inputMinute !== null &&
      (!this.useSeconds || this.inputSecond !== null)
    ) {
      return (
        `${this.pad(this.inputHour)}:${this.pad(this.inputMinute)}` +
        (this.useSeconds ? `:${this.pad(this.inputSecond)}` : '')
      );
    }

    return;
  }

  pad(value: number | null, length = 2): string {
    return parseInt((value || 0).toString()).toLocaleString(undefined, {
      minimumIntegerDigits: length,
    });
  }

  prepareMinutes(): void {
    this.minutes = [];

    for (let i = 0; i < 60; i += 1) {
      this.minutes.push({
        value: i,
        disabled: !this.isAllowedMinute(i),
      });
    }
  }

  prepareSeconds(): void {
    this.seconds = [];

    for (let i = 0; i < 60; i += 1) {
      this.seconds.push({
        value: i,
        disabled: false,
      });
    }
  }

  setHour(hour: number): void {
    this.inputHour = hour;
    this.inputMinute = this.firstAllowed('minute', this.inputMinute);
    this.prepareMinutes();
    this.valuesToCenter('hour');
    this.emitValue();
  }

  setMinute(minute: number): void {
    this.inputMinute = minute;
    this.valuesToCenter('minute');
    this.emitValue();
    if (!this.useSeconds) this.menu = false;
  }

  setSecond(second: number): void {
    this.inputSecond = second;
    this.menu = false;
    this.valuesToCenter('second');
    this.emitValue();
  }

  setInputData(value: string): void {
    if (value === null || value === '') {
      this.inputHour = null;
      this.inputMinute = null;
      this.inputSecond = null;
      this.am = true;
      return;
    }

    const [, hour, minute, , second, period] =
      value
        .trim()
        .toLowerCase()
        .match(/^(\d+):(\d+)(:(\d+))?([ap]m)?$/) || new Array(6);

    this.inputHour = period
      ? this.convert12to24(parseInt(hour, 10), this.am)
      : parseInt(hour, 10);
    this.inputMinute = parseInt(minute, 10);
    this.inputSecond = parseInt(second || 0, 10);

    this.am =
      (this.inputHour && this.inputHour < 12) || toDate(value).getHours() < 12;
  }

  showHour(val: number): string {
    const hour = this.isAmPm
      ? this.pad(this.convert24to12(val))
      : this.pad(val);
    return hour;
  }

  timeToShow(): string {
    if (!this.name) return '';
    let time = this.pad(this.inputHour);
    if (this.isAmPm) time = this.pad(this.convert24to12(this.inputHour));
    time += `:${this.pad(this.inputMinute || 0)}`;
    if (this.useSeconds) time += `:${this.pad(this.inputSecond)}`;
    if (this.isAmPm) time += ` ${this.am ? 'AM' : 'PM'}`;
    return time;
  }

  valuesToCenter(type: string): void {
    const box = document.getElementById(`${type}s`);

    setTimeout(() => {
      const active = document.querySelector(`.active-${type}`) as HTMLElement;

      if (active && box)
        box.scrollTop = active.offsetTop - (box.offsetHeight - 120);
    }, 100);
  }
}
</script>

<style lang="scss">
.time-picker {
  display: flex;
  background-color: #ffffff;

  .hours,
  .minutes,
  .seconds {
    overflow-y: auto;
    max-height: 120px;
  }

  .item {
    text-align: center;
    padding: 4px 12px;
    height: 30px;
    font-size: 1.4em;
    color: rgba(#000000, 0.87);
    transition: background-color 0.2s;
    user-select: none;
    cursor: pointer;

    &:hover {
      background-color: rgba(#000000, 0.1);
    }

    &.disabled {
      opacity: 0.25;
      cursor: default;
    }

    &.active-hour,
    &.active-minute,
    &.active-second {
      color: #ffffff;
      background-color: rgba(#000000, 0.8);

      &:hover {
        background-color: #000000;
      }
    }
  }

  .am,
  .pm {
    text-align: center;
    padding: 4px 12px;
    height: 30px;
    font-size: 1.4em;
    color: rgba(#000000, 0.4);
    cursor: pointer;

    &.active {
      color: rgba(#000000, 0.8);
      cursor: default;
    }
  }
}
</style>
