import { ChainConfig } from "@/services/chains/chain-config";
import { escBtcToken, escUSDCToken, escUSDTToken } from "@/services/tokens/tokens";

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
  nativeCurrency: {
    name: "ELA",
    symbol: "ELA",
    decimals: 18,
    wrappedAddress: "0x517E9e5d46C1EA8aB6f78677d6114Ef47F71f6c4"
  },
  contracts: {
    arbitratorManager: "0x288be5594327d9D688edC12452A0699E6fD256E4",
    compensationManager: "0x11C42653ea0B7BC1e14cE09DE14E9D285f05F408",
    configManager: "0x9095f635E128A4D8a593C812CffD8b3fCd3a0405",
    dappRegistry: "0x682c832541507EbFd9B5A11576e1e79e1cad9598",
    transactionManager: "0x1E7899A60b1fE71Cdb856518eB1817CcA3Fb5804",
    nftInfo: "0x0a218CC87C48BA26D60f438860710f6c0D4AA050",
    bPoSNFT: "0x8e286664c6B8811015F936592Dd654e94Af3F494"
  },
  tokens: [
    escBtcToken,
    escUSDTToken,
    escUSDCToken
  ],
  isDefault: true
}
