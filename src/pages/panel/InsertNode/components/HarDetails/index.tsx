import { getMethodCof } from '@/enum';
import { CaretRightOutlined } from '@ant-design/icons';
import { Collapse, CollapseProps, Drawer, DrawerProps, Tag } from 'antd';
import { CSSProperties, FC, useMemo } from 'react';

interface HarDetailsProps extends DrawerProps {
  onOpenChange?: (open: boolean) => void;
  harDetails?: HAREntry;
}

const HarDetails: FC<HarDetailsProps> = ({
  open,
  onOpenChange,
  harDetails,
}) => {
  const pathName = useMemo(() => {
    if (harDetails?.request.url) {
      const url = new URL(harDetails?.request.url);
      return url.pathname;
    }
    return 'url not found';
  }, [harDetails]);

  const methodCof = useMemo(() => {
    return getMethodCof(harDetails?.request.method);
  }, [harDetails]);

  const DrawerHeader = () => {
    return (
      <div className="w-100% h-100% flex items-center overflow-hidden">
        <div className="shrink-0 mr-8">
          {methodCof ? (
            <Tag color={methodCof.tagColor}>{methodCof.label}</Tag>
          ) : null}
        </div>
        <div className="flex-1 w-0 line-clamp-1">{pathName}</div>
      </div>
    );
  };

  const getItems: (panelStyle: CSSProperties) => CollapseProps['items'] = (
    panelStyle,
  ) => [
    {
      key: 'General',
      label: 'Request General',
      style: panelStyle,
      children: <p>123</p>,
    },
    {
      key: '2',
      label: 'This is panel header 2',
      children: <p>123</p>,
      style: panelStyle,
    },
    {
      key: '3',
      label: 'This is panel header 3',
      children: <p>123</p>,
      style: panelStyle,
    },
  ];

  const panelStyle: React.CSSProperties = {
    marginBottom: 12,
    background: '#ecf0f1',
    borderRadius: 8,
    border: 'none',
  };

  return (
    <Drawer
      open={open}
      onClose={() => onOpenChange?.(false)}
      title={<DrawerHeader />}
      width={'70%'}
      mask={false}
    >
      <Collapse
        bordered={false}
        className="bg-white"
        defaultActiveKey={['1']}
        expandIcon={({ isActive }) => (
          <CaretRightOutlined rotate={isActive ? 90 : 0} />
        )}
        items={getItems(panelStyle)}
      />
    </Drawer>
  );
};

export default HarDetails;
