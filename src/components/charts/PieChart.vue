<script lang="ts">
import { Component } from 'vue-property-decorator';

import { ReactiveProp } from '@/plugins/charts/vue-chartjs';

@Component
export default class PieChart extends ReactiveProp {
  mounted(): void {
    this._chartType = 'pie';
    this.renderChart(this.chartData, this.options);
  }
}
</script>
