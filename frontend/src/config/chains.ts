import { ChainConfig } from "@/services/chains/chain-config";
import { escBtcToken, escTestnetBtcToken, escTestnetUSDTToken, escUSDCToken, escUSDTToken } from "@/services/tokens/tokens";

const productionBuild = import.meta.env.VITE_APP_ENV === "production"

const hasCustomLocalSubgraphEndpoint = import.meta.env.VITE_APP_LOCAL_SUBGRAPH_ENDPOINT!.length > 0;
const escMainnetStagingSubgraph = hasCustomLocalSubgraphEndpoint ? import.meta.env.VITE_APP_LOCAL_SUBGRAPH_ENDPOINT! : "https://graph.bel2.org/subgraphs/name/bel2-loan-esc-staging";
const escTestnetSubgraph = hasCustomLocalSubgraphEndpoint ? import.meta.env.VITE_APP_LOCAL_SUBGRAPH_ENDPOINT! : "https://graph.bel2.org/subgraphs/name/bel2-loan-esc-testnet";

const escMainnet: ChainConfig = {
  name: "Elastos Smart Chain",
  rpcs: ["https://api2.elastos.net/esc"],
  explorers: ["https://esc.elastos.io"],
  chainId: 20n,
  networkMode: "mainnet",
  subgraph: {
    endpoint: productionBuild ? "https://graph.bel2.org/subgraphs/name/bel2-loan-esc-prod" : escMainnetStagingSubgraph
  },
  nativeCurrency: {
    name: "ELA",
    symbol: "ELA",
    decimals: 18,
    wrappedAddress: "0x517E9e5d46C1EA8aB6f78677d6114Ef47F71f6c4"
  },
  contracts: {
    arbitratorManager: "",
    compensationManager: "",
    configManager: "",
    dappRegistry: "",
    transactionManager: "",
    nftInfo: "",
    bPoSNFT: ""
  },
  tokens: [
    escBtcToken,
    escUSDTToken,
    escUSDCToken
  ]
}

const escTestnet: ChainConfig = {
  name: "Elastos Smart Chain Testnet",
  rpcs: ["https://api-testnet.elastos.net/esc"],
  explorers: ["https://esc-testnet.elastos.io"],
  chainId: 21n,
  networkMode: "testnet",
  subgraph: {
    endpoint: escTestnetSubgraph
  },
  nativeCurrency: {
    name: "ELA",
    symbol: "ELA",
    decimals: 18,
    wrappedAddress: null
  },
  contracts: {
    configManager: "0x941796c51443493d2F5C03D3c40d3ff0F0B0BD30",
    arbitratorManager: "0xFd3b0FD49df58a465Ac8E62f35d913b27cfc04B3",
    compensationManager: "0x7c31A7185660d5c40B1A02D60dbcCfd221d40787",
    dappRegistry: "0xC9B498e769e1A7670f747beBB3A3b5172DD122D1",
    transactionManager: "0xD206be45b53Fa5C2065049c7a70B1aa1755a9475",
    nftInfo: "0x3fB20197AD095724662bF0AD499F3994bfD222D3",
    bPoSNFT: "0x6C91352F89b169843D8B50E1A34B60a46e363841"
  },
  tokens: [
    escTestnetBtcToken,
    escTestnetUSDTToken
  ]
}

/**
 * List of supported EVMs the work can run on.
 */
export const chainList: ChainConfig[] = [
  // escMainnet,
  escTestnet
];

/**
 * Chain to use as default in case no wallet is connected.
 * Useful to fetch data for previewing before attempting to interact.
 */
export const defaultChainConfig = chainList[0];