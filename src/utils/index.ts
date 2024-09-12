export * from './agGrid';
export * from './apiPromise';

export function JsonParse(str?: string) {
  if (!str) return {};
  try {
    return JSON.parse(str);
  } catch {
    return {};
  }
}

export function JsonStringify(str?: any) {
  if (!str) return '';
  try {
    return JSON.stringify(str);
  } catch {
    return '';
  }
}

export function getUuiD(randomLength: number) {
  return Number(
    Math.random().toString().substr(2, randomLength) + Date.now(),
  ).toString(36);
}

export function isValidJson(str: string): boolean {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
}

export function parseUrl(urlString: string) {
  try {
    if (typeof urlString !== 'string' || urlString.trim() === '') return;
    // 创建 URL 实例解析 URL
    const url = new URL(urlString);
    return {
      protocol: url.protocol, // 协议
      host: url.host, // 域名+端口
      hostname: url.hostname, // 域名
      port: url.port, // 端口
      pathname: url.pathname, // 路径
      search: url.search, // 查询参数
      hash: url.hash, // 锚点
    };
  } catch {
    return;
  }
}
