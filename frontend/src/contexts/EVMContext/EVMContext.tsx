import React, { createContext, useContext, ReactNode, useCallback, useEffect } from 'react';
import { useAccount, useChainId, useConnect, useDisconnect, useReconnect, WagmiProvider } from 'wagmi';
import { http, createConfig } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { injected } from 'wagmi/connectors';
import { useWalletContext } from '../WalletContext/WalletContext';
import { useSwitchChain } from "wagmi";
import { chainList } from '@/config/chains';
import { ChainConfig } from '@/services/chains/chain-config';
import { MetaMaskErrorCode } from '../ErrorHandlerContext';
import { Chain, toHex } from 'viem';

const injectedConnector = injected();

// Map our chains format to wagmi chains format
const wagmiChains: Chain[] = chainList.map(c => ({
  id: Number(c.chainId),
  name: c.name,
  rpcUrls: {
    default: {
      http: c.rpcs
    }
  },
  nativeCurrency: {
    name: c.nativeCurrency.name,
    symbol: c.nativeCurrency.symbol,
    decimals: c.nativeCurrency.decimals,
  },
  blockExplorers: {
    default: {
      name: c.name,
      url: c.explorers?.[0]
    }
  }
}));

export const wagmiConfig = createConfig({
  chains: [wagmiChains[0], ...wagmiChains.slice(1)],
  connectors: [
    injectedConnector
  ],
  transports: Object.fromEntries(wagmiChains.map(c => [c.id, http()]))
});

const queryClient = new QueryClient();

interface EVMContextProps {
  connect: () => Promise<void>;
  disconnect: ReturnType<typeof useDisconnect>['disconnect'];
  switchNetworkOrAddDefault: () => Promise<void>;
  isConnected: boolean;
  account: string | undefined;
  chainId: number;
}

const EVMContext = createContext<EVMContextProps | null>(null);

interface EVMProviderProps {
  children: ReactNode;
}

/**
 * Requests the active wallet to add our main EVM network (from config) in its settings
 */
const addNetwork = async (provider: any, chain: ChainConfig) => {
  console.log("Asking wallet to add chain:", chain);
  try {
    await provider.provider.request({
      method: "wallet_addEthereumChain",
      params: [
        {
          chainId: toHex(chain.chainId),
          chainName: chain.name,
          nativeCurrency: chain.nativeCurrency,
          rpcUrls: chain.rpcs,
          blockExplorerUrls: chain.explorers,
        },
      ],
    });
  } catch (addingNetworkErr) {
    throw addingNetworkErr;
  }
};

export const EVMProviderInternal: React.FC<EVMProviderProps> = ({ children }) => {
  const { connect: wagmiConnect } = useConnect();
  const { reconnect } = useReconnect();
  const chainId = useChainId();
  const { disconnect } = useDisconnect();
  const { isConnected, address, connector } = useAccount();
  const { setEvmAccount, networkMode, setEvmChainId } = useWalletContext();
  const { switchChain } = useSwitchChain();
  const defaultNetworkToUse = chainList.find(c => c.networkMode === networkMode); // Use the first network of the list that supports the current network mode

  const connect = useCallback(async () => {
    if (address) {
      console.log("Reconnecting to the injected wallet provider");
      reconnect();
    }
    else {
      console.log("Connecting to the injected wallet provider");
      wagmiConnect({ connector: injectedConnector, });
    }
  }, [wagmiConnect, reconnect, address]);

  /**
   * Requests the active wallet to switch to our main network, if not already there.
   */
  const switchNetwork = useCallback(async (chain: ChainConfig) => {
    console.log("Asking wallet to switch to chain:", chain);
    await switchChain({ chainId: Number(chain.chainId) }, {
      onError: (error) => {
        console.warn("Switch chain error:", error);
      }
    })
  }, [switchChain]);

  const switchNetworkOrAddDefault = useCallback(async () => {
    try {
      await switchNetwork(defaultNetworkToUse);
    } catch (networkError: any) {
      const { code } = networkError as { code: number; message: string; };
      if (code === MetaMaskErrorCode.UNRECOGNIZED_CHAIN_ERR_CODE) {
        try {
          const provider = await connector.getProvider();
          console.log("provider", provider)
          await addNetwork(provider, defaultNetworkToUse); // Elastos testnet for now
        }
        catch (e) {
          // Possibly "Request of type 'wallet_addEthereumChain' already pending". Silent error
          console.warn("Add network error:", e);
        }
      } else {
        // TODO handleError(networkError, evmAccount);
      }
    }
  }, [switchNetwork, defaultNetworkToUse]);

  useEffect(() => {
    setEvmAccount(address);
  }, [address]);

  useEffect(() => {
    setEvmChainId(chainId);
  }, [chainId]);

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <EVMContext.Provider value={{
          connect,
          disconnect,
          switchNetworkOrAddDefault,
          isConnected,
          account: address,
          chainId
        }}>
          {children}
        </EVMContext.Provider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export const EVMProvider: React.FC<EVMProviderProps> = ({ children, ...props }) => {
  return (
    <WagmiProvider config={wagmiConfig}>
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
    throw new Error('useEVMContext must be used within a EVMProvider');
  }
  return context;
};
