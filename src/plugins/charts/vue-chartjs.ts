import {
  Chart,
  registerables,
  ChartData,
  ChartType,
  ChartOptions,
  Plugin,
} from 'chart.js';
import { Vue, Ref, Prop, Watch, Component } from 'vue-property-decorator';
import { PropType } from 'vue';

import { getRandomColor } from '@/utils/helpers';

import './adapter-date-fns';
import 'chartjs-plugin-zoom';
import streamingPlugin from 'chartjs-plugin-streaming';

Chart.register(...registerables);
Chart.register(streamingPlugin);

Chart.defaults.scales.realtime.time = {
  parser: 'parser',
  round: false,
  isoWeekday: false,
  displayFormats: {
    millisecond: 'pp',
    second: 'pp',
    minute: 'p',
    hour: 'ha',
    day: 'MMM d',
    week: 'PP',
    mounth: 'MMM yyyy',
    quarter: 'qqq - yyyy',
    year: 'yyyy',
  },
  tooltipFormat: 'pp',
  unit: false,
  stepSize: 1,
  minUnit: 'millisecond',
};

Chart.defaults.font.family = 'Axiforma';
Chart.defaults.plugins.legend.display = false;

@Component
export class BaseChart extends Vue {
  @Ref() canvas!: HTMLCanvasElement;

  @Prop({ type: String })
  private chartId!: string;

  @Prop({ type: Number, default: null })
  private width!: number;

  @Prop({ type: Number, default: null })
  private height!: number;

  @Prop({ type: String, default: '' })
  private cssClasses!: string;

  @Prop({ type: Object, default: () => ({}) })
  private styles!: Record<string, any>;

  @Prop({ type: Array, default: () => [] })
  private plugins!: Plugin[];

  @Prop({
    type: Object as () => PropType<ChartData>,
    required: true,
    default: () => ({}),
  })
  chartData!: ChartData;

  @Prop({
    type: Object as () => PropType<ChartOptions>,
    default: () => ({}),
  })
  options!: ChartOptions;

  _chartId = '';
  _chartType: ChartType = 'bar';
  _chart: Chart | null = null;
  _plugins = this.plugins;

  render(createElement: Vue.CreateElement): any {
    return createElement(
      'div',
      {
        style: {
          width: `${this.width}px`,
          height: `${this.height}px`,
          ...this.styles,
        },
        class: this.cssClasses,
      },
      [
        createElement('canvas', {
          attrs: {
            id: this.chartId,
          },
          ref: 'canvas',
        }),
      ],
    );
  }

  beforeDestroy(): void {
    if (this.$data._chart) this.$data._chart.destroy();
  }

  addPlugin(plugin: Plugin): void {
    this._plugins.push(plugin);
  }

  fillColors(data: ChartData[]): string[] {
    return Array.from({ length: data.length }, () => getRandomColor());
  }

  dataHandler(newData: ChartData, oldData: ChartData): void {
    if (oldData) {
      const chart = this.$data._chart;

      const newDatasetLabels = newData.datasets.map(dataset => dataset.label);
      const oldDatasetLabels = oldData.datasets.map(dataset => dataset.label);

      const oldLabels = JSON.stringify(oldDatasetLabels);
      const newLabels = JSON.stringify(newDatasetLabels);

      if (
        newLabels === oldLabels &&
        oldData.datasets.length === newData.datasets.length
      ) {
        newData.datasets.forEach((dataset, i) => {
          const oldDatasetKeys = Object.keys(oldData.datasets[i]);
          const newDatasetKeys = Object.keys(dataset);

          const deletionKeys = oldDatasetKeys.filter(key => {
            return key !== '_meta' && newDatasetKeys.indexOf(key) === -1;
          });

          deletionKeys.forEach(deletionKey => {
            delete chart.data.datasets[i][deletionKey];
          });

          for (const attribute in dataset) {
            if (Object.hasOwnProperty.call(dataset, attribute)) {
              // chart.data.datasets[i][attribute] = dataset[attribute];
            }
          }
        });

        if (Object.hasOwnProperty.call(newData, 'labels')) {
          chart.data.labels = newData.labels;
          this.$emit('labels:update');
        }

        chart.update('normal');
        this.$emit('chart:update');
      } else {
        if (chart) {
          chart.destroy();
          this.$emit('chart:destroy');
        }
        this.renderChart(this.chartData, this.options);
        this.$emit('chart:render');
      }
    } else {
      if (this.$data._chart) {
        this.$data._chart.destroy();
        this.$emit('chart:destroy');
      }
      this.renderChart(this.chartData, this.options);
      this.$emit('chart:render');
    }
  }

  renderChart(data: ChartData, options: ChartOptions): void {
    if (this._chart) this._chart.destroy();
    if (!this.canvas) {
      throw new Error(
        'Please remove the <template></template> tags from your chart component. See https://vue-chartjs.org/guide/#vue-single-file-components',
      );
    }

    const context = this.canvas && this.canvas.getContext('2d');

    if (context) {
      this._chart = new Chart(context, {
        type: this._chartType,
        data,
        options,
        plugins: this._plugins,
      });
    }
  }
}

@Component
export class ReactiveProp extends BaseChart {
  @Watch('chartData')
  onChartDataChange(newData: ChartData, oldData: ChartData): void {
    this.dataHandler(newData, oldData);
  }
}
