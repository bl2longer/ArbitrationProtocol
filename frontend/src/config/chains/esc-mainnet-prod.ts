import { ChainConfig } from "@/services/chains/chain-config";
import { escBtcToken, escELAToken, escUSDCToken, escUSDTToken } from "@/services/tokens/tokens";

const hasCustomLocalSubgraphEndpoint = import.meta.env.VITE_APP_LOCAL_SUBGRAPH_ENDPOINT!.length > 0;
const subgraphEndpoint = hasCustomLocalSubgraphEndpoint ? import.meta.env.VITE_APP_LOCAL_SUBGRAPH_ENDPOINT! : "https://graph.bel2.org/subgraphs/name/arbitrators-prod";

export const escMainnetProd: ChainConfig = {
  name: "Elastos Smart Chain",
  rpcs: ["https://api2.elastos.net/esc"],
  explorers: ["https://esc.elastos.io"],
  chainId: 20n,
  networkMode: "mainnet",
  subgraph: {
    endpoint: subgraphEndpoint
  },
  nativeCurrency: escELAToken,
  contracts: {
    arbitratorManager: "0x5EF9bd1506d64754FA864708A743Ab952159d5B8",
    compensationManager: "0x5a8b4adeE292095B329326Ac13b9b331611A486B",
    configManager: "0xF176E5aB219452E436E521213b6f7282E1D83C02",
    dappRegistry: "0x88cA774F787399135BAbCbE395691cec36Abc72D",
    transactionManager: "0x8161b6b21A71F412804F3BfdC09eF9C9f4E8085b",
    nftInfo: "0x0a218CC87C48BA26D60f438860710f6c0D4AA050",
    bPoSNFT: "0x8e286664c6B8811015F936592Dd654e94Af3F494",
    zkpService: null
  },
  tokens: [
    escBtcToken,
    escUSDTToken,
    escUSDCToken
  ],
  isDefault: true
}
