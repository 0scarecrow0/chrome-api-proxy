import { ValueFormatterParams } from 'ag-grid-community';
import dayjs from 'dayjs';

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
