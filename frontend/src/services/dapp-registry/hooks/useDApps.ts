import { useActiveEVMChainConfig } from "@/services/chains/hooks/useActiveEVMChainConfig";
import { useCallback, useEffect, useState } from "react";
import { fetchDApps } from "../dapp-registry.service";
import { DApp } from "../model/dapp";

export const useDApps = () => {
  const activeChain = useActiveEVMChainConfig();
  const [dapps, setDapps] = useState<DApp[]>([]);

  const refreshDapps = useCallback(() => {
    setDapps(undefined);
    if (activeChain) {
      void fetchDApps(activeChain, 0, 100).then(({ dapps: _dapps }) => {
        setDapps(_dapps);
      });
    }
  }, [activeChain]);

  useEffect(() => {
    refreshDapps();
  }, [refreshDapps]);

  return { dapps, refreshDapps }
}