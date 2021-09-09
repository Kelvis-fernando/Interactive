import {
  Chart,
  ChartComponent,
  ChartType,
  TimeScale,
  TimeScaleOptions,
} from 'chart.js';

interface RealtimeOptions {
  duration?: number;
  delay?: number;
  frameRate?: number;
  refresh?: number;
  onRefresh?: (this: RealTimeScale, chart: Chart) => void | null;
  pause?: boolean;
  ttl?: number;
}

export type RealTimeScaleOptions = TimeScaleOptions & {
  realtime: RealtimeOptions;
};

export type RealTimeScale<
  O extends RealTimeScaleOptions = RealTimeScaleOptions,
> = TimeScale<O>;

export const RealTimeScale: ChartComponent & {
  prototype: RealTimeScale;
  new <O extends RealTimeScaleOptions = RealTimeScaleOptions>(
    cfg: Record<string, unknown>,
  ): RealTimeScale<O>;
};

import { Log } from '@/plugins/logger';

import {
  Streaming,
  StreamingOptions,
} from '../plugins/charts/plugin-streaming';

declare module 'vue/types/vue' {
  interface Vue {
    $log: Log;
  }
}

declare module 'vuex/types' {
  interface Store {
    restored: Promise<any>;
  }
}

declare module 'chart.js' {
  // interface Chart<
  //   TType extends keyof ChartTypeRegistry = keyof ChartTypeRegistry,
  //   TData = DistributiveArray<ChartTypeRegistry[TType]['defaultDataPoint']>,
  //   TLabel = unknown,
  // > {
  //   $streaming: Streaming;
  // }

  interface CartesianScaleTypeRegistry {
    realtime: {
      options: RealTimeScaleOptions;
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface PluginOptionsByType<TType extends ChartType> {
    /**
     * Per chart streaming plugin options.
     */
    streaming?: Options;
  }

  enum UpdateModeEnum {
    quiet = 'quiet',
  }
}

declare global {
  interface Window {
    fbAsyncInit: any;
    FB: any;
  }
}
