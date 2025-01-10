import { useActiveEVMChainConfig } from "@/services/chains/hooks/useActiveEVMChainConfig";
import { isSameEVMAddress } from "@/services/evm/evm";
import { useBehaviorSubject } from "@/utils/useBehaviorSubject";
import { useCallback, useEffect } from "react";
import { BehaviorSubject } from "rxjs";
import { fetchArbiters as fetchArbitersApi } from "../arbiters.service";
import { ArbiterInfo } from "../model/arbiter-info";
import { useMultiArbiterInfo } from "./contract/useMultiArbiterInfo";
import { useMultiArbiterIsActive } from "./contract/useMultiArbiterIsActive";

const state$ = new BehaviorSubject<{
  wasFetched: boolean; // Fetching has been tried once
  isPending: boolean; // Fetching is in progress
  arbiters?: ArbiterInfo[];
}>({ isPending: false, wasFetched: false });

export const useArbiters = () => {
  const activeChain = useActiveEVMChainConfig();
  const state = useBehaviorSubject(state$);
  const { fetchMultiArbiterIsActive } = useMultiArbiterIsActive();
  const { fetchMultiArbiterInfo } = useMultiArbiterInfo();

  const fetchArbiters = useCallback(async () => {
    state$.next({ isPending: true, wasFetched: false });
    if (activeChain) {
      const { arbiters: graphArbiters } = await fetchArbitersApi(activeChain);

      if (graphArbiters) {
        // Only use the subgraph for the arbiters, but real details are fetched from contract through multicall
        const arbiters = await fetchMultiArbiterInfo(graphArbiters.map(a => a.id));

        const isActives = await fetchMultiArbiterIsActive(arbiters?.map(arbiter => arbiter.id));
        console.log("isActives", isActives)
        for (const arbiter of arbiters) {
          arbiter.isActive = isActives?.find(a => isSameEVMAddress(a.id, arbiter.id))?.isActive;
        }

        console.log("Reworked arbiters", arbiters);

        state$.next({ isPending: false, wasFetched: true, arbiters });
        return;
      }

      state$.next({ isPending: false, wasFetched: true, arbiters: undefined });
    }
  }, [activeChain, fetchMultiArbiterInfo, fetchMultiArbiterIsActive]);

  // Initial lazy fetch (first access)
  useEffect(() => {
    if (!state.wasFetched && !state.isPending)
      void fetchArbiters();
  }, [fetchArbiters, state]);

  return { fetchArbiters, ...state }
}