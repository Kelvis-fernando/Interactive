import CryptoJS from 'crypto-js';
import { isString } from 'lodash';

import { rndMinMaxInt } from '@/utils/helpers';

export const pipe =
  (...fns: any[]): any =>
  (x: any) =>
    fns.reduce((v, f) => f(v), x);

// ENCRYPT

export const crAESenc = CryptoJS.AES.encrypt;
export const encUtf8Parse = CryptoJS.enc.Utf8.parse;

export const seaSalt = (): string => {
  const library = [...Array(1024 * 9)].map((_, w) => String.fromCharCode(w));
  const { length } = library;
  let res = '';
  for (let i = 0; i < 2; i++) res += library[rndMinMaxInt(0, length)];
  return res;
};

export const wrap = (data: any): any =>
  pipe(
    (arg: any) => arg,
    (arg: any) => btoa(arg),
    (arg: any) => `${seaSalt()}${arg}${seaSalt()}`,
    (arg: any) => encUtf8Parse(arg).toString(),
  )(data);

export const encrypt = (data: any, key: string) => {
  if (isString(data)) return wrap(crAESenc(data, key).toString());
  else return wrap(crAESenc(JSON.stringify(data), key).toString());
};

// DECRYPT

export const crAESdec = CryptoJS.AES.decrypt;
export const encUtf8Str = CryptoJS.enc.Utf8.stringify;
export const encHexParse = CryptoJS.enc.Hex.parse;
export const encUtf8 = CryptoJS.enc.Utf8;

export const unwrap = (data: any): any =>
  pipe(
    (arg: any) => arg,
    (arg: any) => encUtf8Str(encHexParse(arg)),
    (arg: any) => arg.substr(2, [...arg].length - 4),
    (arg: any) => atob(arg),
  )(data);
export const decrypt = (data: any, key: string): any => {
  return JSON.parse(crAESdec(unwrap(data), key).toString(encUtf8));
};
