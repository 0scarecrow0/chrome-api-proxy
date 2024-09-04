import {
  getNetworkHAR,
  getUuiD,
  timeValueFormat,
  urlValueFormat,
} from '@/utils';
import { ColDef } from 'ag-grid-community';
import { AgGridReact, AgGridReactProps } from 'ag-grid-react';
import { concat, get, map, merge } from 'lodash';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import './index.less';

const AG_GRID_ROW_KEY = '_ag_grid_id';
const generalAgGridId = (params?: chrome.devtools.network.HAREntry) => {
  if (!params) return;
  return {
    [AG_GRID_ROW_KEY]: `${getUuiD(10)}_${params?.connection}`,
  };
};

const InsertNode = () => {
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
        tooltipField: 'request.url',
      },
      { field: 'response.status', headerName: 'Status' },
      { field: '_resourceType', headerName: 'Type' },
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
    <div className="w-100% h-100% flex flex-col overflow-hidden">
      <div className="shrink-0 h-100 bg-blue">12312313</div>
      <div className="ag-theme-custom flex-1 m-12">
        <AgGridReact
          ref={gridRef}
          columnDefs={colDefs}
          tooltipShowDelay={0}
          tooltipHideDelay={1000}
          tooltipInteraction={true}
          autoSizeStrategy={{ type: 'fitGridWidth' }}
          getRowId={getRowId}
          onRowClicked={(params) => {
            console.log(params, 9000000);
          }}
        />
      </div>
    </div>
  );
};

export default InsertNode;
