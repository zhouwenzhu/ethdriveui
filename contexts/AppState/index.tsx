import React, { createContext, useCallback, useState } from 'react';
import { getLocale, setLocale as setLocaleString } from '@/constants/locales';
export const Context = createContext({locale: null, setLocale:null, storageBalance:null, setStorageBalance:null,lensToken: '' ,setLensToken: null,memoToken: '',setMemoToken: null,storage: {Used:'', Free:'', Available:'', Files:''}, setStorage:null});

interface IProps {
  children: any
}

const AppStateContext: React.FC<IProps> = ({children}) => {
  const [locale, setLocale] = useState(getLocale());

  const handleActiveLocale = useCallback((val) => {
    setLocaleString(val);
    setLocale(val);
  }, [setLocale]);
  const [storageBalance, setStorageBalance] = useState(0);
  const [lensToken, setLensToken] = useState('');
  const [memoToken, setMemoToken] = useState('');
  const [storage, setStorage] = useState({Used:'', Free:'', Available:'', Files:''});

  return (
    <Context.Provider value={{ locale, setLocale: handleActiveLocale, storageBalance, setStorageBalance, lensToken, setLensToken, memoToken, setMemoToken,storage, setStorage}}>
      {children}
    </Context.Provider>
  );
};

export default AppStateContext;