export const getNetworkHAR = (): Promise<chrome.devtools.network.HARLog> => {
  return new Promise((resolve) => {
    chrome.devtools.network.getHAR((harLog) => {
      resolve(harLog);
    });
  });
};
