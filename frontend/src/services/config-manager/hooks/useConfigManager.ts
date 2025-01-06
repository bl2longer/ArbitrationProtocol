import { useActiveEVMChainConfig } from "@/services/chains/hooks/useActiveEVMChainConfig";
import { useBehaviorSubject } from "@/utils/useBehaviorSubject";
import { useCallback } from "react";
import { BehaviorSubject } from "rxjs";
import { ConfigManagerSettings, useConfigManagerSettings } from "./contract/useConfigManagerSettings";

const state$ = new BehaviorSubject<{
  wasFetched: boolean; // Fetching has been tried once
  isPending: boolean; // Fetching is in progress
  configSettings?: ConfigManagerSettings;
}>({ isPending: false, wasFetched: false });

export const useConfigManager = () => {
  const activeChain = useActiveEVMChainConfig();
  const state = useBehaviorSubject(state$);
  const { fetchAllSettings } = useConfigManagerSettings();

  const fetchConfigManagerSettings = useCallback(async () => {
    state$.next({ isPending: true, wasFetched: false });
    if (activeChain) {
      const configSettings = await fetchAllSettings();
      state$.next({ isPending: false, wasFetched: true, configSettings });
    }
  }, [activeChain, fetchAllSettings]);

  // Initial lazy fetch (first access)
  // useEffect(() => {
  //   if (!state.wasFetched && !state.isPending)
  //     void fetchConfigManagerSettings();
  // }, [fetchConfigManagerSettings, state]);

  return { fetchConfigManagerSettings, ...state }
}