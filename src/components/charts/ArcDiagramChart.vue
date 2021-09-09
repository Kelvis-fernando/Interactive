<template>
  <div class="arc-diagram-chart">
    <div v-if="showFilter" class="chart-filters">
      <v-radio-group v-model="method" mandatory row>
        <v-radio
          :label="$t('dashboard.cards.whereTo.method.from')"
          :ripple="false"
          color="#FA6400"
          value="from"
        />
        <v-radio
          :label="$t('dashboard.cards.whereTo.method.to')"
          :ripple="false"
          color="#FA6400"
          value="to"
        />
      </v-radio-group>

      <div v-if="method === 'from'" class="filter-from">
        <v-autocomplete
          v-model="filterCountries"
          :label="$t('dashboard.cards.whereTo.selectCountry.label')"
          :loading="loading"
          :items="countriesSorted"
          item-text="name"
          item-value="name"
          :no-data-text="$t('default.noDataText')"
          multiple
          outlined
          solo
          flat
          dense
          hide-details
          autocomplete="some-random-string"
          autocorrect="off"
        />
        <v-autocomplete
          v-model="filterStates"
          :label="$t('dashboard.cards.whereTo.selectState.label')"
          :loading="loading"
          :items="statesFiltered"
          item-text="name"
          item-value="name"
          :no-data-text="$t('default.noDataText')"
          multiple
          outlined
          solo
          flat
          dense
          hide-details
          autocomplete="some-random-string"
          autocorrect="off"
        />
        <v-autocomplete
          v-model="filterCities"
          :label="$t('dashboard.cards.whereTo.selectCity.label')"
          :loading="loading"
          :items="citiesFiltered"
          item-text="name"
          item-value="name"
          :no-data-text="$t('default.noDataText')"
          multiple
          outlined
          solo
          flat
          dense
          hide-details
          autocomplete="some-random-string"
          autocorrect="off"
        />
      </div>

      <div v-else class="filter-to">
        <v-autocomplete
          v-model="filterDestinations"
          :label="$t('dashboard.cards.whereTo.selectDestination.label')"
          :loading="loading"
          :items="destinations"
          item-text="name"
          item-value="name"
          :no-data-text="$t('default.noDataText')"
          multiple
          outlined
          solo
          flat
          dense
          hide-details
          autocomplete="some-random-string"
          autocorrect="off"
        />
      </div>

      <v-btn
        class="white--text apply-filter"
        color="#FA4600"
        tile
        depressed
        :loading="loading"
        @click="refresh"
      >
        {{ $t('dialog.apply') }}
      </v-btn>
    </div>

    <div class="chart">
      <svg
        ref="arcDiagramChart"
        class="arc-diagram-chart"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        :width="`${svg.width}px`"
        :height="`${svg.height}px`"
        :viewBox="`0 0 ${svg.width} ${svg.height}`"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Ref, Prop, Watch } from 'vue-property-decorator';
import {
  ascending,
  lab,
  // interpolateNumber,
  scaleOrdinal,
  schemeCategory10,
  scalePoint,
  select,
} from 'd3';

import { removeAccents } from '@/utils/helpers';

type ChartData = {
  city: string;
  state: string;
  country: string;
  destination: string;
};

type ChartLinks = {
  source: ChartNode;
  target: ChartNode;
};

type LocationObj = {
  city: string;
  state: string;
  country: string;
};

type ChartNode = {
  id: string;
  json: LocationObj;
  label: string;
  raw: string;
  group: number;
  x?: number;
  sourceLinks: ChartLinks[];
  targetLinks: ChartLinks[];
};

type SVGProp = {
  el: any;
  label: any;
  path: any;
  overlay: any;
  width: number;
  height: number;
  right: number;
  left: number;
};

type Params = {
  countries: string[];
  states: string[];
  cities: string[];
  destinations: string[];
};

@Component
export default class ArcDiagramChart extends Vue {
  @Ref('arcDiagramChart') private arcDiagramChart!: SVGElement;

  @Prop({ type: Array, default: () => [] })
  private chartData!: [];

  @Prop({ type: Array, default: () => [] })
  private countries!: LocationObj[];

  @Prop({ type: Array, default: () => [] })
  private states!: LocationObj[];

