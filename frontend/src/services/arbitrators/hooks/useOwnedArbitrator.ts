/* eslint-disable react-hooks/rules-of-hooks */
import { useWalletContext } from '@/contexts/WalletContext/WalletContext';
import { useActiveEVMChainConfig } from '@/services/chains/hooks/useActiveEVMChainConfig';
import { useBehaviorSubject } from '@/utils/useBehaviorSubject';
import { useCallback, useEffect } from 'react';
import { BehaviorSubject } from 'rxjs';
import { fetchArbitrators } from '../arbitrators.service';
import { ArbitratorInfo } from '../model/arbitrator-info';

const state$ = new BehaviorSubject<{ ownedArbitrator?: ArbitratorInfo; isPending: boolean, wasFetched: boolean }>({
  isPending: false,
  wasFetched: false
});

export const useOwnedArbitrator = () => {
  const activeChain = useActiveEVMChainConfig();
  const { evmAccount } = useWalletContext();
  const state = useBehaviorSubject(state$);

  const fetchOwnedArbitrator = useCallback(async () => {
    state$.next({ isPending: true, wasFetched: false });
    if (activeChain && evmAccount) {
      const { arbitrators } = await fetchArbitrators(activeChain, 0, 100, { creatorEvmAddress: evmAccount });
      state$.next({ ownedArbitrator: arbitrators?.[0], isPending: false, wasFetched: true });
    } else {
      state$.next({ ownedArbitrator: undefined, isPending: false, wasFetched: true });
    }
  }, [activeChain, evmAccount]);

  // Initial lazy fetch (first access)
  useEffect(() => {
    if (!state.wasFetched && !state.isPending)
      void fetchOwnedArbitrator();
  }, [fetchOwnedArbitrator, state]);

  return { fetchOwnedArbitrator, ...state };
};