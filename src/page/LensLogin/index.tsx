import React, { useEffect, useState } from 'react';

import { useTranslation } from 'react-i18next';
import {
  ApolloClient,
  ApolloLink,
  from,
  HttpLink,
  InMemoryCache
} from '@apollo/client/core';
import { ethers } from 'ethers';
import { client, challenge, authenticate, defaultProfile,CreateProfile } from '../../lens/api';
import { onError } from '@apollo/client/link/error';
import fetch from 'cross-fetch';

const httpLink = new HttpLink({
  uri: 'https://api-mumbai.lens.dev',
  fetch
});
// https://api.lens.dev
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors)
    graphQLErrors.forEach(({ message, locations, path }) =>
      console.log(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`)
    );

  if (networkError) console.log(`[Network error]: ${networkError}`);
});



// eslint-disable-next-line react/no-multi-comp
const LensLogin: React.FC = () => {
  const { t } = useTranslation();

  /* local state variables to hold user's address and access token */
  const [address, setAddress] = useState('');
  const [token, setToken] = useState('');
  const [info, setInfo] = useState({});
  useEffect(() => {
    /* when the app loads, check to see if the user has already connected their wallet */
    checkConnection();
  }, []);
  async function checkConnection() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const accounts = await provider.listAccounts();
    if (accounts.length) {
      setAddress(accounts[0]);
    }
  }
  async function connect() {
    /* this allows the user to connect their wallet */
    const account = await window.ethereum.send('eth_requestAccounts');
    if (account.result.length) {
      setAddress(account.result[0]);
    }
  }

  async function login() {
    try {
      /* first request the challenge from the API server */
      const challengeInfo = await client.query({
        query: challenge,
        variables: { address }
      });
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      /* ask the user to sign a message with the challenge info returned from the server */
      console.log({text:challengeInfo.data.challenge.text});
      console.log('text', challengeInfo.data.challenge.text);
      const signature = await signer.signMessage(challengeInfo.data.challenge.text);
      /* authenticate the user */
      console.log('signature', signature);
      const authData = await client.mutate({
        mutation: authenticate,
        variables: {
          address, signature
        }
      });
      /* if user authentication is successful, you will receive an accessToken and refreshToken */
      const { data: { authenticate: { accessToken }}} = authData;
      console.log({ accessToken });
      setToken(accessToken);
    } catch (err) {
      console.log('Error signing in: ', err);
    }
  }

  async function createProfile() {
    try {
      const authLink = new ApolloLink((operation, forward) => {
        // const token ='';
        console.log('jwt token:', token);
        operation.setContext({
          headers: {
            'x-access-token': token ? `Bearer ${token}` : ''
          }
        });
        return forward(operation);
      });

      const apolloClient = new ApolloClient({
        link: from([errorLink, authLink, httpLink]),
        cache: new InMemoryCache()
      });


      const authData = await apolloClient.mutate({
        mutation: CreateProfile,
        variables: {
          handle: 'eererergttytytytytytytyty'
        }
      }
      );
      /* if user authentication is successful, you will receive an accessToken and refreshToken */
      console.log({ authData });
    } catch (err) {
      console.log('Error signing in: ', err);
    }
  }
  async function getProfile() {
    try {
      /* first request the challenge from the API server 0x3A5bd1E37b099aE3386D13947b6a90d97675e5e3  */
      const infotmp = await client.query({
        query: defaultProfile,
        variables: { address:'0x48515F7d0B7280d59eCBE06d09B9EB7FEaDe73af' } // 0xb2E06Ccf7bDBeCa3297A87cAb2bc5a22D03a2CB4
      });
      setInfo(infotmp);
    } catch (err) {
      console.log('Error getProfile: ', err);
    }
  }

  return (
    <div>
      {
        address && token && (
          <div onClick={getProfile}>
            {JSON.stringify(info)}
            <button> {t('获取信息')}</button>
          </div>
        )
      }
      {
        address && token && (
          <div onClick={createProfile}>
            <button> {t('创建profile')}</button>
          </div>
        )
      }
      {
        !address && <button onClick={connect}>Connect</button>
      }
      {
        address && !token && (
          <div onClick={login}>
            <button> {t('Login')}</button>
          </div>
        )
      }
      {
        address && token && <h2>Successfully signed in!</h2>
      }
    </div>
  );
};
export default LensLogin;