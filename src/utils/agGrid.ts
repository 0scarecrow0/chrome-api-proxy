import { ValueFormatterParams } from 'ag-grid-community';
import dayjs from 'dayjs';
import { last, nth, split } from 'lodash';

export function urlValueFormat<TData = any, TValue = any>(
  params: ValueFormatterParams<TData, TValue>,
) {
  const value = params.value;
  if (!value) return '';
  if (typeof value === 'string') {
    const urlList = split(value, '/');
    if (!urlList.length) return '';
    return last(urlList) || nth(urlList, urlList.length - 1);
  }
  return value;
}

export function timeValueFormat<TData = any, TValue = any>(
  params: ValueFormatterParams<TData, TValue>,
) {
  const value = params.value;
  if (!value) return '';
  if (typeof value === 'string') {
    return dayjs(value).format('HH:mm:ss');
  }
  return value;
}
