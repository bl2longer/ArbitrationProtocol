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
      arbitratorManager: "0xa63339B2e236F6A1830A3DB35D73b64BE8CF2E6A",
      compensationManager: "0xd39a816F8b6c298aF8efd14cB260F07bAB8386aF",
      configManager: "0xc9D4AA52c345Efe835A207aADAE8575CC086632c",
      dappRegistry: "0x308c2fD094E2f1356a0843d197a29A6DaedBA023",
      transactionManager: "0x1637106Eb7638Dd987715C8aF133F399bba862f2",
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