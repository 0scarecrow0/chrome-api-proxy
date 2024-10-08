import { isValidJson, JsonParse } from '@/utils';
import { EditOutlined, SaveOutlined } from '@ant-design/icons';
import { json, jsonParseLinter } from '@codemirror/lang-json';
import { linter, lintGutter } from '@codemirror/lint';
import { dracula } from '@uiw/codemirror-theme-dracula';
import CodeMirror from '@uiw/react-codemirror';
import { Button, message, notification, Tooltip } from 'antd';
import classNames from 'classnames';
import { filter, get, map, union } from 'lodash';
import { FC, useEffect, useMemo, useState } from 'react';

type CodeEditProps = {
  className?: string;
};

const CodeEdit: FC<CodeEditProps> = ({ className }) => {
  const [api, contextHolder] = notification.useNotification({
    duration: 3,
    showProgress: true,
  });

  const [isEdit, setIsEdit] = useState(false);

  const [rulesKey, setRulesKey] = useState<number[]>([]);

  const [codeValue, setCodeValue] = useState(
    JSON.stringify({ rules: [] }, null, 2),
  );

  const saveDynamicRules = async () => {
    const rulesJson = JsonParse(codeValue);
    const addRules = filter(get(rulesJson, 'rules'), 'id');
    const addRulesKeys = map(get(rulesJson, 'rules'), 'id');
    const removeRuleIds = union(rulesKey, addRulesKeys);
    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds,
      addRules,
    });
  };

  const getDynamicRules = async () => {
    const rules = await chrome.declarativeNetRequest.getDynamicRules();
    if (rules.length) {
      const formatRules = JSON.stringify({ rules }, null, 2);
      setCodeValue(formatRules);
    }
  };

  useEffect(() => {
    getDynamicRules();
  }, []);

  const btnConfig = useMemo(() => {
    if (isEdit) {
      return {
        tooltipTitle: '保存规则',
        type: 'primary',
        icon: <SaveOutlined />,
      };
    }
    return {
      tooltipTitle: '编辑规则',
      icon: <EditOutlined />,
    };
  }, [isEdit]);

  const btnClick = async () => {
    const isJson = isValidJson(codeValue);
    if (!isJson) {
      throw new Error('The current code is not a valid JSON');
    }
    if (!isEdit) {
      const rulesJson = JsonParse(codeValue);
      const keys = map(get(rulesJson, 'rules'), 'id');
      setRulesKey(keys);
      setIsEdit(true);
      return;
    }

    try {
      await saveDynamicRules();
      message.success('规则保存成功！');
      setIsEdit(false);
    } catch (error) {
      api.open({
        message: 'Save failed',
        description: String(error),
      });
    }
  };

  return (
    <div className={classNames(className, 'flex flex-col p-12')}>
      <div className="shrink-0 mb-8 flex justify-between items-center">
        <div className="c-#2c3e50">
          规格配置参考：
          <a
            href="https://developer.chrome.com/docs/extensions/reference/api/declarativeNetRequest?hl=zh-cn#type-Rule"
            target="_blank"
            className="c-#3498db"
          >
            declarativeNetRequest-rule
          </a>
        </div>
        <div>
          <Tooltip title={btnConfig.tooltipTitle} placement="left">
            <Button
              size="small"
              type={btnConfig?.type as any}
              icon={btnConfig.icon}
              onClick={btnClick}
            />
          </Tooltip>
        </div>
      </div>
      <CodeMirror
        className="flex-1 h-0 overflow-y-auto"
        theme={dracula}
        readOnly={!isEdit}
        extensions={[linter(jsonParseLinter()), json(), lintGutter()]}
        value={codeValue}
        onChange={setCodeValue}
      />
      {contextHolder}
    </div>
  );
};

export default CodeEdit;
