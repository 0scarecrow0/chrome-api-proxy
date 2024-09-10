import { Button, Form, FormProps, Input } from 'antd';
import { FC } from 'react';

type FieldType = {
  url?: string;
};

interface SetDomainProps {
  value?: string;
  onChange?: (url?: string) => void;
}

const SetDomain: FC<SetDomainProps> = ({ value, onChange }) => {
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

  const onFinish: FormProps<FieldType>['onFinish'] = (values) => {
    const domain = getUrlDomain(values?.url);
    onChange?.(domain);
  };

  return (
    <Form initialValues={{ url: value }} onFinish={onFinish}>
      <Form.Item<FieldType>
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

export default SetDomain;
