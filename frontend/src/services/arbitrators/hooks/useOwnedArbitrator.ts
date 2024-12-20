/* eslint-disable react-hooks/rules-of-hooks */
import { useWalletContext } from '@/contexts/WalletContext/WalletContext';
import { ChainConfig } from '@/services/chains/chain-config';
import { useActiveEVMChainConfig } from '@/services/chains/hooks/useActiveEVMChainConfig';
import { useCallback } from 'react';
import { create, useStore } from 'zustand';
import { fetchArbitrators } from '../arbitrators.service';
import { ArbitratorInfo } from '../model/arbitrator-info';

// Shared state
const ownedArbitratorStore = create<{
  ownedArbitrator?: ArbitratorInfo;
  isPending: boolean;
  fetchOwnedArbitrator: (activeChain: ChainConfig, evmAccount: string) => Promise<void>;
}>((set) => ({
  ownedArbitrator: undefined,
  isPending: false,
  fetchOwnedArbitrator: async (activeChain: ChainConfig, evmAccount: string) => {
    set({ isPending: true });
    if (activeChain && evmAccount) {
      const { arbitrators } = await fetchArbitrators(activeChain, 0, 100, { creatorEvmAddress: evmAccount });
      set({ ownedArbitrator: arbitrators?.[0], isPending: false });
    } else {
      set({ ownedArbitrator: undefined, isPending: false });
    }
  },
}));

export const useOwnedArbitrator = () => {
  const activeChain = useActiveEVMChainConfig();
  const { evmAccount } = useWalletContext();
  const ownedArbitrator = useStore(ownedArbitratorStore, state => state.ownedArbitrator)
  const isPending = useStore(ownedArbitratorStore, state => state.isPending)

  const fetchOwnedArbitrator = useCallback(
    () => ownedArbitratorStore.getState().fetchOwnedArbitrator(activeChain, evmAccount),
    [activeChain, evmAccount]
  );

  return { ownedArbitrator, isPending, fetchOwnedArbitrator }
}