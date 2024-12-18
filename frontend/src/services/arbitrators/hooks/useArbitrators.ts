import { useActiveEVMChainConfig } from "@/services/chains/hooks/useActiveEVMChainConfig";
import { useCallback, useEffect, useState } from "react";
import { fetchArbitrators } from "../arbitrators.service";
import { ArbitratorInfo } from "../model/arbitrator-info";

export const useArbitrators = (): { arbitrators: ArbitratorInfo[] } => {
  const activeChain = useActiveEVMChainConfig();
  const [arbitrators, setArbitrators] = useState<ArbitratorInfo[]>([]);

  const refreshArbitrators = useCallback(() => {
    if (activeChain) {
      void fetchArbitrators(activeChain, 0, 100).then(({ arbitrators: _arbitrators }) => {
        setArbitrators(_arbitrators);
      });
    }
  }, [activeChain]);

  useEffect(() => {
    refreshArbitrators();
  }, [refreshArbitrators]);

  return { arbitrators }
}