import { VueConstructor } from 'vue';

export type LogLevels = 'debug' | 'info' | 'warn' | 'error';

export interface Log {
  debug(...args: any[]): void;
  info(...args: any[]): void;
  warn(...args: any[]): void;
  error(...args: any[]): void;
}

export interface ILoggerOptions {
  logLevel: LogLevels;
  separator: string;
  prefix?: string;
}

class Logger {
  private logLevels: LogLevels[] = ['debug', 'info', 'warn', 'error'];
  private opts: ILoggerOptions = {
    logLevel: 'error',
    separator: '|',
  };

  public install(Vue: VueConstructor, o: ILoggerOptions) {
    this.opts.logLevel = o.logLevel ? o.logLevel : 'error';
    this.opts.separator = o?.separator ? o.separator : '|';
    this.opts.prefix = o?.prefix ? o.prefix : undefined;

    Vue.prototype.$log = this.initLoggerInstance(this.opts, this.logLevels);
  }

  private getMethodName(): string {
    let error = {} as Error;

    try {
      throw new Error('');
    } catch (e) {
      error = e;
    }
    // IE9 does not have .stack property
    if (error.stack === undefined) return '';

    let stackTrace = error.stack.split('\n')[3];
    if (/ /.test(stackTrace)) {
      stackTrace = stackTrace.trim().split(' ')[1];
    }

    if (stackTrace && stackTrace.indexOf('.') > -1) {
      stackTrace = stackTrace.split('.')[1];
    }

    return stackTrace;
  }

  private initLoggerInstance(options: ILoggerOptions, logLevels: LogLevels[]) {
    const logger = {} as Record<LogLevels, any>;

    logLevels.forEach(logLevel => {
      logger[logLevel] = (...args: any[]) => {
        const isSimpleType = ['info', 'log', 'warn', 'error'].includes(
          logLevel,
        );

        switch (options.logLevel) {
          case 'error':
            if (logLevel !== 'error') {
              return;
            }
            break;

          case 'warn':
            if (!['error', 'warn'].includes(logLevel)) {
              return;
            }
            break;

          case 'info':
            if (!isSimpleType) {
              return;
            }
            break;
        }

        if (logLevel === 'debug') {
          const methodName = this.getMethodName();
          const msg = args.shift();
          const prefix = options.prefix ? `(${options.prefix}) ` : '';
          console.log(
            '%c DX debug',
            'color: #000; font-weight: bold',
            `${prefix} ${methodName} ${options.separator} ${msg}`,
            ...args,
          );
          return msg;
        }

        const msg = args.shift();
        const prefix = options.prefix ? `(${options.prefix}) ` : '';

        try {
          console[logLevel](`${prefix} ${msg}`, args);
        } catch (e) {
          //
        }
      };
    });

    return logger;
  }
}

export default new Logger();
