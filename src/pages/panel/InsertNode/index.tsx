import { ConfigProvider, Divider } from 'antd';
import HarList from './components/HarList';
import YApiInfo from './components/YApiInfo';
import './index.less';

const InsertNode = () => {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: 'coral',
          borderRadius: 8,
        },
      }}
    >
      <div className="w-100% h-100% flex flex-col overflow-hidden">
        <YApiInfo className="shrink-0 mb-12" />
        <Divider className="shrink-0" style={{ margin: 0 }} />
        <HarList className="flex-1 m-12" />
      </div>
    </ConfigProvider>
  );
};

export default InsertNode;
