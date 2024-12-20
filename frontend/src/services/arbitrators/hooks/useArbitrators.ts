import { ChainConfig } from "@/services/chains/chain-config";
import { useActiveEVMChainConfig } from "@/services/chains/hooks/useActiveEVMChainConfig";
import { useCallback } from "react";
import { create, useStore } from "zustand";
import { fetchArbitrators } from "../arbitrators.service";
import { ArbitratorInfo } from "../model/arbitrator-info";

const arbitratorsStore = create<{
  arbitrators: ArbitratorInfo[];
  fetchArbitrators: (activeChain: ChainConfig, start?: number, limit?: number) => void;
}>((set) => ({
  arbitrators: undefined,
  fetchArbitrators: (activeChain: ChainConfig, start = 0, limit = 100) => {
    set({ arbitrators: undefined });
    void fetchArbitrators(activeChain, start, limit).then(set);
  }
}));

export const useArbitrators = () => {
  const activeChain = useActiveEVMChainConfig();
  const arbitrators = useStore(arbitratorsStore, state => state.arbitrators);

  const fetchArbitrators = useCallback(() => {
    if (activeChain)
      void arbitratorsStore.getState().fetchArbitrators(activeChain);
  }, [activeChain]);

  return { arbitrators, fetchArbitrators }
}
