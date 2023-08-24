import React, { useState, useEffect } from 'react';
import { Button, Modal ,Avatar,Progress} from 'antd';
import { ConnectionRejectedError } from 'memouse-wallet';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import useMyWallet from '@/hooks/useMyWallet';
import { useErc20 } from '@/hooks/useContract';
import { ERC20Addr } from '@/constants/address';
import { shortenAddress } from '@/utils/index';
import { toSpecialAmount, sizeTostr } from '@/utils/amount';
import { UserOutlined } from '@ant-design/icons';
// import { useTranslation } from 'react-i18next';
import './index.scss';

import {useApi,useStorage,useToken} from '@/hooks/useAppState';

import { ethers } from 'ethers';
import { client, challenge, authenticate } from '@/lens/api';
// import { onError } from '@apollo/client/link/error';


const Web3Status: React.FC = () => {
  const [memo, setMemo] = useState(0);
  const [disSize, setDisSize] = useState('');
  //空间内容多少
  const [preSize, setPreSize] = useState(0);
  const Erc20 = useErc20(ERC20Addr);
  const wallet = useMyWallet();
  // const { t } = useTranslation();


 /// lens //////////////////////////////
 const API = useApi();
 const { setLensToken, memoToken, setMemoToken}= useToken(); // lensToken,
 const {storage, setStorage} = useStorage();
 // const { t } = useTranslation();
 useEffect(() => {

  if (storage.Used) {
    const disSize = sizeTostr(Number(storage.Used) || 0)+'/'+sizeTostr(Number(storage.Free) +Number(storage.Available) || 0);
    setPreSize(Number(storage.Used)/(Number(storage.Free) +Number(storage.Available) || 100000000));
    setDisSize(disSize);
  } else {
    setPreSize(0);
    setDisSize('');
  }
}, [storage]);

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

 useEffect(() => {
  if (wallet.status !== 'connected') {
    activate('injected');
  }
}, []);



 const Login = (signatureData,signature)=>{
   API({
         method: 'POST',
         url:'lens/login',
         data: {
           // address: wallet.account,
           // accessToken,
           message:signatureData,
           signature
         }
       }).then((res) => {
         console.log(res.data);
         setMemoToken(res.data['access token']);
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

    // console.log({text:challengeInfo.data.challenge.text});
    // console.log('text', challengeInfo.data.challenge.text);
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
     // console.log({ accessToken });
     setLensToken(accessToken);
     Login(challengeInfo.data.challenge.text,signature);
   } catch (err) {
     console.log('Error signing in: ', err);
   }
 }
 // 获取存储空间 Used Available Free Files
 const getStorage = ()=>{
   API.get('mefs/storage')
   .then(function (res){
    console.log(res);
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
      setMemo(toSpecialAmount(rewardAmount));
    }
  };
  useEffect(() => {
    if (wallet.isConnected) {
      handleBalance();
    }

  }, [wallet.chainId, wallet.account, wallet.isConnected]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpen1, setIsModalOpen1] = useState(false);
  const [isModalOpen2, setIsModalOpen2] = useState(false);
  const [isModalOpen3,setIsModalOpen3] = useState(false);
  const showModal = () => {
    setIsModalOpen(true);
  };
  const showMod = () =>{
    setIsModalOpen1(false);
    setIsModalOpen2(true);
  };
  const showModa =()=>{
    setIsModalOpen1(true);
    setIsModalOpen2(false);
  };
  //调签名
  const showMo= () =>{
    setIsModalOpen2(false);
    if (wallet.status !== 'connected') {
      activate('injected');
    }
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
    setIsModalOpen1(false);
    setIsModalOpen2(false);
    setIsModalOpen3(false);
  };
  const handleCance =() =>{
    setIsModalOpen3(false);
    activate('injected');
  };
  const copyTranslateResult = () => {
    console.log('复制成功');
  };
  const handleOk = () => {
    setIsModalOpen1(false);
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
              <Progress percent={preSize} format={() => disSize} />
              <div
                className="walletAccountDiv"
                onClick={showModal}
              >
               {memoToken? 'LogOut': 'LogIn'}|{shortenAddress(wallet.account, 2, 2)}
              </div>
            </div>
          );
        }

        return (
          <div>
          {/* <Button type="primary"
            size="large"
            className="connect"
            onClick={() => activate('injected')}
          >
            连接到钱包
          </Button> */}
            <Button
              type="primary"
              size="large"
              shape="round"
              className="connect"
              onClick={showModa}
            >
            Login
          </Button>
          </div>
        );
      })()}

      <Modal title="Login"
        open={isModalOpen1}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={null}
        closable={false}
        style={{ top: 180 }}
        >
        <h5>Connect yout wallet</h5>
        <p>Connect with one of out avallable wallet providers or create a new one.</p>
        <Button block style={{textAlign:'left'}} onClick={showMod}>Browser Wallet</Button>
      </Modal>



      <Modal title="Login"
        open={isModalOpen2}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={null}
        closable={false}
        style={{ top: 180 }}
        >
        <h5>Please sign the message</h5>
        <p>Lenster uses this signature to verify that you re the owner of this address.</p>
        <Button type="primary" onClick={showMo} shape="round" style={{ textAlign: 'left' }}>Sign-In with Lens</Button>
        <Button  shape="round" onClick={showModa}  style={{ textAlign: 'left',marginLeft:'10px' }}>Change Wallet</Button>
      </Modal>

      <Modal title="Login"
        open={isModalOpen3}
        onOk={handleOk}
        onCancel={handleCance}
        footer={null}
        closable={false}
        style={{ top: 180 }}
        >
        <Avatar size={32} icon={<UserOutlined />} />
        <h5>Claim your Lens profile 🌿</h5>
        <p>visite claiming site to claim your profile now 🏃‍♂️</p>
        <p>Make sure to check back here when done!</p>
      </Modal>


      <Modal
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        closable={false}
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
            <div><p>CMEMO：</p><a>{toSpecialAmount(wallet.balance)}</a></div>
            <div><p>MEMO：</p><a>{memo}</a></div>
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