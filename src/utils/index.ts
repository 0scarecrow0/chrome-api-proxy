export * from './agGrid';
export * from './apiPromise';

export function JsonParse(str?: string) {
  if (!str) return;
  try {
    return JSON.parse(str);
  } catch {
    return str;
  }
}

export function getUuiD(randomLength: number) {
  return Number(
    Math.random().toString().substr(2, randomLength) + Date.now(),
  ).toString(36);
}
