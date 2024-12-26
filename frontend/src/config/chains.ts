import { ChainConfig } from "@/services/chains/chain-config";
import { escMainnetProd } from "./chains/esc-mainnet-prod";
import { escMainnetStaging } from "./chains/esc-mainnet-staging";

const prodNetworkEnv = import.meta.env.VITE_APP_NETWORK_ENV === "production";
const stagingNetworkEnv = import.meta.env.VITE_APP_NETWORK_ENV === "staging";
const testnetNetworkEnv = import.meta.env.VITE_APP_NETWORK_ENV === "testnet";

/**
 * List of supported EVMs the work can run on.
 */
export const chainList: ChainConfig[] = [
  ...(prodNetworkEnv ? [escMainnetProd] : []),
  ...(stagingNetworkEnv ? [escMainnetStaging] : []),
  ...(testnetNetworkEnv ? [] : []),
];

if (chainList.length === 0)
  throw new Error("Chain list is empty! Make sure to configure VITE_APP_NETWORK_ENV in .env with one of production/staging/testnet.");

/**
 * Chain to use as default in case no wallet is connected.
 * Useful to fetch data for previewing before attempting to interact.
 */
export const defaultChainConfig = chainList[0];