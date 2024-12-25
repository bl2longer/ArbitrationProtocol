/* eslint-disable react-hooks/rules-of-hooks */
import { useWalletContext } from '@/contexts/WalletContext/WalletContext';
import { useActiveEVMChainConfig } from '@/services/chains/hooks/useActiveEVMChainConfig';
import { useBehaviorSubject } from '@/utils/useBehaviorSubject';
import { useCallback, useEffect } from 'react';
import { BehaviorSubject } from 'rxjs';
import { fetchArbiters } from '../arbiters.service';
import { ArbiterInfo } from '../model/arbiter-info';

const state$ = new BehaviorSubject<{ ownedArbiter?: ArbiterInfo; isPending: boolean, wasFetched: boolean }>({
  isPending: false,
  wasFetched: false
});

export const useOwnedArbiter = () => {
  const activeChain = useActiveEVMChainConfig();
  const { evmAccount } = useWalletContext();
  const state = useBehaviorSubject(state$);

  const fetchOwnedArbiter = useCallback(async () => {
    state$.next({ isPending: true, wasFetched: false });
    if (activeChain && evmAccount) {
      const { arbiters } = await fetchArbiters(activeChain, 0, 100, { creatorEvmAddress: evmAccount });
      state$.next({ ownedArbiter: arbiters?.[0], isPending: false, wasFetched: true });
    } else {
      state$.next({ ownedArbiter: undefined, isPending: false, wasFetched: true });
    }
  }, [activeChain, evmAccount]);

  // Initial lazy fetch (first access)
  useEffect(() => {
    if (!state.wasFetched && !state.isPending)
      void fetchOwnedArbiter();
  }, [fetchOwnedArbiter, state]);

  // Reset when chain of wallet changes
  useEffect(() => {
    state$.next({ isPending: false, wasFetched: false, ownedArbiter: undefined });
    void fetchOwnedArbiter();
  }, [activeChain, evmAccount, fetchOwnedArbiter]);

  return { fetchOwnedArbiter, ...state };
};