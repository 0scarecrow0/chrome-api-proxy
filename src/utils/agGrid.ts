import { ValueFormatterParams } from 'ag-grid-community';
import dayjs from 'dayjs';
import { last, split } from 'lodash';

export function urlValueFormat<TData = any, TValue = any>(
  params: ValueFormatterParams<TData, TValue>,
) {
  const value = params.value;
  if (!value) return '';
  if (typeof value === 'string') {
    return last(split(value, '/'));
  }
  return value;
}

export function timeValueFormat<TData = any, TValue = any>(
  params: ValueFormatterParams<TData, TValue>,
) {
  const value = params.value;
  if (!value) return '';
  if (typeof value === 'string') {
    return dayjs(value).format('YYYY-MM-DD HH:mm:ss');
  }
  return value;
}
