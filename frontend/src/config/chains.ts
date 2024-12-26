import { ChainConfig } from "@/services/chains/chain-config";
import { escMainnetProd } from "./chains/esc-mainnet-prod";
import { escMainnetStaging } from "./chains/esc-mainnet-staging";

const stagingBuild = import.meta.env.VITE_APP_ENV === "production"

/**
 * List of supported EVMs the work can run on.
 */
export const chainList: ChainConfig[] = [
  stagingBuild ? escMainnetStaging : escMainnetProd,
  //escTestnet
];

/**
 * Chain to use as default in case no wallet is connected.
 * Useful to fetch data for previewing before attempting to interact.
 */
export const defaultChainConfig = chainList[0];