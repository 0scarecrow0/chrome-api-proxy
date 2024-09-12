import { YAPI_INFO_STORAGE_KEY } from '@/enum';
import { useFetch } from '@/request';
import { setLocalStorage } from '@/utils';
import { EditOutlined, LoginOutlined, ReloadOutlined } from '@ant-design/icons';
import { Button, Image, Modal, Tooltip } from 'antd';
import classNames from 'classnames';
import { get } from 'lodash';
import { FC, useContext, useEffect, useMemo, useState } from 'react';
import { DevToolsContext } from '../../context';
import SetInfo from './SetInfo';

interface UserInfo {
  /** 添加时间 */
  add_time?: number;
  /** 电子邮件 */
  email?: string;
  /** 角色 */
  role?: string;
  /** 用户名称 */
  username?: string;
  /** 用户id */
  _id?: string;
}

type YApiInfoProps = {
  className?: string;
};

const YApiInfo: FC<YApiInfoProps> = ({ className }) => {
  const request = useFetch();
  const { yapiInfo } = useContext(DevToolsContext);

  const [yapiInfoModal, setYapiInfoModal] = useState(false);

  const [userInfo, setUserInfo] = useState<UserInfo>();

  const updateYapiStatus = async () => {
    const domain = get(yapiInfo, 'url');
    if (!domain) {
      setUserInfo(undefined);
      return;
    }
    try {
      const user = await request('get', `${domain}/api/user/status`);
      setUserInfo(user);
    } catch {
      setUserInfo(undefined);
    }
  };

  const loginYapi = async () => {
    const domain = get(yapiInfo, 'url');
    if (!domain) return;
    chrome.tabs.create({ url: domain });
  };

  useEffect(() => {
    updateYapiStatus();
  }, [yapiInfo.url]);

  const userAvatar = useMemo(() => {
    if (userInfo?._id && yapiInfo.url) {
      return `${yapiInfo.url}/api/user/avatar?uid=${userInfo._id}`;
    }
    return;
  }, [userInfo, yapiInfo]);

  return (
    <div className={classNames(className, 'p-12 pb-0')}>
      <div className="flex items-center">
        <Image
          width={88}
          src={userAvatar}
          preview={false}
          fallback="/Logo.png"
        />
        <div className="flex flex-col gap-8 ml-8">
          <div className="flex items-center c-#2c3e50">
            <div className="w-80 mr-12 font-600">Yapi Domain</div>
            <div
              className={classNames(
                'flex items-center cursor-pointer group hover-c-#e67e22',
                yapiInfo.url ? '' : 'c-#95a5a6',
              )}
              onClick={() => {
                setYapiInfoModal(true);
              }}
            >
              {yapiInfo.url || 'Set Yapi Domain'}
              <EditOutlined className="ml-4 hidden group-hover-block" />
            </div>
          </div>
          {!yapiInfo.url ? null : userInfo ? (
            <>
              <div className="flex items-center c-#2c3e50">
                <div className="w-80 mr-12 font-600">User Name</div>
                <div className="flex items-center">
                  {userInfo.username || '-'}
                </div>
              </div>
              <div className="flex items-center c-#2c3e50">
                <div className="w-80 mr-12 font-600">User Email</div>
                <div className="flex items-center">{userInfo.email || '-'}</div>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-4">
              <div className="c-#e74c3c">未检测到登录信息</div>
              <Tooltip placement="top" title="更新登录状态">
                <Button
                  size="small"
                  icon={<ReloadOutlined />}
                  onClick={updateYapiStatus}
                />
              </Tooltip>
              <Tooltip placement="top" title="去登录">
                <Button
                  size="small"
                  type="primary"
                  icon={<LoginOutlined />}
                  onClick={loginYapi}
                />
              </Tooltip>
            </div>
          )}
        </div>
      </div>

      <Modal
        title="Set Yapi Domain"
        width={420}
        open={yapiInfoModal}
        onCancel={() => setYapiInfoModal(false)}
        destroyOnClose
        footer={null}
      >
        {yapiInfoModal ? (
          <SetInfo
            value={yapiInfo}
            onChange={async (info = {}) => {
              await setLocalStorage(YAPI_INFO_STORAGE_KEY, info);
              setYapiInfoModal(false);
            }}
          />
        ) : null}
      </Modal>
    </div>
  );
};

export default YApiInfo;
