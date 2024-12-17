import { ChainConfig } from "@/services/chains/chain-config";
import { escBtcToken, escUSDCToken, escUSDTToken } from "@/services/tokens/tokens";

const productionBuild = import.meta.env.VITE_APP_ENV === "production"

const hasCustomLocalSubgraphEndpoint = import.meta.env.VITE_APP_LOCAL_SUBGRAPH_ENDPOINT!.length > 0;
const escMainnetStagingSubgraph = hasCustomLocalSubgraphEndpoint ? import.meta.env.VITE_APP_LOCAL_SUBGRAPH_ENDPOINT! : "https://graph.bel2.org/subgraphs/name/bel2-loan-esc-staging";
const escTestnetSubgraph = hasCustomLocalSubgraphEndpoint ? import.meta.env.VITE_APP_LOCAL_SUBGRAPH_ENDPOINT! : "https://graph.bel2.org/subgraphs/name/bel2-loan-esc-testnet";

/**
 * List of supported EVMs the work can run on.
 */
export const chainList: ChainConfig[] = [
  {
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
      transactionManager: ""
    },
    tokens: [
      escBtcToken,
      escUSDTToken,
      escUSDCToken
    ]
  }
];

/**
 * Chain to use as default in case no wallet is connected.
 * Useful to fetch data for previewing before attempting to interact.
 */
export const defaultChainConfig = chainList[0];