<script lang="ts">
import { Component } from 'vue-property-decorator';

import { ReactiveProp } from '@/plugins/charts/vue-chartjs';

@Component
export default class LineChart extends ReactiveProp {
  mounted(): void {
    this._chartType = 'line';
    this.renderChart(this.chartData, this.options);
  }
}
</script>
