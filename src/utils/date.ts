import { isValid } from 'date-fns';
import { utcToZonedTime, zonedTimeToUtc, toDate, format } from 'date-fns-tz';

import i18n from '@/i18n';

import store from '@/store';

export const getDateFormatted = (
  date: string | number,
  fmt = i18n.t('date.displayFormats.date') as string,
): string => {
  if (!date) return '';
  if (!isValid(new Date(date))) return '';
  if (typeof date === 'string' && !isUTCDateTime(date)) {
    date = `${date.replace(' ', 'T')}Z`;
  }
  const timeZone = store.getters['timezones/gmt'];
  const zonedDate = utcToZonedTime(date, timeZone);
  return format(zonedDate, fmt, { timeZone });
};

export const getDateTimeFormatted = (
  date: string | number,
  fmt = i18n.t('date.displayFormats.datetime') as string,
): string => {
  if (!date) return '';
  if (!isValid(new Date(date))) return '';
  if (typeof date === 'string' && !isUTCDateTime(date)) {
    date = `${date.replace(' ', 'T')}Z`;
  }
  const timeZone = store.getters['timezones/gmt'];
  const zonedDate = utcToZonedTime(toDate(date), timeZone);
  return format(zonedDate, fmt, { timeZone });
};

export const getTimeFormatted = (
  date: string | number,
  fmt = i18n.t('date.displayFormats.time') as string,
): string => {
  if (!date) return '';
  if (!isValid(new Date(date))) return '';
  if (typeof date === 'string' && !isUTCDateTime(date)) {
    date = `${date.replace(' ', 'T')}Z`;
  }
  const timeZone = 'America/Sao_Paulo';
  const zonedDate = utcToZonedTime(date, timeZone);
  return format(zonedDate, fmt, { timeZone });
};

export const isUTCDateTime = (str: string): boolean => {
  return !!str.match(
    /^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}.?(\d+)?Z$/g,
  );
};

export const toUTCDate = (date = new Date(), iso = 'date'): string | Date => {
  const utcDate = zonedTimeToUtc(toDate(date), store.getters['timezones/gmt']);
  return iso === 'string' ? utcDate.toJSON() : utcDate;
};
