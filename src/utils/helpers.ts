import { keys } from 'lodash';

import i18n from '@/i18n';
import { toast } from '@/plugins/events';

// eslint-disable-next-line @typescript-eslint/no-empty-function
export const noop = (): void => {};

export const rndMinMaxInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const getUniqIntArray = (
  length: number,
  min: number,
  max: number,
): number[] => {
  const unq: number[] = [];
  if (min > max) return unq;
  if (max - min < length) length = max - min;

  while (unq.length < length) {
    const rnd = rndMinMaxInt(min, max);
    if (!unq.includes(rnd)) {
      unq.push(rnd);
    }
  }
  return unq;
};

export const domainRules = [
  (v: string): boolean | string => !!v || 'formRules.required.error',
  (v: string): boolean | string =>
    /(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]/.test(
      v,
    ) || 'formRules.domain.error.invalid',
  (v: string): boolean | string =>
    v.indexOf('--') < 0 || 'formRules.domain.error.invalid',
  (v: string): boolean | string =>
    v.indexOf('192.168') < 0 || 'formRules.domain.error.invalid',
  (v: string): boolean | string =>
    v.indexOf('127.0.') < 0 || 'formRules.domain.error.invalid',
  (v: string): boolean | string =>
    v.indexOf('localhost') < 0 || 'formRules.domain.error.invalid',
  (v: string): boolean | string =>
    v.indexOf('0.0.') < 0 || 'formRules.domain.error.invalid',
  (v: string): boolean | string =>
    v[0] != '-' || 'formRules.domain.error.invalid',
  (v: string): boolean | string =>
    v[0] != '.' || 'formRules.domain.error.invalid',
  (v: string): boolean | string =>
    v.substr(v.length - 1) != '.' || 'formRules.domain.error.invalid',
  (v: string): boolean | string =>
    v.indexOf(',') < 0 || 'formRules.domain.error.invalid',
  (v: string): boolean | string =>
    v.indexOf('/') < 0 || 'formRules.domain.error.invalid',
  (v: string): boolean | string =>
    v.indexOf(';') < 0 || 'formRules.domain.error.invalid',
  (v: string): boolean | string =>
    v.indexOf('\\') < 0 || 'formRules.domain.error.invalid',
  (v: string): boolean | string =>
    v.indexOf('*') < 0 || 'formRules.domain.error.invalid',
  (v: string): boolean | string =>
    v.indexOf('#') < 0 || 'formRules.domain.error.invalid',
  (v: string): boolean | string =>
    v.indexOf('(') < 0 || 'formRules.domain.error.invalid',
  (v: string): boolean | string =>
    v.indexOf(')') < 0 || 'formRules.domain.error.invalid',
  (v: string): boolean | string =>
    v.indexOf('[') < 0 || 'formRules.domain.error.invalid',
  (v: string): boolean | string =>
    v.indexOf(']') < 0 || 'formRules.domain.error.invalid',
  (v: string): boolean | string =>
    v.indexOf('{') < 0 || 'formRules.domain.error.invalid',
  (v: string): boolean | string =>
    v.indexOf('}') < 0 || 'formRules.domain.error.invalid',
  (v: string): boolean | string =>
    v.indexOf("'") < 0 || 'formRules.domain.error.invalid',
  (v: string): boolean | string =>
    v.indexOf('"') < 0 || 'formRules.domain.error.invalid',
  (v: string): boolean | string =>
    v.indexOf('!') < 0 || 'formRules.domain.error.invalid',
  (v: string): boolean | string =>
    v.indexOf('@') < 0 || 'formRules.domain.error.invalid',
  (v: string): boolean | string =>
    v.indexOf('$') < 0 || 'formRules.domain.error.invalid',
  (v: string): boolean | string =>
    v.indexOf('%') < 0 || 'formRules.domain.error.invalid',
  (v: string): boolean | string =>
    v.indexOf('¨') < 0 || 'formRules.domain.error.invalid',
  (v: string): boolean | string =>
    v.indexOf('&') < 0 || 'formRules.domain.error.invalid',
  (v: string): boolean | string =>
    v.indexOf('=') < 0 || 'formRules.domain.error.invalid',
  (v: string): boolean | string =>
    v.indexOf('-') < 0 || 'formRules.domain.error.invalid',
  (v: string): boolean | string =>
    v.indexOf('?') < 0 || 'formRules.domain.error.invalid',
  (v: string): boolean | string =>
    v.indexOf(' ') < 0 || 'formRules.domain.error.invalid',
  (v: string): boolean | string =>
    v.indexOf('//') < 0 || 'formRules.domain.error.invalid',
  (v: string): boolean | string =>
    v.indexOf('/') < 0 || 'formRules.domain.error.invalid',
];

export const isDomainValid = (domain: string): boolean => {
  let countErrors = 0;

  domainRules.forEach((item, key) => {
    const isValid = domainRules[key](domain);
    if (isValid !== true) countErrors++;
  });

  return countErrors === 0;
};

export const getRandomColor = (): string => {
  const chars = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += chars[Math.floor(Math.random() * 16)];
  }
  return color;
};

export const getPerc = (
  val: string | number,
  total: number,
  fixed = 2,
): string => {
  if (typeof val !== 'number') val = parseInt(val, 10);
  return ((val * 100) / total).toFixed(fixed);
};

export const calcFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  // return {
  //   default: parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i],
  //   value: parseFloat(bytes / Math.pow(k, i)),
  //   size: sizes[i],
  // };
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

export const verifyFileRequeriments = (
  file: File,
  types: string[],
  maxSize = 256000,
): boolean => {
  if (types && !types.includes(file.type)) {
    toast.error(i18n.t('files.typeNotAllowed'));
    return false;
  }
  if (maxSize > 0 && file.size > maxSize) {
    toast.error(
      `${i18n.t('files.sizeLimitText', {
        size: calcFileSize(maxSize),
      })} ${i18n.t('files.tryAnother')}`,
    );
    return false;
  }

  return true;
};

export const removeAccents = (str: string): string => {
  const map = {
    a: 'á|à|ã|â|À|Á|Ã|Â',
    e: 'é|è|ê|É|È|Ê',
    i: 'í|ì|î|Í|Ì|Î',
    o: 'ó|ò|ô|õ|Ó|Ò|Ô|Õ',
    u: 'ú|ù|û|ü|Ú|Ù|Û|Ü',
    c: 'ç|Ç',
    n: 'ñ|Ñ',
  };

  keys(map).forEach(pattern => {
    const key = pattern as 'a' | 'e' | 'i' | 'o' | 'u' | 'c' | 'n';
    str = str.replace(new RegExp(map[key], 'g'), key);
  });

  return str;
};
