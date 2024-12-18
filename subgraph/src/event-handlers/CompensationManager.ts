import { ethereum } from "@graphprotocol/graph-ts";
import { CompensationClaimed, CompensationWithdrawn } from "../../generated/CompensationManager/CompensationManager";
import { CompensationClaim } from "../../generated/schema";

export function handleCompensationClaimed(event: CompensationClaimed): void {
  const compensationClaim = getCompensationClaim(event.block, event.params.claimId.toHexString());
  compensationClaim.claimer = event.params.claimer.toHexString();
  compensationClaim.claimType = contractClaimTypeToString(event.params.claimType);
  // TODO: need way more info
  compensationClaim.save();
}

export function handleCompensationWithdrawn(event: CompensationWithdrawn): void {
  const compensationClaim = getCompensationClaim(event.block, event.params.claimId.toHexString());
  // TODO: withdrawn, etc
  compensationClaim.save();
}

/**
 * Gets the existing compensation claim if any, otherwise creates a new one.
 */
function getCompensationClaim(block: ethereum.Block, id: string): CompensationClaim {
  let existingCompensationClaim = CompensationClaim.load(id);

  if (existingCompensationClaim) {
    return existingCompensationClaim;
  }

  const compensationClaim = new CompensationClaim(id);
  return compensationClaim;
}

function contractClaimTypeToString(claimType: i32): string {
  switch (claimType) {
    case 0:
      return "IllegalSignature";
    case 1:
      return "TimeoutPenalty";
    default:
      return "Unknown";
  }
}