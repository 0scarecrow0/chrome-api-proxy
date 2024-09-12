import { Button, Form, FormProps, Select, Space } from 'antd';
import dayjs from 'dayjs';
import { find, get } from 'lodash';
import { FC, useMemo } from 'react';

interface SelectModalFormValue {
  selectId?: string;
}

interface SelectModalProps {
  proxyList: any[];
  onOpenChange?: (open: boolean, isSubmit?: boolean) => void;
}

const SelectModal: FC<SelectModalProps> = ({ proxyList, onOpenChange }) => {
  const [form] = Form.useForm();
  const selectId = Form.useWatch('selectId', form);

  const selectedInfo = useMemo(() => {
    return find(proxyList, { _id: selectId });
  }, [proxyList, selectId]);

  console.log(selectedInfo, 80000000);

  const onFinish: FormProps<SelectModalFormValue>['onFinish'] = (values) => {
    // const domain = getUrlDomain(values?.url);
    // set(values, 'url', domain);
    // onChange?.(values)

    console.log(values, 90000000);
    // onOpenChange?.(false, true)
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
        <div className="p-12 rd-8 bg-#ecf0f1 mb-12 flex flex-col gap-8 text-12 c-#7f8c8d">
          <div className="w-100% flex items-center">
            <div className="font-600 shrink-0 w-100">id</div>
            <div className="c-#95a5a6 flex-1">{selectedInfo._id}</div>
          </div>
          <div className="w-100% flex items-center">
            <div className="font-600 shrink-0 w-100">title</div>
            <div className="c-#95a5a6 flex-1">{selectedInfo.title}</div>
          </div>
          <div className="w-100% flex items-center">
            <div className="font-600 shrink-0 w-100">projectId</div>
            <div className="c-#95a5a6 flex-1">{selectedInfo.projectId}</div>
          </div>
          <div className="w-100% flex items-center">
            <div className="font-600 shrink-0 w-100">addTime</div>
            <div className="c-#95a5a6 flex-1">
              {selectedInfo.addTime
                ? dayjs.unix(selectedInfo.addTime).format('YYYY-MM-DD HH:mm:ss')
                : '-'}
            </div>
          </div>
          <div className="w-100% flex items-center">
            <div className="font-600 shrink-0 w-100">upTime</div>
            <div className="c-#95a5a6 flex-1">
              {selectedInfo.upTime
                ? dayjs.unix(selectedInfo.upTime).format('YYYY-MM-DD HH:mm:ss')
                : '-'}
            </div>
          </div>
        </div>
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
