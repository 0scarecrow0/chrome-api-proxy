import { toUpper } from 'lodash';

/** key stored in proxy rules. */
export const RULES_STORAGE_KEY = 'rules';

export enum Method {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
  HEAD = 'HEAD',
  OPTIONS = 'OPTIONS',
  CONNECT = 'CONNECT',
  TRACE = 'TRACE',
  MOVE = 'MOVE',
  COPY = 'COPY',
  LINK = 'LINK',
  UNLINK = 'UNLINK',
  WRAPPED = 'WRAPPED',
}

export const MethodMap = new Map([
  [Method.GET, { tagColor: '#87d068', label: Method.GET }],
  [Method.POST, { tagColor: '#2db7f5', label: Method.POST }],
]);

export function getMethodCof(method?: Method | string) {
  const covMethod = toUpper(method) as Method;
  return MethodMap.get(covMethod) || { tagColor: 'lime', label: covMethod };
}

/** key stored in yapi base url */
export const YAPI_INFO_STORAGE_KEY = 'yapi_info';

/** key stored in yapi base url */
export const PROXY_RULE_ID_JOIN_STR = 'yapi_mock';
