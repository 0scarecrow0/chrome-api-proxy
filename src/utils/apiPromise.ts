import { get } from 'lodash';

export function getNetworkHAR(): Promise<chrome.devtools.network.HARLog> {
  return new Promise((resolve) => {
    chrome.devtools.network.getHAR((harLog) => {
      resolve(harLog);
    });
  });
}

/**
 * @description: Gets one or more items from storage.
 */
export function getLocalStorage(keys: string): Promise<any>;
export function getLocalStorage(
  keys: string[] | Record<string, any> | null,
): Promise<Record<string, any>>;
export function getLocalStorage(
  keys: string | string[] | Record<string, any> | null,
): Promise<any> {
  return new Promise((resolve) => {
    chrome.storage.local.get(keys, (data) => {
      if (typeof keys === 'string') {
        resolve(get(data, keys));
        return;
      }
      resolve(data);
    });
  });
}

/**
 * @description: Sets multiple items
 */
export async function setLocalStorage(key: Record<string, any>): Promise<void>;
export async function setLocalStorage(key: string, items: any): Promise<void>;
export async function setLocalStorage(key: any, items?: any): Promise<any> {
  if (typeof key === 'string') {
    const value = {
      [key]: items,
    };
    await chrome.storage.local.set(value);
  } else {
    await chrome.storage.local.set(key);
  }
}

/**
 * @description: Removes one or more items from storage
 */
export async function removeLocalStorage(keys: string | string[]) {
  await chrome.storage.local.remove(keys);
}
