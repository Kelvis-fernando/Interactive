<script lang="ts">
import { Component } from 'vue-property-decorator';

import { ReactiveProp } from '@/plugins/charts/vue-chartjs';

@Component
export default class ScatterChart extends ReactiveProp {
  mounted(): void {
    this._chartType = 'scatter';
    this.renderChart(this.chartData, this.options);
  }
}
</script>
