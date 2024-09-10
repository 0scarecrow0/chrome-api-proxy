import { ConfigProvider } from 'antd';
import CodeEdit from './components/CodeEdit';

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
      <div className="w-100% h-100% flex flex-col bg-#ecf0f1 overflow-hidden box-border">
        {/* <YApiInfo className="shrink-0" /> */}
        {/* <Divider className="shrink-0" style={{ margin: '12px 0 0 0' }} /> */}
        <CodeEdit className="flex-1 h-0 overflow-hidden" />
      </div>
    </ConfigProvider>
  );
};

export default InsertNode;
