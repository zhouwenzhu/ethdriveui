import React, { useState, useEffect } from 'react';
import { Button, Modal } from 'antd';
import { ConnectionRejectedError } from 'memouse-wallet';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import useMyWallet from '@/hooks/useMyWallet';
import { useErc20 } from '@/hooks/useContract';
import { ERC20Addr } from '@/constants/address';
import { shortenAddress } from '@/utils/index';

import {useApi,useStorage,useToken} from '@/hooks/useAppState';
// import { useTranslation } from 'react-i18next';
import './index.scss';


import { ethers } from 'ethers';
import { client, challenge, authenticate } from '@/lens/api';


const Web3Status: React.FC = () => {

  const Erc20 = useErc20(ERC20Addr);
  const wallet = useMyWallet();
  /// lens //////////////////////////////
  const API = useApi();
  const {setLensToken, memoToken, setMemoToken}= useToken();
  const {storage, setStorage} = useStorage();
  // const { t } = useTranslation();

  useEffect(() => {
    if (memoToken) {
      getStorage();
    } else {
      setStorage({});
    }
  }, [memoToken]);

  useEffect(() => {
    if (wallet.status === 'connected') {
      lensLogin();
    }
  }, [wallet.status]);

 /*
  const Loginmemo = ()=>{
    API.get('/getnonce')
    .then( (res) => {
      if (res && res.status == 200) {
       const sign =  {
        'address':wallet.account,
        'nonce':res.data,
        'domain':'memo.io'
        };
        API({
          method: 'POST',
          url:'/login',
          data:sign
        }).then((res) => {
          setMemoToken(res.data.accessToken);
          });
        }
    });
  };
  */

  const Login = (accessToken,signatureData,signature)=>{
    API({
          method: 'POST',
          url:'/lensLogin',
          data: {
            address: wallet.account,
            accessToken,
            signatureData,
            signature
          }
        }).then((res) => {
          setMemoToken(res.data.accessToken);
       });
  };

  async function lensLogin() {
    try {

      const challengeInfo = await client.query({
        query: challenge,
        variables: { address: wallet.account }
      });
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      console.log({text:challengeInfo.data.challenge.text});
      console.log('text', challengeInfo.data.challenge.text);
      const signature = await signer.signMessage(challengeInfo.data.challenge.text);
      /* authenticate the user */
      console.log('signature', signature);
      const authData = await client.mutate({
        mutation: authenticate,
        variables: {
          address: wallet.account, signature
        }
      });
      /* if user authentication is successful, you will receive an accessToken and refreshToken */
      const { data: { authenticate: { accessToken }}} = authData;
      console.log({ accessToken });
      setLensToken(accessToken);
      Login(accessToken,challengeInfo.data.challenge.text,signature);
    } catch (err) {
      console.log('Error signing in: ', err);
    }
  }
  // 获取存储空间 Used Available Free Files
  const getStorage = ()=>{
    API.get('mefs/storage')
    .then(function (res){
      if (res && res.status == 200) {
            setStorage(res.data);
        } else {
          setStorage({});
        }
    });
};
  /// lens //////////////////////////////

  const handleBalance = async () => {
    if (!Erc20) return;
    const rewardAmount = await Erc20.methods.balanceOf(wallet.account).call();
    if (rewardAmount) {
     
    }
  };
  useEffect(() => {
    if (wallet.isConnected) {
      handleBalance();
    }

  }, [wallet.chainId, wallet.account, wallet.isConnected]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const showModal = () => {
    setIsModalOpen(true);
  };

  const disconnect = () => {
    wallet.reset();
    setIsModalOpen(false);
  };
  // const guanbi = () => {
  //   setIsModalOpen(false);
  // };
  const handleCancel = () => {
    setIsModalOpen(false);
  };
  const copyTranslateResult = () => {
    console.log('复制成功');
  };

  const activate = (connector) => {
    wallet.connect(connector);
  };
  return (
    <>
      {(() => {
        if (wallet.error?.name) {
          return (
            <div className="connecting">
              <span className="connecting-walletError">
                {wallet.error instanceof ConnectionRejectedError
                  ? 'Connection error: the user rejected the action' : wallet.error.name
                }
              </span>
              <Button
                size="large"
                type="primary"
                onClick={() => wallet.reset()}
              >
                重连钱包
              </Button>
            </div>
          );
        }

        if (wallet.status === 'connecting') {
          return (
            <div className="connecting">
              <span className="connecting-text">
                Connecting to {wallet.connector}...
              </span>
              <Button
                size="large"
                type="primary"
                onClick={() => wallet.reset()}
              >
                取消连接
              </Button>
            </div>
          );
        }

        if (wallet.status === 'connected') {
          return (
            <div className="walletAccount">
              <Button type="primary"
                size="large"
                onClick={showModal}
              >
                {shortenAddress(wallet.account, 2, 2)}
              </Button>
            </div>
          );
        }

        return (
          <Button type="primary"
            size="large"
            className="connect"
            onClick={() => activate('injected')}
          >
            连接到钱包
          </Button>
        );
      })()}
      <Modal
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
      >
        <div className="WalletContent_address">
          <div className="off">
            <CopyToClipboard text={wallet.account}
              onCopy={() => copyTranslateResult()}
            >
              <span className="iconfont icon-copy-template" />
            </CopyToClipboard>
          </div>
          <div className="off"
            onClick={() => disconnect()}
          >
            <span className="iconfont icon-guanbi"></span>
          </div>
          {/* <div className=" off"
            onClick={() => guanbi()}
          >
            <span className="iconfont icon-guanbi"></span>
          </div> */}
        </div>
        <div className="WalletModification">
          <div className="WalletContent">
            <p>MEMO</p>
          </div>
          <div className="SharePaste">
            <h3 >{shortenAddress(wallet.account)}</h3>

          </div>

          <div className="WalletContent_wallet">
            {/* <div><p>CMEMO：</p><a>{toSpecialAmount(wallet.balance)}</a></div>
            <div><p>MEMO：</p><a>{memo}</a></div> */}
            <div><p>Used:</p><a>{storage.Used}</a></div>
            <div><p>Free:</p><a>{storage.Free}</a></div>
            {/* <div><p>语言</p><a onClick={() => t.changeLanguage(t.language === 'en' ? 'zh-CN' : 'en')}>
            {t('')}
            </a></div> */}
          </div>
        </div>
      </Modal>
    </>
  );
};

export default Web3Status;