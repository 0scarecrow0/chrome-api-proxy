import { getMethodCof } from '@/enum';
import { useFetch } from '@/request';
import { getNetworkHAR, getUuiD, parseUrl, timeValueFormat } from '@/utils';
import { ColDef } from 'ag-grid-community';
import {
  AgGridReact,
  AgGridReactProps,
  CustomCellRendererProps,
} from 'ag-grid-react';
import { message, Modal, Tag } from 'antd';
import classNames from 'classnames';
import {
  concat,
  drop,
  filter,
  findIndex,
  get,
  isArray,
  join,
  map,
  merge,
  orderBy,
  pick,
  set,
  split,
  uniqBy,
} from 'lodash';
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

type HarType = chrome.devtools.network.HAREntry;

const HarMap = (har: HarType) => {
  const method = get(har, 'request.method');
  const status = get(har, 'response.status');
  const startedTime = get(har, 'startedDateTime');
  const connection = get(har, 'connection');
  const _resourceType = get(har, '_resourceType');
  const urlInfo = parseUrl(get(har, 'request.url'));
  if (!urlInfo || _resourceType !== 'xhr') return {};
  const url = urlInfo?.origin + urlInfo?.pathname;
  return {
    url,
    method,
    status,
    startedTime,
    urlInfo,
    [AG_GRID_ROW_KEY]: `${getUuiD(10)}_${connection}`,
  };
};

type ListItemType = ReturnType<typeof HarMap>;

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

  const redirectURL = get(params.data, 'response.redirectURL');

  const addProxy = async () => {
    const domain = get(yapiInfo, 'url');
    if (!domain) {
      message.error('Please set up Yapi Domain first.');
      return;
    }

    const requestUrl = get(params.data, 'url');
    const pathname = get(params.data, 'urlInfo.pathname');

    /** 因为 yapi 项目中可以设置“接口基本路径”导致，查询不出，所以默认查询时候，减去一层路径 */
    const pathnameList = split(pathname, '/');
    const covPathName =
      pathnameList.length > 2 ? join(drop(pathnameList, 2), '/') : pathname;

    const searchData = await request(
      'get',
      `${domain}/api/project/search?q=${covPathName}`,
    );

    const interfaceList: any[] = get(searchData, 'interface') || [];
    if (!isArray(interfaceList) || !interfaceList.length) {
      message.error('未查询到接口');
      return;
    }
    params.selectProxy?.(requestUrl, interfaceList);
  };

  const addIsShow = useMemo(() => {
    return !redirectURL;
  }, [redirectURL]);

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

  /**
   * @description 请求成功后 追加一条HAR记录
   * @description 1.通过 url 查看列表中是否已存在当前数据
   * @description 2.如果存在 找到该条数据的ID，与当前数据进行合并，保持ID不变
   * @description 3.如果不存在则直接追加
   * @description 4.追加前过滤掉url不存在的数据
   */
  const getHarList = async (request?: HarType) => {
    if (!request) return;
    const currentHar = HarMap(request);
    const rowData = gridRef.current?.api.getGridOption(
      'rowData',
    ) as ListItemType[];
    let mergeList: ListItemType[] = [];
    const index = findIndex(rowData, { url: currentHar?.url });
    if (index >= 0) {
      const rowIdObj = pick(get(rowData, `[${index}]`), AG_GRID_ROW_KEY);
      const setRow = merge(currentHar, rowIdObj);
      set(rowData, index, setRow);
      mergeList = [];
    } else {
      mergeList = [currentHar];
    }
    const filterData = filter(concat(rowData, mergeList), 'url');
    gridRef.current?.api.setGridOption('rowData', filterData);
  };

  /**
   * @description: 首次进入面板时获取 HAR 数据
   */
  const initGetHarList = async () => {
    const harLog = await getNetworkHAR();
    console.log('harLog--->', harLog);
    const reqList = filter(map(harLog.entries, HarMap), 'url');
    // 先根据请求时间升序，再去重
    const newReqList = uniqBy(
      orderBy(reqList, ['startedTime'], ['desc']),
      'url',
    );
    gridRef.current?.api.setGridOption('rowData', newReqList);
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
        field: 'urlInfo.pathname',
        headerName: 'Name',
        filter: 'agTextColumnFilter',
        tooltipField: 'urlInfo.pathname',
        flex: 1,
      },
      {
        field: 'method',
        headerName: 'Method',
        cellRenderer: Method,
        filter: 'agTextColumnFilter',
        width: 100,
      },
      {
        field: 'status',
        headerName: 'Status',
        filter: 'agNumberColumnFilter',
        width: 100,
      },
      {
        field: 'startedTime',
        headerName: 'startedTime',
        valueFormatter: timeValueFormat,
        width: 100,
        enableCellChangeFlash: true,
      },
      {
        colId: 'Operate',
        headerName: 'Operate',
        cellRendererParams: { dynamicRules, selectProxy },
        cellRenderer: Operate,
        width: 100,
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
        tooltipShowDelay={0}
        tooltipShowMode="whenTruncated"
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
