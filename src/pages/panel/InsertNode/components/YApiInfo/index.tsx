import { BASE_URL_STORAGE_KEY } from '@/enum';
import { getLocalStorage, setLocalStorage } from '@/utils';
import { EditOutlined } from '@ant-design/icons';
import { useSetState } from 'ahooks';
import { Avatar, Modal } from 'antd';
import classNames from 'classnames';
import { FC, useEffect, useState } from 'react';
import SetDomain from './SetDomain';

interface DomainInfo {
  baseUrl?: string;
  modalOpen?: boolean;
}

type YApiInfoProps = {
  className?: string;
};

const YApiInfo: FC<YApiInfoProps> = ({ className }) => {
  const [domainInfo, setDomainInfo] = useSetState<DomainInfo>({});

  const [userInfo, setUserInfo] = useState({ avatar: '' });

  const getYApiBaseUrl = async () => {
    const baseUrl = await getLocalStorage(BASE_URL_STORAGE_KEY);
    setDomainInfo({ baseUrl });
  };

  const setYApiBaseUrl = async (url?: string) => {
    if (!url) return;
    await setLocalStorage(BASE_URL_STORAGE_KEY, url);
    getYApiBaseUrl();
  };

  useEffect(() => {
    getYApiBaseUrl();

    setUserInfo({ avatar: '' });
  }, []);

  return (
    <div className={classNames(className, 'p-12 pb-0')}>
      <div className="flex items-center">
        <Avatar
          size={88}
          src={<img src={userInfo?.avatar || '/Logo.png'} alt="avatar" />}
        />
        <div className="flex flex-col gap-8 ml-8">
          <div className="flex items-center c-#2c3e50">
            <div className="w-100 mr-12 text-right font-600">Yapi domain</div>
            <div
              className={classNames(
                'flex items-center cursor-pointer group',
                domainInfo.baseUrl ? '' : 'c-#95a5a6',
              )}
            >
              {domainInfo.baseUrl || 'set Yapi domain'}
              <EditOutlined
                className="ml-4 hidden group-hover-block group-hover-c-#2980b9"
                onClick={() => {
                  setDomainInfo({ modalOpen: true });
                }}
              />
            </div>
          </div>

          <div>456</div>
          <div>789999</div>
        </div>
      </div>

      <Modal
        title="Set Yapi Domain"
        width={420}
        open={domainInfo.modalOpen}
        onCancel={() => setDomainInfo({ modalOpen: false })}
        destroyOnClose
        footer={null}
      >
        {domainInfo.modalOpen ? (
          <SetDomain
            value={domainInfo.baseUrl}
            onChange={(baseUrl) => {
              setYApiBaseUrl(baseUrl);
              setDomainInfo({ modalOpen: false });
            }}
          />
        ) : null}
      </Modal>
    </div>
  );
};

export default YApiInfo;
