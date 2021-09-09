<script lang="ts">
import { Component } from 'vue-property-decorator';

import { ReactiveProp } from '@/plugins/charts/vue-chartjs';

@Component
export default class DoughnutChart extends ReactiveProp {
  mounted(): void {
    this._chartType = 'doughnut';
    this.renderChart(this.chartData, this.options);
  }
}
</script>
