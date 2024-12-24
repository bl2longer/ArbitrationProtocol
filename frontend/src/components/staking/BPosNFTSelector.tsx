import { useNFTInfo } from "@/services/bpos-nfts/hooks/useNFTInfo";
import { useOwnedBPosNFTs } from "@/services/bpos-nfts/hooks/useOwnedBPosNFTs";
import { BPosNFT } from "@/services/bpos-nfts/model/bpos-nft";
import { FC, useState } from "react";
import { Checkbox } from "../ui/checkbox";
import { Loading } from "../base/Loading";
import { formatAddress } from "@/utils/formatAddress";

export const BPosNFTSelector: FC<{
  onSelectionChanged: (selectedNFTs: BPosNFT[]) => void;
}> = ({ onSelectionChanged }) => {
  const { ownedBPosNFTs } = useOwnedBPosNFTs();
  const [selectedNFTs, setSelectedNFTs] = useState<BPosNFT[]>([]);

  const handleSelectionChanged = (nft: BPosNFT, selected: boolean) => {
    const newSelection: BPosNFT[] = [
      ...selectedNFTs.filter(n => n.id !== nft.id),
      ...(selected ? [nft] : [])
    ];

    setSelectedNFTs(newSelection);
    onSelectionChanged(newSelection);
  };

  return <div>
    {
      ownedBPosNFTs?.map(nft => <BPosNFTEntry key={nft.id} nft={nft} onSelectionChanged={(selected) => handleSelectionChanged(nft, selected)} />)
    }
  </div>
}

const BPosNFTEntry: FC<{
  nft: BPosNFT;
  onSelectionChanged: (selected: boolean) => void;
}> = ({ nft, onSelectionChanged }) => {
  const { nftInfo, isPending, isSuccess } = useNFTInfo(nft.tokenId);

  return <div className="flex flex-row items-center gap-2">
    <Checkbox id={nft.id} onCheckedChange={onSelectionChanged} />
    <div className="flex flex-col">
      <label htmlFor={nft.id} className="text-xs">BPoS NFT #{formatAddress(nft.tokenId, [8, 8])}</label>
      <div className="flex items-center space-x-2">
        {!isPending && <>{nftInfo?.getCoinValue()}</>}
      </div>
    </div>
  </div>
}