import { BigInt, ethereum } from "@graphprotocol/graph-ts";
import { Transfer } from "../../generated/BPosNFT/BPosNFT";
import { BPosNFT } from "../../generated/schema";

export function handleNFTTransferred(event: Transfer): void {
  const nft = getNFT(event.block, event.params.tokenId);
  nft.owner = event.params.to.toHexString();
  nft.tokenId = event.params.tokenId;
  nft.save();
}

/**
 * Gets the existing NFT if any, otherwise creates a new one.
 */
function getNFT(block: ethereum.Block, tokenId: BigInt): BPosNFT {
  let existingNFT = BPosNFT.load(tokenId.toHexString());

  if (existingNFT)
    return existingNFT;

  const nft = new BPosNFT(tokenId.toHexString());
  nft.tokenId = tokenId;
  nft.createdAt = block.timestamp;

  return nft;
}