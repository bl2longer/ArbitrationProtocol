import { useActiveEVMChainConfig } from "@/services/chains/hooks/useActiveEVMChainConfig";
import { useBehaviorSubject } from "@/utils/useBehaviorSubject";
import { useCallback, useEffect } from "react";
import { BehaviorSubject } from "rxjs";
import { fetchArbiters as fetchArbitersApi } from "../arbiters.service";
import { ArbiterInfo } from "../model/arbiter-info";

const state$ = new BehaviorSubject<{
  wasFetched: boolean; // Fetching has been tried once
  isPending: boolean; // Fetching is in progress
  arbiters?: ArbiterInfo[];
}>({ isPending: false, wasFetched: false });

export const useArbiters = () => {
  const activeChain = useActiveEVMChainConfig();
  const state = useBehaviorSubject(state$);

  const fetchArbiters = useCallback(async () => {
    state$.next({ isPending: true, wasFetched: false });
    if (activeChain) {
      const { arbiters } = await fetchArbitersApi(activeChain);
      state$.next({ isPending: false, wasFetched: true, arbiters });
    }
  }, [activeChain]);

  // Initial lazy fetch (first access)
  useEffect(() => {
    if (!state.wasFetched && !state.isPending)
      void fetchArbiters();
  }, [fetchArbiters, state]);

  return { fetchArbiters, ...state }
}