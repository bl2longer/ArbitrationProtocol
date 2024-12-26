import { ChainConfig } from "@/services/chains/chain-config";
import { escBtcToken, escUSDCToken, escUSDTToken } from "@/services/tokens/tokens";

const hasCustomLocalSubgraphEndpoint = import.meta.env.VITE_APP_LOCAL_SUBGRAPH_ENDPOINT!.length > 0;
const subgraphEndpoint = hasCustomLocalSubgraphEndpoint ? import.meta.env.VITE_APP_LOCAL_SUBGRAPH_ENDPOINT! : "https://graph.bel2.org/subgraphs/name/bel2-loan-esc-prod";

export const escMainnetProd: ChainConfig = {
  name: "Elastos Smart Chain",
  rpcs: ["https://api2.elastos.net/esc"],
  explorers: ["https://esc.elastos.io"],
  chainId: 20n,
  networkMode: "mainnet",
  subgraph: {
    endpoint: subgraphEndpoint
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
  ],
  isDefault: true
}
