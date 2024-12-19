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
    arbitratorManager: "0x42FcB0c75D3FE234EFD1d529Cd31c9A8Ab1EB4C6",
    compensationManager: "0x7c31A7185660d5c40B1A02D60dbcCfd221d40787",
    configManager: "0x941796c51443493d2F5C03D3c40d3ff0F0B0BD30",
    dappRegistry: "0xC9B498e769e1A7670f747beBB3A3b5172DD122D1",
    transactionManager: "0xD206be45b53Fa5C2065049c7a70B1aa1755a9475",
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
  escMainnet,
  escTestnet
];

/**
 * Chain to use as default in case no wallet is connected.
 * Useful to fetch data for previewing before attempting to interact.
 */
export const defaultChainConfig = chainList[0];