  @Prop({ type: Array, default: () => [] })
  private cities!: LocationObj[];

  @Prop({ type: Array, default: () => [] })
  private destinations!: LocationObj[];

  @Prop({ type: Boolean, default: false })
  private loading!: boolean;

  @Prop({ type: Boolean, default: false })
  private showFilter!: boolean;

  @Prop({ type: Number, default: 200 })
  private width!: number;

  @Prop({ type: Number, default: 200 })
  private height!: number;

  private method = 'from';
  private filterCountries: string[] = [];
  private filterStates: string[] = [];
  private filterCities: string[] = [];
  private filterDestinations = [];

  private nodes: ChartNode[] = [];
  private links: ChartLinks[] = [];
  private step = 25;
  private boxLabels = 0;
  private longestArc = 0;
  private svg: SVGProp = {
    el: null,
    label: null,
    path: null,
    overlay: null,
    width: 200,
    height: 200,
    right: 0,
    left: 0,
  };

  get countriesSorted(): LocationObj[] {
    return this.countries
      .filter(i => i)
      .sort((a, b) => {
        if (a.country > b.country) return 1;
        if (a.country < b.country) return -1;
        return 0;
      });
  }

  get statesFiltered(): LocationObj[] {
    return this.states
      .filter(item => {
        if (this.filterCountries.length > 0) {
          return this.filterCountries.includes(removeAccents(item.country));
        }
        return true;
      })
      .sort((a, b) => {
        if (a.state > b.state) return 1;
        if (a.state < b.state) return -1;
        return 0;
      });
  }

  get citiesFiltered(): LocationObj[] {
    return this.cities
      .filter(item => {
        if (this.filterStates.length > 0) {
          return this.filterStates.includes(removeAccents(item.state));
        }
        return true;
      })
      .sort((a, b) => {
        if (a.city > b.city) return 1;
        if (a.city < b.city) return -1;
        return 0;
      });
  }

  get orderAsc(): typeof ascending {
    return ascending;
  }

  // @Watch('chartData')
  // onChartDataChange(): void {}

  @Watch('showFilter')
  onShowFilterChange(open: boolean): void {
    const height = open ? this.svg.height + 78 : this.svg.height;
    this.$emit('update-height', height);
  }

  @Watch('svg.height')
  onHeightChange(height: number): void {
    const h = this.showFilter ? height + 78 : height;
    if (this.nodes.length > 0) this.$emit('update-height', h);
  }

  @Watch('width')
  onWidthChange(): void {
    this.dataHandler(this.chartData);
  }

  mounted(): void {
    this.dataHandler(this.chartData);
  }

  arc(d: ChartLinks): string {
    d.source.x = this.x(d.source.id);
    d.target.x = this.x(d.target.id);
    const x1 = d.source.x as number;
    const x2 = d.target.x as number;
    const r = Math.abs(x2 - x1) / 2;
    const y = this.longestArc;
    return `M${x1},${y} A${r},${r} 0,0,${x1 < x2 ? 1 : 0} ${x2},${y}`;
  }

  calcTextSvgSize(string: string): DOMRect {
    const svgNs = 'http://www.w3.org/2000/svg';
    const svgEl = document.createElementNS(svgNs, 'svg');

    const box = document.createElementNS(svgNs, 'g');
    box.setAttribute('font-family', 'sans-serif');
    box.setAttribute('font-size', '12');
    box.setAttribute('text-anchor', 'end');

    const text = document.createElementNS(svgNs, 'text');
    text.setAttribute('transform', 'rotate(-45)');
    text.setAttribute('x', '-8');
    text.setAttribute('y', '12');
    text.setAttribute('dy', '0.35em');
    text.innerHTML = string;

    const circle = document.createElementNS(svgNs, 'circle');
    circle.setAttribute('r', '5');

    box.appendChild(circle);
    box.appendChild(text);

    svgEl.appendChild(box);
    document.body.appendChild(svgEl);

    const bbox = box.getBBox();
    svgEl.parentNode?.removeChild(svgEl);
    return bbox;
  }

  color(group: number): string {
    return scaleOrdinal(
      this.nodes.map(d => d.group),
      schemeCategory10,
    )(group);
  }

