/* eslint-disable react-hooks/rules-of-hooks */
import { useWalletContext } from '@/contexts/WalletContext/WalletContext';
import { useActiveEVMChainConfig } from '@/services/chains/hooks/useActiveEVMChainConfig';
import { useBehaviorSubject } from '@/utils/useBehaviorSubject';
import { useCallback, useEffect } from 'react';
import { BehaviorSubject } from 'rxjs';
import { fetchBPosNfts } from '../bpos-nfts.service';
import { BPosNFT } from '../model/bpos-nft';
import { useNFTInfo } from './contract/useNFTInfo';

const state$ = new BehaviorSubject<{ ownedBPosNFTs?: BPosNFT[]; isPending: boolean, wasFetched: boolean }>({
  isPending: false,
  wasFetched: false
});

export const useOwnedBPosNFTs = () => {
  const activeChain = useActiveEVMChainConfig();
  const { evmAccount } = useWalletContext();
  const state = useBehaviorSubject(state$);
  const { fetchNFTInfo } = useNFTInfo();


  const fetchOwnedBPosNFTs = useCallback(async () => {
    state$.next({ isPending: true, wasFetched: false });
    if (activeChain && evmAccount) {
      const { bposNfts } = await fetchBPosNfts(activeChain, 0, 100, { ownerAddress: evmAccount });

      // Fetch NFTs info/value
      if (bposNfts) {
        for (const nft of bposNfts) {
          const info = await fetchNFTInfo(nft.tokenId)
          nft.setVoteInfo(info);
        }
      }

      state$.next({ ownedBPosNFTs: bposNfts, isPending: false, wasFetched: true });
    } else {
      state$.next({ ownedBPosNFTs: [], isPending: false, wasFetched: true });
    }
  }, [activeChain, evmAccount, fetchNFTInfo]);

  // Initial lazy fetch (first access)
  useEffect(() => {
    if (!state.wasFetched && !state.isPending)
      void fetchOwnedBPosNFTs();
  }, [fetchOwnedBPosNFTs, state]);

  // Reset when chain of wallet changes
  useEffect(() => {
    state$.next({ isPending: false, wasFetched: false, ownedBPosNFTs: undefined });
    void fetchOwnedBPosNFTs();
  }, [activeChain, evmAccount, fetchOwnedBPosNFTs]);

  return { fetchOwnedBPosNFTs, ...state };
};