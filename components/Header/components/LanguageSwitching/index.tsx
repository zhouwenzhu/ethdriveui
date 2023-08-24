import React from 'react';
import { useTranslation } from 'react-i18next';
import './index.scss';

function LanguageSwitching() {
  const {i18n} = useTranslation();
  return (
    <div className="Languag"
      onClick={() => i18n.changeLanguage(i18n.language === 'en' ? 'zh-CN' : 'en')}
    >
      {i18n.language === 'en' ?
        <span className="iconfont icon-zhongyingwenqiehuan-yingwen"/>
      :
      <span className="iconfont icon-zhongyingwenqiehuan-zhongwen"/>
}
    </div>
  );
}

export default LanguageSwitching;
