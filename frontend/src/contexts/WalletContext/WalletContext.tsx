import { NetworkMode, networkMode$ } from "@services/network/network";
import { useStarknetWallet } from "@services/starknet/hooks/useStarknetWallet";
import { sepolia } from "@starknet-react/chains";
import {
  publicProvider,
  StarknetConfig,
  useInjectedConnectors
} from "@starknet-react/core";
import { Web3ReactProvider } from "@web3-react/core";
import { createContext, FC, memo, ReactNode, useContext, useEffect, useState } from "react";
import { BehaviorSubject } from "rxjs";
import { connectors } from "./connectors";

const STARKNET_ACCOUNT_STORAGE_KEY = "starknet-account";
const STARKNET_CHAIN_ID_STORAGE_KEY = "starknet-chain-id";
const STARKNET_PROVIDER_STORAGE_KEY = "starknet-provider";
const BITCOIN_ACCOUNT_STORAGE_KEY = "bitcoin-account";
const BITCOIN_PROVIDER_STORAGE_KEY = "bitcoin-provider";
const NETWORK_MODE_STORAGE_KEY = "network-mode";

export type BitcoinWalletProvider = "unisat" | "okx";
export type StarknetWalletProvider = "braavos" | "argent";

export type Web3ProviderProps = {
  children: ReactNode;
};

/**
 * RxJS subject in addition to hooks, to be able to deal with the active chain outside of react hooks (services).
 */
export const activeStarknetChainId$ = new BehaviorSubject<bigint>(undefined);

/**
 * Automatically reconnects to the injected wallet, if we already have a known starknet account in local storage.
 * For example, metamask doesn't automatically reconnects when reloading the page.
 *
 * NOTE: Later when adding more wlalet support such as wallet connect we have to store the connector in use, and try to auto reconnect
 * only when the connector in use is the injected one. We don't want to auto reconnect to Wallet connect for example, as this would trigger a QR code modal.
 */
const AutoReconnect: FC<{ children: ReactNode }> = ({ children }) => {
  const { starknetAccount } = useContext(WalletContext);
  const { handleReconnect } = useStarknetWallet();
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    if (connecting || !starknetAccount || !window.ethereum)
      return;

    console.log("Reconnecting to the injected wallet provider");
    setConnecting(true);
    handleReconnect();
  }, [starknetAccount, handleReconnect, connecting]);

  return children;
}

export const WalletProvider = memo(({ children }: Web3ProviderProps) => {
  // Restore account from local storage, even if connector is not connected any more.
  // It's ok to know the starknet account even if we need to reconnect to the connector for requests later on.
  const [bitcoinAccount, setBitcoinAccount] = useState<string>(localStorage.getItem(BITCOIN_ACCOUNT_STORAGE_KEY));
  const [bitcoinProvider, setBitcoinProvider] = useState<BitcoinWalletProvider>(localStorage.getItem(BITCOIN_PROVIDER_STORAGE_KEY) as BitcoinWalletProvider);
  const [networkMode, setNetworkMode] = useState<NetworkMode>(localStorage.getItem(NETWORK_MODE_STORAGE_KEY) as NetworkMode || "mainnet");

  const [starknetAccount, setStarknetAccount] = useState<string>(localStorage.getItem(STARKNET_ACCOUNT_STORAGE_KEY));
  const rawChainID = localStorage.getItem(STARKNET_CHAIN_ID_STORAGE_KEY);
  const [starknetChainId, setStarknetChainId] = useState<bigint>(rawChainID ? BigInt(rawChainID) : undefined);
  const [starknetProvider, setStarknetProvider] = useState<StarknetWalletProvider>(localStorage.getItem(STARKNET_PROVIDER_STORAGE_KEY) as StarknetWalletProvider);

  // Starknet 
  const starknetChains = [sepolia];
  const publicStarknetProvider = publicProvider();
  //const starknetConnectors = [braavos()/* , argent(), injected({ id: "okx?" }) */];
  const { connectors: starknetConnectors } = useInjectedConnectors({});

  // Save account to local storage when it changes
  useEffect(() => {
    if (starknetAccount)
      localStorage.setItem(STARKNET_ACCOUNT_STORAGE_KEY, starknetAccount);
    else
      localStorage.removeItem(STARKNET_ACCOUNT_STORAGE_KEY);
  }, [starknetAccount]);

  // Save chain ID to local storage when it changes
  useEffect(() => {
    if (starknetChainId)
      localStorage.setItem(STARKNET_CHAIN_ID_STORAGE_KEY, `${starknetChainId}`);
    else
      localStorage.removeItem(STARKNET_CHAIN_ID_STORAGE_KEY);
  }, [starknetChainId]);

  useEffect(() => {
    if (starknetProvider)
      localStorage.setItem(STARKNET_PROVIDER_STORAGE_KEY, starknetProvider);
    else
      localStorage.removeItem(STARKNET_PROVIDER_STORAGE_KEY);
  }, [starknetProvider]);

  // Save account to local storage when it changes
  useEffect(() => {
    if (bitcoinAccount)
      localStorage.setItem(BITCOIN_ACCOUNT_STORAGE_KEY, bitcoinAccount);
    else
      localStorage.removeItem(BITCOIN_ACCOUNT_STORAGE_KEY);
  }, [bitcoinAccount]);

  // Save network mode to local storage when it changes
  useEffect(() => {
    if (networkMode)
      localStorage.setItem(NETWORK_MODE_STORAGE_KEY, networkMode);
    else
      localStorage.removeItem(NETWORK_MODE_STORAGE_KEY);
  }, [networkMode]);

  useEffect(() => {
    if (bitcoinProvider)
      localStorage.setItem(BITCOIN_PROVIDER_STORAGE_KEY, bitcoinProvider);
    else
      localStorage.removeItem(BITCOIN_PROVIDER_STORAGE_KEY);
  }, [bitcoinProvider]);

  useEffect(() => {
    activeStarknetChainId$.next(starknetChainId);
  }, [starknetChainId]);

  useEffect(() => {
    networkMode$.next(networkMode);
  }, [networkMode]);

  return (
    <WalletContext.Provider value={{ starknetAccount, setStarknetAccount, starknetChainId, setStarknetChainId, starknetProvider, setStarknetProvider, bitcoinAccount, setBitcoinAccount, bitcoinProvider, setBitcoinProvider, networkMode, setNetworkMode }}>
      <StarknetConfig chains={starknetChains} provider={publicStarknetProvider} connectors={starknetConnectors}>
        <Web3ReactProvider connectors={connectors}>
          <AutoReconnect>
            {children}
          </AutoReconnect>
        </Web3ReactProvider>
      </StarknetConfig>
    </WalletContext.Provider>
  );
});

type WalletContextProps = {
  starknetAccount: string;
  setStarknetAccount: (account: string) => void;
  starknetProvider: StarknetWalletProvider;
  setStarknetProvider: (provider: StarknetWalletProvider) => void;
  starknetChainId: bigint;
  setStarknetChainId: (chainId: bigint) => void;

  bitcoinAccount: string;
  setBitcoinAccount: (account: string) => void;
  bitcoinProvider: BitcoinWalletProvider;
  setBitcoinProvider: (provider: BitcoinWalletProvider) => void;

  networkMode: NetworkMode;
  setNetworkMode: (mode: NetworkMode) => void;
}

export const WalletContext = createContext<WalletContextProps>(null);