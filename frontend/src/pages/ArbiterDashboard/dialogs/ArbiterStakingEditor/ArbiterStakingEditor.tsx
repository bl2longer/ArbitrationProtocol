import { StakeType, StakeTypePicker } from '@/components/staking/StakeTypePicker';
import { FC, useCallback, useState } from 'react';
import { StakeCoinForm } from './StakeCoinForm';
import { StakeNFTForm } from './StakeNFTForm';
import { UnstakeForm } from './UnstakeForm';

/**
 * Component used to manage an existing arbiter staking.
 */
export const ArbiterStakingEditor: FC<{
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

