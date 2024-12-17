import { useActiveEVMChainConfig } from "@/services/chains/hooks/useActiveEVMChainConfig";
import { fetchArbitrators } from "@/services/subgraph/subgraph";
import { useCallback, useEffect, useState } from "react";
import { ArbitratorInfo } from "../model/arbitrator-info";

export const useArbitrators = (): { arbitrators: ArbitratorInfo[] } => {
  const activeChain = useActiveEVMChainConfig();
  const [arbitrators, setArbitrators] = useState<ArbitratorInfo[]>([]);

  const refreshArbitrators = useCallback(() => {
    if (activeChain) {
      fetchArbitrators(activeChain, 0, 100).then(({ arbitrators }) => {
        setArbitrators(arbitrators);
      });
    }
  }, [activeChain]);

  useEffect(() => {
    refreshArbitrators();
  }, [refreshArbitrators]);

  return { arbitrators }
}