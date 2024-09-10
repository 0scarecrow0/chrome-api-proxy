import defaultAvatar from '@/assets/img/26.png';
import { BASE_URL_STORAGE_KEY } from '@/enum';
import { getLocalStorage } from '@/utils';
import { Avatar } from 'antd';
import classNames from 'classnames';
import { FC, useEffect, useMemo, useState } from 'react';

type YApiInfoProps = {
  className?: string;
};

const YApiInfo: FC<YApiInfoProps> = ({ className }) => {
  const [userInfo, setUserInfo] = useState({ avatar: '' });

  const [baseUrl, setBaseUrl] = useState('');

  const getYApiBaseUrl = async () => {
    const url = await getLocalStorage(BASE_URL_STORAGE_KEY);
    setBaseUrl(url);
  };

  useEffect(() => {
    getYApiBaseUrl();
    setUserInfo({ avatar: '' });
  }, []);

  const avatarImage = useMemo(() => {
    return userInfo?.avatar || defaultAvatar;
  }, [userInfo]);

  return (
    <div className={classNames(className, 'p-12 pb-0')}>
      <div>
        <Avatar src={<img src={avatarImage} alt="avatar" />} />
      </div>

      {baseUrl ? <div>123</div> : <div>456</div>}
    </div>
  );
};

export default YApiInfo;
