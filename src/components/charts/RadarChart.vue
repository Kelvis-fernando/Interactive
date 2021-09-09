<script lang="ts">
import { Component } from 'vue-property-decorator';

import { ReactiveProp } from '@/plugins/charts/vue-chartjs';

@Component
export default class RadarChart extends ReactiveProp {
  mounted(): void {
    this._chartType = 'radar';
    this.renderChart(this.chartData, this.options);
  }
}
</script>
