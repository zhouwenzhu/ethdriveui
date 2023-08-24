import React from 'react';
// import NetworkSelector from '@/components/Header/components/NetworkSelector';
import { useNavigate } from 'react-router-dom';
import Web3Status from '@/components/Header/components/Web3Status';
import RechargeUpload from '@/components/Header/components/RechargeUpload';
import LanguageSwitching from '@/components/Header/components/LanguageSwitching';
import logo from '@/assets/images/logo.png';
import { useTranslation } from 'react-i18next';
import './index.scss';

const HeaderPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const goRecharge = () => {
    navigate('/Pay');
  };
  const goHome = () => {
    navigate('/');
  };
  return (
    <>
      <div className="HeaderPage">
        <div className="head">
          <div className="container">
            <div className="head-left">
              <div><img src={logo} /></div>
              <ul>

                <li onClick={goHome}
                  className="Top"
                >{t('Upload')}</li>
                <li
                  onClick={goRecharge}
                  className="Files"
                >{t('Top-up')}</li>
              </ul>
            </div>
            <div className="head-right">
              <RechargeUpload />
              {/* <NetworkSelector/> */}
              <Web3Status />
              <LanguageSwitching/>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HeaderPage;