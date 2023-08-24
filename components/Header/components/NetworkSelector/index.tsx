import React from 'react';
import { Button } from 'antd';
// import useNetworkProvider from '@/hooks/useNetworkProvider';
import useMyWallet from '@/hooks/useMyWallet';
import { CHAIN_INFO } from '@/constants/chainInfo';
import { DefaultChainId } from '@/constants/chains';
import './index.scss';

const NetworkSelector: React.FC = () => {
  let { chainId, status } = useMyWallet();
  if (status !== 'connected') {
    chainId = DefaultChainId;
  }
  return (
    <>
      <div className="Network">
        <Button type="primary"
          className="primary"
          size="large"
        >
          {CHAIN_INFO[chainId].label}
          <img src={CHAIN_INFO[chainId].logoUrl}/>
        </Button>
      </div>
    </>
  );
};

export default NetworkSelector;