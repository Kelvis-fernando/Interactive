<script lang="ts">
import { Component, Mixins, Prop, Watch } from 'vue-property-decorator';
import { PropType } from 'vue';

import { ChartData, ChartOptions, ScatterDataPoint } from 'chart.js';
import { color } from 'chart.js/helpers';

import { toDate } from 'date-fns-tz';
import { isEqual } from 'date-fns';

import { BaseChart } from '@/plugins/charts/vue-chartjs';

type Event = {
  label: string;
  timestamp: Date | number;
  event: Record<string, any>;
};

@Component
export default class StreamingBarChart extends Mixins(BaseChart) {
  @Prop({ type: Object as PropType<Event>, default: () => ({}) })
  private event!: Event;

  private timeout: number | null = null;
  private chartColors = [
    '#053286',
    '#4261EE',
    '#0196FF',
    '#4BC9F0',
    '#AC61D4',
    '#571695',
    '#00B592',
    '#430567',
    '#A879C1',
    '#E5AFFF',
    '#F72485',
    '#8F2E56',
    '#F9C80B',
  ];

  private data: ChartData = {
    labels: [],
    datasets: [],
  };

  private opts: ChartOptions = {
    animations: {
      colors: false,
      x: false,
    },

    transitions: {
      active: {
        animation: {
          duration: 0,
        },
      },
    },

    plugins: {
      legend: {
        display: true,
      },
      tooltip: {
        mode: 'point',
        intersect: true,
      },
    },

    maintainAspectRatio: false,
    scales: {
      x: {
        type: 'realtime',
        realtime: {
          duration: 15000,
          frameRate: 30,
          delay: 0,
        },
        stacked: true,
        grid: {
          display: false,
        },
      },
      y: {
        type: 'linear',
        stacked: true,
        ticks: {
          stepSize: 1,
          autoSkip: false,
        },

        grid: {
          display: false,
        },
      },
    },
    ...this.options,
  };

  @Watch('event')
  onEventChange(e: Event): void {
    this.eventHandler(e);
  }

  @Watch('height')
  onHeightChange(height: number): void {
    this.canvas.style.height = `${height}px`;
  }

  beforeDestroy(): void {
    if (this.timeout) clearTimeout(this.timeout);
  }

  mounted(): void {
    this._chartType = 'bar';
    this.renderChart(this.data, this.opts);
    this.fakeDataGenerator();
  }

  eventHandler(data: Event): void {
    const chart = this._chart;
    if (!chart) return;

    const label = data.label;
    const dtskey = chart.data.datasets.findIndex(d => d.label === label);
    const x = toDate(data.timestamp).setMilliseconds(0);

    if (dtskey < 0) {
      const { length } = chart.data.datasets;
      const newColor = this.chartColors[length % this.chartColors.length];

      const newDataset = {
        label,
        backgroundColor: newColor,
        hoverBackgroundColor: color(newColor).alpha(0.9).rgbString(),
        borderWidth: 0,
        minBarLength: 0,
        barThickness: 15,
        data: [
          {
            x,
            y: 1,
          },
        ],
      };
      chart.data.datasets.push({ ...newDataset });

      chart.update('none');
      return;
    }

    const dataIndex = chart.data.datasets[dtskey].data.findIndex(item => {
      return isEqual((item as ScatterDataPoint).x, x);
    });

    if (dataIndex < 0) {
      chart.data.datasets[dtskey].data.push({
        x,
        y: 1,
      });

      return chart.update('none');
    }

    (chart.data.datasets[dtskey].data[dataIndex] as ScatterDataPoint).y += 1;
    chart.update('none');
  }

  fakeDataGenerator(): void {
    const isStag = process.env.NODE_ENV === 'development';
    if (isStag) {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const self = this;
      setInterval(() => {
        if (!self.timeout) {
          const time = Math.random() * 5000;
          self.timeout = window.setTimeout(() => {
            const labels = [
              'Dataset 1',
              'Dataset 2',
              'Dataset 3',
              'Dataset 4',
              'Dataset 5',
            ];
            const event = {
              label: labels[Math.round(Math.random() * 4)],
              timestamp: new Date(),
              event: {},
            };
            self.eventHandler(event);
            self.timeout = null;
          }, time);
        }
      }, 20);
    }
  }
}
</script>
