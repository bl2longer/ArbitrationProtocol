import { useActiveEVMChainConfig } from "@/services/chains/hooks/useActiveEVMChainConfig";
import { useBehaviorSubject } from "@/utils/useBehaviorSubject";
import { useCallback, useEffect } from "react";
import { BehaviorSubject } from "rxjs";
import { fetchArbitrators as fetchArbitratorsApi } from "../arbitrators.service";
import { ArbitratorInfo } from "../model/arbitrator-info";

const state$ = new BehaviorSubject<{
  wasFetched: boolean; // Fetching has been tried once
  isPending: boolean; // Fetching is in progress
  arbitrators?: ArbitratorInfo[];
}>({ isPending: false, wasFetched: false });

export const useArbitrators = () => {
  const activeChain = useActiveEVMChainConfig();
  const state = useBehaviorSubject(state$);

  const fetchArbitrators = useCallback(async () => {
    state$.next({ isPending: true, wasFetched: false });
    if (activeChain) {
      const { arbitrators } = await fetchArbitratorsApi(activeChain);
      state$.next({ isPending: false, wasFetched: true, arbitrators });
    }
  }, [activeChain]);

  // Initial lazy fetch (first access)
  useEffect(() => {
    if (!state.wasFetched && !state.isPending)
      void fetchArbitrators();
  }, [fetchArbitrators, state]);

  return { fetchArbitrators, ...state }
}