
import { useContractCall } from '@/services/evm/hooks/useContractCall';
import { useCallback } from 'react';
import abi from "../../../assets/contracts/ERC721.json";

/**
 * Gives all NFTs in a contract owned by the connected EVM account approval to be transfered to the given operator.
 */
export const useERC721Approve = (nftContractAddress: string, operator: string) => {
  const { writeContract, isPending, isSuccess } = useContractCall();

  const approveNFTTransfer = useCallback(async (): Promise<boolean> => {
    const { receipt } = await writeContract({
      contractAddress: nftContractAddress,
      abi,
      functionName: 'setApprovalForAll',
      args: [operator, true]
    });

    return !!receipt;
  }, [nftContractAddress, operator, writeContract]);

  return { approveNFTTransfer, isPending, isSuccess };
}
