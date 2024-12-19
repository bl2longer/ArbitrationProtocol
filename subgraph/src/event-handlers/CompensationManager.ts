import { ethereum, log } from "@graphprotocol/graph-ts";
import { CompensationClaimed, CompensationWithdrawn } from "../../generated/CompensationManager/CompensationManager";
import { CompensationClaim } from "../../generated/schema";

export function handleCompensationClaimed(event: CompensationClaimed): void {
  const compensationClaim = getCompensationClaim(event.block, event.params.claimId.toHexString());
  compensationClaim.claimer = event.params.claimer.toHexString();
  compensationClaim.claimType = contractClaimTypeToString(event.params.claimType);
  compensationClaim.withdrawn = false;
  compensationClaim.save();
}

export function handleCompensationWithdrawn(event: CompensationWithdrawn): void {
  const compensationClaim = getCompensationClaim(event.block, event.params.claimId.toHexString());
  compensationClaim.withdrawn = true;
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
  compensationClaim.claimType = "Unknown";
  compensationClaim.createdAt = block.timestamp;

  return compensationClaim;
}

function contractClaimTypeToString(claimType: i32): string {
  switch (claimType) {
    case 0:
      return "IllegalSignature";
    case 1:
      return "TimeoutPenalty";
    default:
      log.error(`Unknown claim type: ${claimType}`, []);
      return "Unknown";
  }
}