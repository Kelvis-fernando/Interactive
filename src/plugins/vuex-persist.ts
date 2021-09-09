import { Store, Plugin, MutationPayload } from 'vuex';
import { keys, merge } from 'lodash';

import LocalForage from '@/services/localforage';

import { encrypt, decrypt } from '@/plugins/encrypt';

const isProd = process.env.NODE_ENV === 'production';

export type MergeOptionType = 'replaceArrays' | 'concatArrays';

export class SimplePromiseQueue {
  private readonly _queue: Array<Promise<void>> = [];
  private _flushing = false;

  public enqueue(promise: Promise<void>): Promise<void> {
    this._queue.push(promise);
    if (!this._flushing) {
      return this.flushQueue();
    }
    return Promise.resolve();
  }

  private flushQueue(): Promise<void> {
    this._flushing = true;

    const chain = (): Promise<void> | void => {
      const nextTask = this._queue.shift();
      if (nextTask) {
        return nextTask.then(chain);
      } else {
        this._flushing = false;
      }
    };
    return Promise.resolve(chain());
  }
}

class VuexPersist<S> {
  public storage: LocalForage = LocalForage;
  public restoreState: (state: Record<string, any>) => Promise<S>;
  public saveState: (key: string, state: Record<string, any>) => Promise<void>;

  public plugin: Plugin<S>;

  private _mutex = new SimplePromiseQueue();

  constructor() {
    this.plugin = (store: Store<S>) => {
      store.restored = this.restoreState(store.state).then(savedState => {
        store.replaceState(merge({}, store.state, savedState || {}));
        store.subscribe((_: MutationPayload, state: Record<string, any>) => {
          keys(state).forEach(k => {
            this._mutex.enqueue(this.saveState(k, state[k]));
          });
        });

        return savedState;
      });
    };

    this.restoreState = async (state: Record<string, any>) => {
      const savedState = {} as Record<string, any>;
      const stateKeys = keys(state);

      for (const key of stateKeys) {
        const item = await this.storage.getItem(key);
        const value = isProd && item ? decrypt(item, key) : item;

        savedState[key] = value || {};

        if (value) {
          const objKeys = keys(value);
          for (const current of objKeys) {
            if (!Object.hasOwnProperty.call(state[key], current)) {
              delete savedState[key][current];
              continue;
            }
          }
        }
      }

      return new Promise(resolve => resolve(savedState as S));
    };

    this.saveState = (key: string, state: Record<string, any>) => {
      const item = isProd ? encrypt(state, key) : state;
      return this.storage.setItem(key, item as any);
    };
  }
}

// export const plugin = new VuexPersist().plugin;

export default VuexPersist;
