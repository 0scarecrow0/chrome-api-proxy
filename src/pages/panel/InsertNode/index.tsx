import { YAPI_INFO_STORAGE_KEY } from '@/enum';
import { getLocalStorage } from '@/utils';
import { ConfigProvider, Divider } from 'antd';
import { isObject } from 'lodash';
import { useEffect, useState } from 'react';
import HarList from './components/HarList';
import YApiInfo from './components/YApiInfo';
import { DevToolsContext } from './context';
import { YapiInfo } from './type';

const InsertNode = () => {
  const [yapiInfo, setYApiInfo] = useState<YapiInfo>({});

  /** 获取缓存 中的 Yapi 信息 */
  const getStorageInfo = async () => {
    const yapiInfo = await getLocalStorage(YAPI_INFO_STORAGE_KEY);
    if (isObject(yapiInfo)) {
      setYApiInfo(yapiInfo || {});
    } else {
      setYApiInfo({});
    }
  };

  useEffect(() => {
    getStorageInfo();
    chrome.storage.local.onChanged.addListener(getStorageInfo);
    return () => {
      chrome.storage.local.onChanged.removeListener(getStorageInfo);
    };
  }, []);

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: 'coral',
          borderRadius: 8,
        },
      }}
    >
      <DevToolsContext.Provider value={{ yapiInfo }}>
        <div className="w-100% h-100% flex flex-col overflow-hidden">
          <YApiInfo className="shrink-0 mb-12" />
          <Divider className="shrink-0" style={{ margin: 0 }} />
          <HarList className="flex-1 m-12" />
        </div>
      </DevToolsContext.Provider>
    </ConfigProvider>
  );
};

export default InsertNode;
