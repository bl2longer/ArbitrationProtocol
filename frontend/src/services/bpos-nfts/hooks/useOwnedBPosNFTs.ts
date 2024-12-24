/* eslint-disable react-hooks/rules-of-hooks */
import { useWalletContext } from '@/contexts/WalletContext/WalletContext';
import { useActiveEVMChainConfig } from '@/services/chains/hooks/useActiveEVMChainConfig';
import { useBehaviorSubject } from '@/utils/useBehaviorSubject';
import { useCallback, useEffect } from 'react';
import { BehaviorSubject } from 'rxjs';
import { fetchBPosNfts } from '../bpos-nfts.service';
import { BPosNFT } from '../model/bpos-nft';

const state$ = new BehaviorSubject<{ ownedBPosNFTs?: BPosNFT[]; isPending: boolean, wasFetched: boolean }>({
  isPending: false,
  wasFetched: false
});

export const useOwnedBPosNFTs = () => {
  const activeChain = useActiveEVMChainConfig();
  const { evmAccount } = useWalletContext();
  const state = useBehaviorSubject(state$);

  const fetchOwnedBPosNFTs = useCallback(async () => {
    state$.next({ isPending: true, wasFetched: false });
    if (activeChain && evmAccount) {
      // TMP HARDCODED ADDRESS
      const { bposNfts } = await fetchBPosNfts(activeChain, 0, 100, { ownerAddress: "0x0ad689150eb4a3c541b7a37e6c69c1510bcb27a4" /* evmAccount */ });
      state$.next({ ownedBPosNFTs: bposNfts, isPending: false, wasFetched: true });
    } else {
      state$.next({ ownedBPosNFTs: [], isPending: false, wasFetched: true });
    }
  }, [activeChain, evmAccount]);

  // Initial lazy fetch (first access)
  useEffect(() => {
    if (!state.wasFetched && !state.isPending)
      void fetchOwnedBPosNFTs();
  }, [fetchOwnedBPosNFTs, state]);

  return { fetchOwnedBPosNFTs, ...state };
};