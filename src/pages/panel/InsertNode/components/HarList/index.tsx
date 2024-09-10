import { getMethodCof } from '@/enum';
import {
  getNetworkHAR,
  getUuiD,
  timeValueFormat,
  urlValueFormat,
} from '@/utils';
import { ColDef } from 'ag-grid-community';
import {
  AgGridReact,
  AgGridReactProps,
  CustomCellRendererProps,
} from 'ag-grid-react';
import { Tag } from 'antd';
import classNames from 'classnames';
import { concat, get, map, merge } from 'lodash';
import { FC, useCallback, useEffect, useMemo, useRef } from 'react';

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

  useEffect(() => {
    initGetHarList();
    chrome.devtools.network.onRequestFinished.addListener(getHarList);
    return () => {
      chrome.devtools.network.onRequestFinished.removeListener(getHarList);
    };
  }, []);

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
        field: 'startedDateTime',
        headerName: 'startedTime',
        valueFormatter: timeValueFormat,
      },
    ];
  }, []);

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
    </div>
  );
};

export default HarList;
