import { TranslateResult } from 'vue-i18n';

export type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>;
};

export type ToastTypes = 'success' | 'info' | 'warn' | 'error';

export type Toast = {
  type: ToastTypes;
  text: string | TranslateResult;
};

export type Tab = {
  icon: string;
  text: string;
};

export type DateTypes = 'dd/mm/yyyy' | 'mm/dd/yyyy' | 'yyyy-mm-dd';

export type Operators =
  | 'contain'
  | 'notContain'
  | 'equal'
  | 'greater'
  | 'greaterEqual'
  | 'lessEqual'
  | 'notEqual';

export type Type = {
  ID: number;
  NAME: number;
};

export type Status = {
  ID: number;
  NAME: number;
};

export type Field = {
  name: string;
  type: string;
  lookup_key: boolean;
  required: boolean;
  default: boolean;
  value?: string | number | boolean | null;
  editable?: string[];
};

export type RuleFn = (v: string) => boolean | string | TranslateResult;

export type Rules = {
  [x: string]: RuleFn;
};
