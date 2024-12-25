
import { useWalletContext } from '@/contexts/WalletContext/WalletContext';
import { useContractCall } from '@/services/evm/hooks/useContractCall';
import { useCallback, useEffect, useState } from 'react';
import { useInterval } from "usehooks-ts";
import abi from "../../../assets/contracts/ERC721.json";

/**
 * Tells if all NFTs in a contract owned by the connected EVM account is approved for transfer.
 */
export const useERC721CheckApproval = (nftContractAddress: string, operator: string) => {
  const { evmAccount } = useWalletContext();
  const { readContract, isPending, isSuccess } = useContractCall();
  const [isApproved, setIsApproved] = useState<boolean>(undefined);

  const checkApproved = useCallback(async () => {
    if (!operator || operator === "") {
      setIsApproved(false);
      return;
    }

    const approved: boolean = await readContract({
      contractAddress: nftContractAddress,
      abi,
      functionName: 'isApprovedForAll',
      args: [evmAccount, operator]
    });

    setIsApproved(approved);
  }, [evmAccount, nftContractAddress, operator, readContract]);

  useInterval(checkApproved, 5000);

  useEffect(() => {
    void checkApproved();
  }, [checkApproved])

  return { checkApproved, isApproved, isPending, isSuccess };
}
