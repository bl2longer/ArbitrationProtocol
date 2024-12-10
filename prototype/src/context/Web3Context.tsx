import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';

interface Web3ContextType {
  account: string | null;
  connectWallet: () => Promise<void>;
  provider: ethers.Provider | null;
  signer: ethers.Signer | null;
  btcAddress: string | null;
  connectBtcWallet: () => Promise<void>;
}

const Web3Context = createContext<Web3ContextType | null>(null);

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.Provider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [btcAddress, setBtcAddress] = useState<string | null>(null);

  useEffect(() => {
    if (window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      setProvider(provider);

      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        setAccount(accounts[0] || null);
      });
    }
  }, []);

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask!');
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      const signer = await provider.getSigner();
      
      setAccount(accounts[0]);
      setSigner(signer);
    } catch (error) {
      console.error('Error connecting to MetaMask', error);
    }
  };

  const connectBtcWallet = async () => {
    // TODO: Implement BTC wallet connection
    alert('BTC wallet integration coming soon!');
  };

  return (
    <Web3Context.Provider value={{
      account,
      connectWallet,
      provider,
      signer,
      btcAddress,
      connectBtcWallet,
    }}>
      {children}
    </Web3Context.Provider>
  );
}

export function useWeb3() {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
}
