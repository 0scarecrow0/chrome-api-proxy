import { useRequest } from 'ahooks';
import { message } from 'antd';
import ky, { Input, KyInstance, Options } from 'ky';
import { get } from 'lodash';

type Method = keyof Pick<KyInstance, 'get' | 'post'>;
/** This request encapsulation is only applicable to Yapi */
export function useFetch() {
  const service = async (
    method: Method,
    url: Input,
    options?: Options,
  ): Promise<any> => {
    try {
      let api;
      switch (method) {
        case 'get':
          api = ky.get;
          break;
        case 'post':
          api = ky.post;
          break;
        default:
          api = ky.post;
          break;
      }
      const response = await api(url, options || {});
      if (response.status !== 200) {
        throw new Error('Request failed');
      }

      const json = await response.json();
      const errCode = get(json, 'errcode') as unknown as number;

      switch (errCode) {
        case 0:
          return get(json, 'data');

        /** 未登录 */
        case 40011: {
          message.error('登录过期，请登录！');
          throw new Error('Login expired, please login!');
        }
        default: {
          const errMsg = get(json, 'errmsg');
          message.error(errMsg || 'Request failed');
          throw new Error('Request failed');
        }
      }
    } catch (error) {
      throw new Error((error as any)?.message || 'Request failed');
    }
  };
  const { runAsync } = useRequest(service, { manual: true });
  return runAsync;
}
