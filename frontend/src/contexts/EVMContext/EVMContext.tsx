import React, { createContext, useContext, ReactNode, useCallback } from 'react';
import { useAccount, useChainId, useConnect, useDisconnect, WagmiProvider } from 'wagmi';
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

interface EVMContextProps {
  connect: () => void;
  disconnect: ReturnType<typeof useDisconnect>['disconnect'];
  isConnected: boolean;
  account: string | undefined;
  chainId: number;
}

const EVMContext = createContext<EVMContextProps | null>(null);

interface EVMProviderProps {
  children: ReactNode;
}

export const EVMProviderInternal: React.FC<EVMProviderProps> = ({ children }) => {
  const { connect: wagmiConnect } = useConnect();
  const chainId = useChainId();
  const { disconnect } = useDisconnect();
  const { isConnected, address } = useAccount();

  const connect = useCallback(() => {
    console.log("connect");
    wagmiConnect({ connector: injectedConnector });
  }, []);

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <EVMContext.Provider value={{ connect, disconnect, isConnected, account: address, chainId }}>
          {children}
        </EVMContext.Provider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export const EVMProvider: React.FC<EVMProviderProps> = ({ children, ...props }) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <EVMProviderInternal {...props}>
          {children}
        </EVMProviderInternal>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export const useEVMContext = (): EVMContextProps => {
  const context = useContext(EVMContext);
  if (!context) {
    throw new Error('useEVMContext must be used within a Web3Provider');
  }
  return context;
};
