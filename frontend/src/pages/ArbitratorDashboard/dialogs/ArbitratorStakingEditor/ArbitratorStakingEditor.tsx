import { useState, useEffect, useMemo, FC, useCallback } from 'react';
import { Form, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { EnsureWalletNetwork } from '@/components/base/EnsureWalletNetwork/EnsureWalletNetwork';
import { StakeType, StakeTypePicker } from '@/components/staking/StakeTypePicker';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useActiveEVMChainConfig } from '@/services/chains/hooks/useActiveEVMChainConfig';
import { useArbitratorStake } from '@/services/arbitrators/hooks/contract/useArbitratorStake';
import { useToasts } from '@/services/ui/hooks/useToasts';
import { useNavigate } from 'react-router-dom';
import { ArbitratorInfo } from '@/services/arbitrators/model/arbitrator-info';
import { useConfigManager } from '@/services/config-manager/hooks/useConfigManager';
import { StakeNFTForm } from './StakeNFTForm';
import { StakeCoinForm } from './StakeCoinForm';
import { UnstakeForm } from './UnstakeForm';

/**
 * Component used to manage an existing arbitrator staking.
 */
export const ArbitratorStakingEditor: FC<{
  onOperationComplete?: () => void; // A chain operation has just completed (stake, unstake...)
}> = ({ onOperationComplete }) => {
  const [stakeType, setStakeType] = useState<StakeType>("coin");

  const handleOperationComplete = useCallback(() => {
    onOperationComplete?.();
  }, [onOperationComplete]);

  const handleNativeCoinStaked = useCallback(() => {
    handleOperationComplete();
  }, [handleOperationComplete]);

  return (
    <div>
      <StakeTypePicker value={stakeType} onChange={setStakeType} canUnstake={true} />
      {stakeType === "coin" && <StakeCoinForm actionLabel={"Add stake"} onStaked={handleNativeCoinStaked} />}
      {stakeType === "nft" && <StakeNFTForm />}
      {stakeType === "unstake" && <UnstakeForm onUnstaked={handleOperationComplete} />}
    </div>
  )
}

