import { useState, useEffect, useMemo, FC, useCallback } from 'react';
import { Form, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { EnsureWalletNetwork } from '@/components/base/EnsureWalletNetwork/EnsureWalletNetwork';
import { StakeType, StakeTypePicker } from '@/components/arbitration/ArbitratorStaking/StakeTypePicker';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useActiveEVMChainConfig } from '@/services/chains/hooks/useActiveEVMChainConfig';
import { useArbitratorRegister } from '@/services/arbitrators/hooks/contract/useArbitratorRegister';
import { useToasts } from '@/services/ui/hooks/useToasts';
import { useNavigate } from 'react-router-dom';
import { ArbitratorInfo } from '@/services/arbitrators/model/arbitrator-info';
import { useConfigManager } from '@/services/config-manager/hooks/useConfigManager';
import { StakeNFTForm } from './StakeNFTForm';
import { StakeCoinForm } from './StakeCoinForm';
import { UnstakeForm } from './UnstakeForm';

/**
 * Component used both to register an arbitrator, and to manage staking, as 
 * registering an arbitrator is basically creating a first stake (contract design).
 */
export const ArbitratorStaking: FC<{
  arbitrator?: ArbitratorInfo; // Edited arbitrator (not used for initia lregistration)
  onOperationComplete?: () => void; // A chain operation has just completed (stake, unstake...)
}> = ({ arbitrator, onOperationComplete }) => {
  const isEditMode = !!arbitrator; // We are in staking edition mode if an arbitrator is passed.
  const [stakeType, setStakeType] = useState<StakeType>("coin");
  const { successToast } = useToasts();
  const navigate = useNavigate();

  const handleOperationComplete = useCallback(() => {
    onOperationComplete?.();
  }, [onOperationComplete]);

  const handleNativeCoinStaked = useCallback(() => {
    if (!isEditMode) {
      successToast(`Arbitrator successfully registered!`);
      // Back to arbitrators list.
      navigate("/arbitrators");
    }

    handleOperationComplete();
  }, [handleOperationComplete, isEditMode, navigate, successToast]);

  return (
    <div>
      <StakeTypePicker value={stakeType} onChange={setStakeType} canUnstake={isEditMode} />
      {stakeType === "coin" && <StakeCoinForm actionLabel={!isEditMode ? "Register" : "Add stake"} onStaked={handleNativeCoinStaked} />}
      {stakeType === "nft" && <StakeNFTForm />}
      {stakeType === "unstake" && <UnstakeForm onUnstaked={handleOperationComplete} />}
    </div>
  )
}

