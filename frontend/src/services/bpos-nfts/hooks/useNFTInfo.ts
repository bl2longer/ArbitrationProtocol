import { useActiveEVMChainConfig } from '@/services/chains/hooks/useActiveEVMChainConfig';
import { dtoToClass } from '@/services/class-transformer/class-transformer-utils';
import { useContractCall } from '@/services/evm/hooks/useContractCall';
import { useCallback, useEffect, useState } from 'react';
import { abi } from "../../../../contracts/interfaces/IBNFTInfo.sol/IBNFTInfo.json";
import { BNFTVoteInfo } from '../model/bnft-vote-info';

export const useNFTInfo = (tokenId: string) => {
  const activeChain = useActiveEVMChainConfig();
  const { readContract, isPending, isSuccess } = useContractCall();
  const [nftInfo, setNFTInfo] = useState<BNFTVoteInfo>(undefined);

  const fetchNFTInfo = useCallback(async (): Promise<BNFTVoteInfo> => {
    const contractInfoResult = await readContract({
      contractAddress: activeChain?.contracts.nftInfo,
      abi,
      functionName: 'getNftInfo',
      args: [tokenId]
    });

    if (contractInfoResult === undefined) {
      setNFTInfo(undefined);
      return undefined;
    }

    const convertedNftInfo: BNFTVoteInfo = dtoToClass(contractInfoResult[1], BNFTVoteInfo);

    console.log("nft Info for token id", tokenId, ":", contractInfoResult, convertedNftInfo);

    setNFTInfo(convertedNftInfo);
    return contractInfoResult;
  }, [activeChain, readContract, tokenId]);

  useEffect(() => {
    void fetchNFTInfo();
  }, [fetchNFTInfo]);

  return { nftInfo, isPending, isSuccess };
};
