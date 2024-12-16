import React, { createContext, useContext, ReactNode, useCallback } from 'react';
import { useAccount, useConnect, useDisconnect, WagmiProvider } from 'wagmi';
import { http, createConfig } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { injected, metaMask } from 'wagmi/connectors';

const injectedConnector = injected();

export const config = createConfig({
  chains: [mainnet, sepolia],
  connectors: [
    injectedConnector
  ],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
});

const queryClient = new QueryClient();

interface Web3ContextProps {
  connect: () => void;
  disconnect: ReturnType<typeof useDisconnect>['disconnect'];
  isConnected: boolean;
  account: string | undefined;
}

const Web3Context = createContext<Web3ContextProps | null>(null);

interface Web3ProviderProps {
  children: ReactNode;
}

export const Web3ProviderInternal: React.FC<Web3ProviderProps> = ({ children }) => {
  const { connect: wagmiConnect } = useConnect();
  const { disconnect } = useDisconnect();
  const { isConnected, address } = useAccount();

  const connect = useCallback(() => {
    console.log("connect");
    wagmiConnect({ connector: injectedConnector });
  }, []);

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <Web3Context.Provider value={{ connect, disconnect, isConnected, account: address }}>
          {children}
        </Web3Context.Provider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export const Web3Provider: React.FC<Web3ProviderProps> = ({ children, ...props }) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <Web3ProviderInternal {...props}>
          {children}
        </Web3ProviderInternal>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export const useWeb3 = (): Web3ContextProps => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};
