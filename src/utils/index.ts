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
