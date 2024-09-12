import { Button, Form, FormProps, Input } from 'antd';
import { set } from 'lodash';
import { FC } from 'react';
import { YapiInfo } from '../../../type';

interface SetInfoProps {
  value?: YapiInfo;
  onChange?: (url?: YapiInfo) => void;
}

const SetInfo: FC<SetInfoProps> = ({ value, onChange }) => {
  const getUrlDomain = (url?: string) => {
    try {
      if (!url) return '';
      const urlInfo = new URL(url);
      const fullPath = `${urlInfo.protocol}//${urlInfo.hostname}${urlInfo.port ? ':' + urlInfo.port : ''}`;
      return fullPath;
    } catch {
      return '';
    }
  };

  const onFinish: FormProps<YapiInfo>['onFinish'] = (values) => {
    const domain = getUrlDomain(values?.url);
    set(values, 'url', domain);
    onChange?.(values);
  };

  return (
    <Form
      layout="vertical"
      requiredMark={false}
      initialValues={value || {}}
      onFinish={onFinish}
    >
      <Form.Item<YapiInfo>
        label="Yapi Domain"
        name="url"
        rules={[
          { required: true, message: 'Please input your yapi domain' },
          { type: 'url', message: 'Please enter the correct domain name' },
        ]}
      >
        <Input />
      </Form.Item>

      <Form.Item className="text-center mb-0">
        <Button type="primary" htmlType="submit">
          Submit
        </Button>
      </Form.Item>
    </Form>
  );
};

export default SetInfo;
