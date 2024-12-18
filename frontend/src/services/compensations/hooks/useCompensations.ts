import { useActiveEVMChainConfig } from "@/services/chains/hooks/useActiveEVMChainConfig";
import { useCallback, useEffect, useState } from "react";
import { fetchCompensations } from "../compensations.service";
import { CompensationClaim } from "../model/compensation-claim";

export const useCompensations = (): { compensations: CompensationClaim[] } => {
  const activeChain = useActiveEVMChainConfig();
  const [compensations, setCompensations] = useState<CompensationClaim[]>([]);

  const refreshCompensations = useCallback(() => {
    if (activeChain) {
      void fetchCompensations(activeChain, 0, 100).then(({ compensations: _compensations }) => {
        setCompensations(_compensations);
      });
    }
  }, [activeChain]);

  useEffect(() => {
    refreshCompensations();
  }, [refreshCompensations]);

  return { compensations }
}