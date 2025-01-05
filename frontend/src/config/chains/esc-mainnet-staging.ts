import { ChainConfig } from '@/services/chains/chain-config';
import { clone } from 'lodash';
import { escMainnetProd } from './esc-mainnet-prod';

export const escMainnetStaging: ChainConfig = clone<ChainConfig>(escMainnetProd);

const hasCustomLocalSubgraphEndpoint = import.meta.env.VITE_APP_LOCAL_SUBGRAPH_ENDPOINT!.length > 0;
const subgraphEndpoint = hasCustomLocalSubgraphEndpoint ? import.meta.env.VITE_APP_LOCAL_SUBGRAPH_ENDPOINT! : "https://graph.bel2.org/subgraphs/name/arbitrators-staging";

// Start from prod config, and update a few things
escMainnetStaging.subgraph = {
  endpoint: subgraphEndpoint
};

escMainnetStaging.contracts = {
  arbitratorManager: "0x9963b5214434776D043A4e98Bc7f33321F6aaCfc",
  compensationManager: "0x9F8B0E8aEa662994C4Fd36De07398339559cd57E",
  configManager: "0x4421c63241A262C423277FFA82C376953072d25f",
  dappRegistry: "0x538f5e27299384c0FEF434d3359d948277E13C85",
  transactionManager: "0xA10b92006743Ef3B12077da67e465963743b03D3",
  nftInfo: "0x0a218CC87C48BA26D60f438860710f6c0D4AA050",
  bPoSNFT: "0x8e286664c6B8811015F936592Dd654e94Af3F494",
  zkpService: "0x8B1755c8cEA289025f8f0669028095c4F81021f7"
};
