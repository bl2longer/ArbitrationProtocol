import { NetworkMode } from "@/services/network/network";
import { TokenOrNative } from "@/services/tokens/token-or-native";

export type ChainConfig = {
  [x: string]: {};
  name: string; // Displayable chain name
  rpcs: string[]; // List of chain RPC endpoints
  explorers: string[]; // List of block explorer API endpoints
  chainId: bigint; // eg: 21n for elastos testnet, "SN_MAIN" converted for starknet mainnet
  networkMode: NetworkMode; // This chain config only works for the given network mode
  subgraph: {
    endpoint: string;
  }
  nativeCurrency: {
    name: string; // eg: "Elastos"
    symbol: string; // eg: "ELA"
    decimals: number; // eg: 18
    wrappedAddress: string; // eg: Address of Wrapped ELA on ESC
  },
  contracts: {
    arbitratorManager: string;
    compensationManager: string;
    configManager: string;
    dappRegistry: string;
    transactionManager: string;
    nftInfo: string;
    bPoSNFT: string;
  },
  // List of supported tokens for deposits
  tokens: TokenOrNative[];
}