  dataHandler(newData: ChartData[]): void {
    let group = 1;
    this.nodes = [];
    this.links = [];

    const nodes: ChartNode[] = [];
    const links = newData.map(item => {
      if (group === 10) group = 0;
      group += 1;
      const sourceObj = {
        city: item.city,
        state: item.state,
        country: item.country,
      };
      const targetObj = this.toObj(item.destination.split(','));

      if (nodes.every(i => i.id !== sourceObj.city)) {
        nodes.push({
          id: sourceObj.city,
          json: sourceObj,
          label: sourceObj.city,
          raw: `${sourceObj.city}, ${sourceObj.state}, ${sourceObj.country}`,
          group,
          sourceLinks: [],
          targetLinks: [],
        });
      }

      if (nodes.every(i => i.id !== targetObj.city)) {
        nodes.push({
          id: targetObj.city,
          json: targetObj,
          label: targetObj.city,
          raw: item.destination,
          group,
          sourceLinks: [],
          targetLinks: [],
        });
      }

      return {
        source: sourceObj.city,
        target: targetObj.city,
      };
    });

    this.nodes = nodes.map(item => ({
      ...item,
      sourceLinks: [],
      targetLinks: [],
    }));

    this.svg.width = this.width;
    this.svg.right = this.width;
    if (nodes.length > 1) {
      this.step = Math.round(this.svg.width / (nodes.length - 1));
    }

    this.boxLabels = this.nodes.reduce((acc, n, i) => {
      const bbox = this.calcTextSvgSize(n.label);
      const height = Math.round(bbox.height);
      if (i < 10) {
        const left = Math.round(bbox.width - i * this.step);
        if (left > this.svg.left) this.svg.left = left;
      }
      if (height > acc) acc = height;
      return acc;
    }, 0);

    this.longestArc = 0;
    this.links = links.map(link => {
      const source = this.nodes.find(
        node => node.id === link.source,
      ) as ChartNode;
      const target = this.nodes.find(
        node => node.id === link.target,
      ) as ChartNode;

      if (source && target) {
        const x1 = this.x(source.id) as number;
        const x2 = this.x(target.id) as number;
        const r = Math.round(Math.abs(x2 - x1) / 2 + 15);
        if (r > this.longestArc) this.longestArc = r;
      }

      return {
        source,
        target,
      };
    });

    this.svg.height = Math.round(this.longestArc + this.boxLabels);
    if (this.svg.height < 200) {
      this.svg.height = 200;
      this.longestArc = 100;
      this.$emit('update-height', 200);
    }

    for (const link of this.links) {
      const { source, target } = link;
      if (source) source.sourceLinks.push(link);
      if (target) target.targetLinks.push(link);
    }

    this.svg.el = select(this.arcDiagramChart);
    this.svg.el.selectAll('*').remove();

    this.svg.path = this.svg.el
      .append('g')
      .attr('fill', 'none')
      .attr('stroke-opacity', 0.75)
      .attr('stroke-width', 1.5)
      .selectAll('path')
      .data(this.links)
      .join('path')
      .attr('stroke', '#aaa')
      .attr('d', this.arc);

    this.svg.label = this.svg.el
      .append('g')
      .attr('font-family', 'sans-serif')
      .attr('font-size', 12)
      .attr('text-anchor', 'end')
      .selectAll('g')
      .data(this.nodes)
      .join('g')
      .attr(
        'transform',
        (d: ChartNode) =>
          `translate(${(d.x = this.x(d.id))}, ${this.longestArc})`,
      )
      .call((g: any) => {
        return g
          .append('text')
          .attr('x', -8)
          .attr('y', 12)
          .attr('dy', '0.35em')
          .attr('fill', (d: ChartNode) => lab(this.color(d.group)).darker(2))
          .attr('transform', 'rotate(-45)')
          .text((d: ChartNode) => d.label);
      })
      .call((g: any) => {
        return g
          .append('circle')
          .attr('r', 5)
          .attr('fill', (d: ChartNode) => this.color(d.group));
      });

    // const pathsW = this.svg.path._parents[0].getBBox().width;
    // const labelsW = this.svg.label._parents[0].getBBox().width;
    // this.svg.left = labelsW - pathsW;

    this.svg.overlay = this.svg.el
      .append('g')
      .attr('fill', 'none')
      .attr('pointer-events', 'all')
      .selectAll('rect')
      .data(this.nodes)
      .join('rect')
      .attr('height', this.svg.height)
      .attr('width', this.step)
      .attr('x', (d: ChartNode) => (d.x as number) - this.step / 2)
      .on('mouseover', (d: ChartNode, e: ChartNode) => {
        this.svg.el.classed('hover', true);
        this.svg.label.classed('primary', (n: ChartNode) => n === e);
        this.svg.label.classed('secondary', (n: ChartNode) => {
          return (
            n.sourceLinks.some(l => l.target === e) ||
            n.targetLinks.some(l => l.source === e)
          );
        });

        this.svg.path
          .classed(
            'primary',
            (l: ChartLinks) => this.method === 'from' && l.source === e,
          )
          .classed(
            'secondary',
            (l: ChartLinks) => this.method === 'to' && l.target === e,
          )
          .filter(this.method == 'from' ? '.primary' : '.secondary')
          .raise();
      })
      .on('mouseout', () => {
        this.svg.el.classed('hover', false);
        this.svg.label.classed('primary', false);
        this.svg.label.classed('secondary', false);
        this.svg.path.classed('primary', false).order();
        this.svg.path.classed('secondary', false);
      });

    this.$log.debug('arc-diagram rendered');
  }

