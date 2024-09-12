import { useFetch } from '@/request';
import { useRequest } from 'ahooks';
import { Button, Form, FormProps, message, Select, Space, Spin } from 'antd';
import dayjs from 'dayjs';
import { find, get, merge } from 'lodash';
import { FC, useContext } from 'react';
import { DevToolsContext } from '../../../context';

interface SelectModalFormValue {
  selectId?: string;
}

interface SelectModalProps {
  requestPath: string;
  proxyList: any[];
  onOpenChange?: (open: boolean, isSubmit?: boolean) => void;
}

const SelectModal: FC<SelectModalProps> = ({
  proxyList,
  requestPath,
  onOpenChange,
}) => {
  const { yapiInfo } = useContext(DevToolsContext);
  const request = useFetch();

  const [form] = Form.useForm();
  const selectId = Form.useWatch('selectId', form);

  const getSelectedInfo = async () => {
    try {
      const findInfo = find(proxyList, { _id: selectId });
      const projectId = get(findInfo, 'projectId');
      const apiId = get(findInfo, '_id');
      if (findInfo) {
        const yapiPath = `${yapiInfo.url}/project/${projectId}/interface/api/${apiId}`;

        const projectInfo = await request(
          'get',
          `${yapiInfo.url}/api/project/get?id=${projectId}`,
        );
        const interfaceInfo = await request(
          'get',
          `${yapiInfo.url}/api/interface/get?id=${apiId}`,
        );

        const project_basePath = get(projectInfo, 'basepath');
        const project_name = get(projectInfo, 'name');
        const interface_userName = get(interfaceInfo, 'username');
        const interface_path = get(interfaceInfo, 'path');
        const mockPath = `${yapiInfo.url}/mock/${projectId}${project_basePath + interface_path}`;
        merge(findInfo, {
          project_basePath,
          project_name,
          interface_userName,
          interface_path,
          mockPath,
          yapiPath,
        });
      }
      return findInfo;
    } catch {
      return;
    }
  };

  const { data: selectedInfo, loading } = useRequest(getSelectedInfo, {
    refreshDeps: [proxyList, selectId],
  });

  const onFinish: FormProps<SelectModalFormValue>['onFinish'] = async () => {
    try {
      const mockPath = get(selectedInfo, 'mockPath');
      const rule_id = get(selectedInfo, '_id');

      const addRules: chrome.declarativeNetRequest.Rule[] = [
        {
          id: rule_id,
          action: {
            redirect: {
              regexSubstitution: `${mockPath}\\1`,
            },
            type: chrome.declarativeNetRequest.RuleActionType.REDIRECT,
          },
          condition: {
            regexFilter: `^${requestPath}(.*)`,
            resourceTypes: [
              chrome.declarativeNetRequest.ResourceType.XMLHTTPREQUEST,
            ],
          },
        },
      ];
      await chrome.declarativeNetRequest.updateDynamicRules({ addRules });
      onOpenChange?.(false, true);
    } catch (error) {
      message.error((error as any)?.message || '添加失败');
    }
  };

  return (
    <Form
      layout="vertical"
      form={form}
      requiredMark={false}
      initialValues={{ selectId: get(proxyList, '[0]._id') }}
      onFinish={onFinish}
    >
      <Form.Item<SelectModalFormValue>
        name="selectId"
        rules={[{ required: true, message: '请选择代理接口' }]}
      >
        <Select
          options={proxyList || []}
          fieldNames={{ label: 'title', value: '_id' }}
        />
      </Form.Item>

      {selectedInfo ? (
        <Spin spinning={loading}>
          <div className="p-12 rd-8 bg-#ecf0f1 mb-12 flex flex-col gap-8 text-12 c-#7f8c8d">
            <a
              className="hover-c-#e67e22 hover-underline cursor-pointer"
              href={selectedInfo.yapiPath}
              target="_blank"
            >
              {selectedInfo.yapiPath}
            </a>
            <div className="w-100% flex items-start">
              <div className="font-600 shrink-0 w-100">Id</div>
              <div className="c-#95a5a6 flex-1 w-0">{selectedInfo._id}</div>
            </div>
            <div className="w-100% flex items-start">
              <div className="font-600 shrink-0 w-100">Title</div>
              <div className="c-#95a5a6 flex-1 w-0">{selectedInfo.title}</div>
            </div>
            <div className="w-100% flex items-start">
              <div className="font-600 shrink-0 w-100">User Name</div>
              <div className="c-#95a5a6 flex-1 w-0">
                {selectedInfo.interface_userName}
              </div>
            </div>
            <div className="w-100% flex items-start">
              <div className="font-600 shrink-0 w-100">Project Id</div>
              <div className="c-#95a5a6 flex-1 w-0">
                {selectedInfo.projectId}
              </div>
            </div>
            <div className="w-100% flex items-start">
              <div className="font-600 shrink-0 w-100">Project Name</div>
              <div className="c-#95a5a6 flex-1 w-0">
                {selectedInfo.project_name}
              </div>
            </div>
            <div className="w-100% flex items-start">
              <div className="font-600 shrink-0 w-100">Add Time</div>
              <div className="c-#95a5a6 flex-1 w-0">
                {selectedInfo.addTime
                  ? dayjs
                      .unix(selectedInfo.addTime)
                      .format('YYYY-MM-DD HH:mm:ss')
                  : '-'}
              </div>
            </div>
            <div className="w-100% flex items-start">
              <div className="font-600 shrink-0 w-100">Up Time</div>
              <div className="c-#95a5a6 flex-1 w-0">
                {selectedInfo.upTime
                  ? dayjs
                      .unix(selectedInfo.upTime)
                      .format('YYYY-MM-DD HH:mm:ss')
                  : '-'}
              </div>
            </div>
            <div className="w-100% flex items-start">
              <div className="font-600 shrink-0 w-100">Request Path</div>
              <div className="c-#95a5a6 flex-1 w-0">{requestPath}</div>
            </div>
            <div className="w-100% flex items-start">
              <div className="font-600 shrink-0 w-100">Mock Path</div>
              <div className="c-#95a5a6 flex-1 w-0">
                {selectedInfo.mockPath}
              </div>
            </div>
          </div>
        </Spin>
      ) : null}

      <Form.Item className="text-center mb-0">
        <Space>
          <Button
            onClick={() => {
              onOpenChange?.(false, false);
            }}
          >
            取消
          </Button>
          <Button type="primary" htmlType="submit">
            确认
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default SelectModal;
