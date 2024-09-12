import { getMethodCof } from '@/enum';
import { useFetch } from '@/request';
import {
  getNetworkHAR,
  getUuiD,
  parseUrl,
  timeValueFormat,
  urlValueFormat,
} from '@/utils';
import { ColDef } from 'ag-grid-community';
import {
  AgGridReact,
  AgGridReactProps,
  CustomCellRendererProps,
} from 'ag-grid-react';
import { message, Modal, Tag } from 'antd';
import classNames from 'classnames';
import { concat, drop, get, isArray, join, map, merge, split } from 'lodash';
import {
  FC,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { DevToolsContext } from '../../context';
import SelectModal from './SelectModal';

const AG_GRID_ROW_KEY = '_ag_grid_id';

const generalAgGridId = (params?: HAREntry) => {
  if (!params) return;
  return {
    [AG_GRID_ROW_KEY]: `${getUuiD(10)}_${params?.connection}`,
  };
};

const Method: FC<CustomCellRendererProps> = (params) => {
  const methodCof = useMemo(() => {
    return getMethodCof(params.value);
  }, [params.value]);

  return <Tag color={methodCof.tagColor}>{methodCof.label}</Tag>;
};

type OperateParams = {
  dynamicRules?: chrome.declarativeNetRequest.Rule[];
  selectProxy?: (requestPath: string, proxyList?: any[]) => Promise<void>;
};
const Operate: FC<CustomCellRendererProps & OperateParams> = (params) => {
  const request = useFetch();
  const { yapiInfo } = useContext(DevToolsContext);

  const _resourceType = get(params.data, '_resourceType');
  const redirectURL = get(params.data, 'response.redirectURL');

  const addProxy = async () => {
    const domain = get(yapiInfo, 'url');
    if (!domain) {
      message.error('Please set up Yapi Domain first.');
      return;
    }

    const requestUrl = get(params.data, 'request.url');
    const urlInfo = parseUrl(requestUrl);
    const pathname = urlInfo?.pathname;
    if (!pathname || pathname === '/') {
      message.error('Not a valid URL path');
      return;
    }
    /** 因为 yapi 项目中可以设置“接口基本路径”导致，查询不出，所以默认查询时候，减去一层路径 */
    const pathnameList = split(pathname, '/');
    const covPathName =
      pathnameList.length > 2 ? join(drop(pathnameList, 2), '/') : pathname;

    const searchData = await request(
      'get',
      `${domain}/api/project/search?q=${covPathName}`,
    );

    const interfaceList: any[] = get(searchData, 'interface') || [];

    console.log(params.data, 90000000);
    console.log(pathname, 90000000);

    if (!isArray(interfaceList) || !interfaceList.length) {
      message.error('未查询到接口');
      return;
    }
    params.selectProxy?.(urlInfo.origin + urlInfo.pathname, interfaceList);
  };

  const addIsShow = useMemo(() => {
    return _resourceType === 'xhr' && !redirectURL;
  }, [_resourceType, redirectURL]);

  return (
    <div className="flex items-center gap-4 text-12">
      {addIsShow ? (
        <div
          className="cursor-pointer c-#e67e22 hover-text-opacity-60"
          onClick={addProxy}
        >
          添加代理
        </div>
      ) : null}
    </div>
  );
};

type HarListProps = {
  className?: string;
};
const HarList: FC<HarListProps> = ({ className }) => {
  /** ag-grid Ref */
  const gridRef = useRef<AgGridReact<any>>(null);

  /** 请求成功后 追加一条HAR记录 */
  const getHarList = async (request?: chrome.devtools.network.Request) => {
    if (!request) return;
    const currentHar = merge(request, generalAgGridId(request));
    const rowData = gridRef.current?.api.getGridOption('rowData');
    const newHarData = concat(rowData, currentHar);
    gridRef.current?.api.setGridOption('rowData', newHarData);
  };

  /** 进入时获取面板 HAR 数据 */
  const initGetHarList = async () => {
    const harLog = await getNetworkHAR();
    const reqList = map(harLog.entries, (el) => merge(el, generalAgGridId(el)));
    console.log(reqList, 'reqList');
    gridRef.current?.api.setGridOption('rowData', reqList);
  };

  const [dynamicRules, setDynamicRules] = useState<
    chrome.declarativeNetRequest.Rule[]
  >([]);
  /** 获取代理规则 */
  const getDynamicRules = async () => {
    const rules = await chrome.declarativeNetRequest.getDynamicRules();
    setDynamicRules(rules);
  };

  useEffect(() => {
    initGetHarList();
    getDynamicRules();
    chrome.devtools.network.onRequestFinished.addListener(getHarList);
    return () => {
      chrome.devtools.network.onRequestFinished.removeListener(getHarList);
    };
  }, []);

  const [selectProxyInfo, setSelectProxyInfo] = useState<{
    proxyList?: any[];
    proxyModal?: boolean;
    requestPath?: string;
  }>({});

  const selectProxy = async (requestPath: string, proxyList: any[]) => {
    setSelectProxyInfo({
      requestPath,
      proxyList,
      proxyModal: true,
    });
  };

  const colDefs = useMemo<ColDef[]>(() => {
    return [
      {
        field: 'request.url',
        headerName: 'Name',
        valueFormatter: urlValueFormat,
        filter: 'agTextColumnFilter',
      },
      {
        field: 'request.method',
        headerName: 'Method',
        cellRenderer: Method,
        filter: 'agTextColumnFilter',
      },
      {
        field: 'response.status',
        headerName: 'Status',
        filter: 'agNumberColumnFilter',
      },
      {
        field: '_resourceType',
        headerName: 'Type',
        filter: 'agTextColumnFilter',
      },
      {
        field: 'StartedDateTime',
        headerName: 'startedTime',
        valueFormatter: timeValueFormat,
      },
      {
        colId: 'Operate',
        headerName: 'Operate',
        cellRendererParams: { dynamicRules, selectProxy },
        cellRenderer: Operate,
      },
    ];
  }, [dynamicRules, selectProxy]);

  const getRowId = useCallback<Required<AgGridReactProps>['getRowId']>(
    ({ data }) => {
      const id = get(data, AG_GRID_ROW_KEY, getUuiD(10));
      return id;
    },
    [],
  );

  return (
    <div className={classNames(className, 'ag-theme-custom')}>
      <AgGridReact
        ref={gridRef}
        columnDefs={colDefs}
        autoSizeStrategy={{ type: 'fitGridWidth' }}
        getRowId={getRowId}
        suppressCellFocus={true}
        enableCellTextSelection={true}
      />
      <Modal
        title="Select Proxy"
        width={400}
        open={!!selectProxyInfo.proxyModal}
        onCancel={() => setSelectProxyInfo({ proxyModal: false })}
        footer={null}
        destroyOnClose
      >
        {selectProxyInfo.proxyModal ? (
          <SelectModal
            requestPath={selectProxyInfo.requestPath || ''}
            proxyList={selectProxyInfo.proxyList || []}
            onOpenChange={(proxyModal, isSubmit) => {
              if (isSubmit) getDynamicRules();
              setSelectProxyInfo({ proxyModal });
            }}
          />
        ) : null}
      </Modal>
    </div>
  );
};

export default HarList;