  refresh(): void {
    const params = {} as Params;
    if (this.method === 'from') {
      params.countries = this.filterCountries;
      params.states = this.filterStates;
      params.cities = this.filterCities;
    }

    if (this.method === 'to') {
      params.destinations = this.filterDestinations;
    }
    this.$emit('refresh', this.method, params);
  }

  toObj(array: string[]): LocationObj {
    const types = ['city', 'state', 'country'];
    const obj = {} as LocationObj;
    array.forEach((item, key) => {
      const p = types[key] as 'city' | 'state' | 'country';
      obj[p] = item.trim();
    });
    return obj;
  }

  // update(nodes: ChartNode[]): void {
  //   this.x.domain(nodes.map(d => d.id));

  //   const t = this.svg.el.transition().duration(750);

  //   this.svg.label
  //     .transition(t)
  //     .delay((d: ChartNode, i) => i * 20)
  //     .attrTween('transform', d => {
  //       const i = interpolateNumber(this.x(d.id), d.x);
  //       return t => `translate(${(d.x = i(t))},${this.longestArc})`;
  //     });

  //   this.svg.path
  //     .transition(t)
  //     .duration(750 + this.nodes.length * 20)
  //     .attrTween('d', d => () => this.arc(d));

  //   this.svg.overlay
  //     .transition(t)
  //     .delay((d, i) => i * 20)
  //     .attr('x', d => this.x(d.id) - this.step / 2);
  // }

  x(id: string): number | undefined {
    return scalePoint(
      this.nodes.map(d => d.id),
      [this.svg.left, this.svg.right - 20],
    )(id);
  }
}
</script>

<style lang="scss">
.arc-diagram-chart {
  position: relative;
  background: #fff;

  .chart-filters {
    display: flex;
    align-items: center;
    padding: 8px 12px;

    .v-input--radio-group {
      min-width: 140px;
    }

    .filter-from,
    .filter-to {
      display: flex;
      align-items: center;

      & > div {
        &:not(:first-child) {
          margin-left: 10px;
        }

        &.v-autocomplete {
          max-width: 280px;
        }
      }
    }

    .filter-from {
      width: 100%;
    }

    .apply-filter {
      margin-left: 10px;
      min-width: 120px;
      height: 40px;
    }
  }

  .chart {
    display: flex;
    align-items: center;
    justify-content: center;

    .arc-diagram-chart {
      position: relative;

      &.hover path {
        stroke: #ddd;
      }

      &.hover text {
        fill: #ddd;
      }

      &.hover g.primary text {
        fill: black;
        font-weight: bold;
      }

      &.hover g.secondary text {
        fill: #333;
      }

      @keyframes dash {
        from {
          stroke-dashoffset: 100%;
        }
        to {
          stroke-dashoffset: 0;
        }
      }

      &.hover path.primary,
      &.hover path.secondary {
        stroke: #333;
        stroke-opacity: 1;
        stroke-width: 2;
        stroke-dasharray: 0;
      }
    }
  }
}
</style>
