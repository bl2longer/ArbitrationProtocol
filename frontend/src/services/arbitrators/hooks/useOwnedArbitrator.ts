import { useWalletContext } from "@/contexts/WalletContext/WalletContext";
import { useActiveEVMChainConfig } from "@/services/chains/hooks/useActiveEVMChainConfig";
import { useCallback, useEffect, useState } from "react";
import { fetchArbitrators } from "../arbitrators.service";
import { ArbitratorInfo } from "../model/arbitrator-info";

/**
 * NOTE: one evm account can only operate ONE arbitrator. Protocol restriction.
 */
export const useOwnedArbitrator = () => {
  const activeChain = useActiveEVMChainConfig();
  const { evmAccount } = useWalletContext();
  const [ownedArbitrator, setOwnedArbitrator] = useState<ArbitratorInfo>();
  const [isPending, setIsPending] = useState(true);

  const refreshArbitrators = useCallback(() => {
    setIsPending(true);
    if (activeChain && evmAccount) {
      void fetchArbitrators(activeChain, 0, 100, evmAccount).then(({ arbitrators }) => {
        setOwnedArbitrator(arbitrators?.[0]);
      });
    }
    else {
      setOwnedArbitrator(undefined)
    }
    setIsPending(false);
  }, [activeChain, evmAccount]);

  useEffect(() => {
    refreshArbitrators();
  }, [refreshArbitrators]);

  return { ownedArbitrator, isPending }
}