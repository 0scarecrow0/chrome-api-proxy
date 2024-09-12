import { createContext } from 'react';
import { YapiInfo } from './type';

interface DevToolsContext {
  yapiInfo: YapiInfo;
}

export const DevToolsContext = createContext<DevToolsContext>({
  yapiInfo: {},
});
