import classNames from 'classnames';
import { FC } from 'react';

type YApiInfoProps = {
  className?: string;
};

const YApiInfo: FC<YApiInfoProps> = ({ className }) => {
  return <div className={classNames(className)}>1232</div>;
};

export default YApiInfo;
