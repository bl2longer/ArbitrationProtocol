import { defaultChainConfig } from "@config/chains";
import { getChainConfigById } from "../chains";
import { useStarknetWallet } from "@services/starknet/hooks/useStarknetWallet";

/**
 * Returns the currently active chain in the connected EVM wallet.
 * If not connected or if chain is not supported, returns the default
 * chain config (elastos)
 */
export const useActiveEVMChainConfig = (useDefaultIfNeeded = true) => {
  const { chainId } = useStarknetWallet();
  const chainConfig = getChainConfigById(chainId);
  if (chainConfig)
    return chainConfig;

  if (useDefaultIfNeeded)
    return defaultChainConfig;

  return undefined;
}