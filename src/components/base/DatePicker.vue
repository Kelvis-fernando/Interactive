<template>
  <v-menu
    v-model="menu"
    :close-on-content-click="false"
    offset-y
    min-width="250"
    v-bind="normalisedProps($attrs['menu-props'])"
  >
    <template #activator="{ on }">
      <v-text-field
        h-mask="format"
        v-bind="normalisedProps($attrs['input-props'], inputProps)"
        class="input-date-picker"
        :placeholder="$t('date.placeholder')"
        color="rgba(0,0,0,0.9)"
        autocomplete="off"
        :value="toShow()"
        v-on="on"
        @change="onChange"
        @keydown="menu = false"
      >
        <template #append>
          <div class="open-datepicker" v-on="on">
            <v-icon>hi-calendar-today</v-icon>
          </div>
        </template>
      </v-text-field>
    </template>

    <v-date-picker
      v-bind="normalisedProps($attrs['date-props'])"
      :locale="locale.key"
      color="rgba(0,0,0,0.9)"
      no-title
      :value="model"
      @input="onInput"
    />
  </v-menu>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import { Getter } from 'vuex-class';
import { isValid, isBefore, isAfter, format } from 'date-fns';

import { getDateFormatted } from '@/utils/date';

import { ILanguage } from '@/store/modules/system';

@Component
export default class DatePicker extends Vue {
  @Prop({ type: String, default: '##/##/####' })
  private format!: string | null;

  @Prop({ type: [String, Date], default: '' })
  private value!: string | Date;

  @Prop({ type: [String, Number], default: '250' })
  private width!: string;

  private menu = false;
  private inputProps = {
    'hide-details': true,
    solo: true,
    outlined: true,
    dense: true,
  };

  @Getter('system/locale')
  private locale!: ILanguage;

  get max(): string | number {
    return (
      this.$attrs['date-props'] && JSON.parse(this.$attrs['date-props']).max
    );
  }

  get min(): string | number {
    return (
      this.$attrs['date-props'] && JSON.parse(this.$attrs['date-props']).min
    );
  }

  get model(): string | null {
    return this.value ? format(new Date(this.value), 'yyyy-MM-dd') : null;
  }

  set model(v: string | null) {
    this.$emit('input', v);
  }

  normalisedProps(
    props: Record<string, any> | string,
    defaults: Record<string, any>,
  ): Record<string, any> {
    let normalised = typeof props === 'string' ? props.split(',') : props;
    if (defaults) normalised = Object.assign(defaults, normalised);

    return Array.isArray(normalised)
      ? normalised.reduce((acc, p) => {
          const [key, ...rest] = p.split(':');
          let value = rest.join(':').trim();
          value = value == 'true' ? true : value;
          acc[key] = value;
          return acc;
        }, {})
      : { ...normalised };
  }

  @Watch('menu')
  onMenuChange(open: boolean): void {
    if (open && this.model && !isValid(new Date(this.model))) {
      this.model = null;
    }
  }

  created(): void {
    if (this.model) {
      this.model = format(new Date(this.model), 'yyyy-MM-dd');
    }
  }

  onChange(value: string): void {
    if (value) {
      const [day, month, year] = value.split('/');
      const date =
        this.locale.key === 'en-us'
          ? `${year}-${this.pad(day)}-${this.pad(month)}`
          : `${year}-${this.pad(month)}-${this.pad(day)}`;

      if (this.min && isBefore(new Date(date), new Date(this.min))) {
        this.model = null;
        this.$emit('change', this.model);
        return;
      }
      if (this.max && isAfter(new Date(date), new Date(this.max))) {
        this.model = null;
        this.$emit('change', this.model);
        return;
      }

      if (!isValid(new Date(date))) {
        this.model = null;
        this.$emit('change', this.model);
        return;
      }

      this.model = date;
      this.$emit('change', this.model);
      return;
    }
    this.model = null;
    this.$emit('change', this.model);
  }

  onInput(value: string): void {
    this.model = value;
    this.$emit('change', value);
    this.menu = false;
  }

  pad(value: string, length = 2): string {
    return parseInt(value, 10).toLocaleString(undefined, {
      minimumIntegerDigits: length,
    });
  }

  toShow(): string {
    if (!this.model) return '';
    return getDateFormatted(new Date(this.model).toJSON());
  }
}
</script>

<style lang="scss">
.v-input {
  &.disabled {
    pointer-events: none;
    cursor: default;

    .v-input__control {
      .v-input__slot {
        background: #f5f5f5;
      }
    }
  }
}
.v-picker.v-picker--date {
  font-size: 1.2em !important;
}
</style>
