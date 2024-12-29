import { BigInt, ethereum, log } from "@graphprotocol/graph-ts";
import { ArbitratorParamsSet, ArbitratorPaused, ArbitratorRegistered, ArbitratorStatusChanged, ArbitratorUnpaused, OperatorSet, OwnershipTransferred, RevenueAddressesSet, StakeAdded, StakeWithdrawn } from "../../generated/ArbitratorManager/ArbitratorManager";
import { ArbiterInfo } from "../../generated/schema";
import { ZERO_ADDRESS } from "../constants";

export function handleArbitratorRegistered(event: ArbitratorRegistered): void {
    const arbitratorAddress = event.params.arbitrator.toHexString();
    const arbitratorInfo = getArbitratorInfo(event.block, arbitratorAddress);

    arbitratorInfo.status = "Active";
    // Operator
    arbitratorInfo.operatorEvmAddress = event.params.operator.toHexString();
    arbitratorInfo.operatorBtcAddress = event.params.btcAddress;
    arbitratorInfo.operatorBtcPubKey = event.params.btcPubKey.toHexString().slice(2);
    // Revenue
    arbitratorInfo.revenueEvmAddress = event.params.revenueAddress.toHexString();
    arbitratorInfo.revenueBtcAddress = event.params.btcAddress;
    arbitratorInfo.revenueBtcPubKey = event.params.btcPubKey.toHexString().slice(2);
    // Settings
    arbitratorInfo.lastArbitrationTime = event.params.deadline.toI32();
    arbitratorInfo.currentFeeRate = event.params.feeRate.toI32();

    arbitratorInfo.save();
}

export function handleArbitratorStatusChanged(event: ArbitratorStatusChanged): void {
    const arbitratorAddress = event.params.arbitrator.toHexString();
    const status = event.params.status;

    const arbitratorInfo = getArbitratorInfo(event.block, arbitratorAddress);
    arbitratorInfo.status = contractArbitratorStatusToString(status);

    arbitratorInfo.save();
}

export function handleStakeAdded(event: StakeAdded): void {
    const arbitratorAddress = event.params.arbitrator.toHexString();
    const assetAddress = event.params.assetAddress.toHexString();

    const arbitratorInfo = getArbitratorInfo(event.block, arbitratorAddress);

    if (assetAddress == ZERO_ADDRESS) {
        // Native coin staking
        arbitratorInfo.ethAmount = arbitratorInfo.ethAmount.plus(event.params.amount); // Native coin amount only
    }
    else {
        // NFT staking
        arbitratorInfo.nftValue = arbitratorInfo.nftValue.plus(event.params.amount);
        // TODO: save NFT ids
    }

    arbitratorInfo.status = contractArbitratorStatusToString(event.params.status);

    arbitratorInfo.save();
}

/**
 * NOTE: withdraw operation takes out everything.
 */
export function handleStakeWithdrawn(event: StakeWithdrawn): void {
    const arbitratorAddress = event.params.arbitrator.toHexString();

    const arbitratorInfo = getArbitratorInfo(event.block, arbitratorAddress);

    arbitratorInfo.ethAmount = new BigInt(0);
    arbitratorInfo.nftValue = new BigInt(0);
    arbitratorInfo.status = "Terminated";

    // TODO: NFT

    arbitratorInfo.save();
}

export function handleArbitratorParamsSet(event: ArbitratorParamsSet): void {
    const arbitratorAddress = event.params.arbitrator.toHexString();
    const feeRate = event.params.feeRate;
    const deadline = event.params.deadline;

    const arbitratorInfo = getArbitratorInfo(event.block, arbitratorAddress);
    arbitratorInfo.currentFeeRate = feeRate.toI32();
    arbitratorInfo.lastArbitrationTime = deadline.toI32();
    arbitratorInfo.status = contractArbitratorStatusToString(event.params.status);

    arbitratorInfo.save();
}

export function handleArbitratorPaused(event: ArbitratorPaused): void {
    const arbitratorAddress = event.params.arbitrator.toHexString();

    const arbitratorInfo = getArbitratorInfo(event.block, arbitratorAddress);
    arbitratorInfo.status = contractArbitratorStatusToString(event.params.status);

    arbitratorInfo.save();
}

export function handleArbitratorUnpaused(event: ArbitratorUnpaused): void {
    const arbitratorAddress = event.params.arbitrator.toHexString();

    const arbitratorInfo = getArbitratorInfo(event.block, arbitratorAddress);
    arbitratorInfo.status = contractArbitratorStatusToString(event.params.status);

    arbitratorInfo.save();
}

export function handleRevenueAddressesSet(event: RevenueAddressesSet): void {
    const arbitratorAddress = event.params.arbitrator.toHexString();

    const arbitratorInfo = getArbitratorInfo(event.block, arbitratorAddress);
    arbitratorInfo.revenueEvmAddress = event.params.ethAddress.toHexString();
    arbitratorInfo.revenueBtcAddress = event.params.btcAddress;
    arbitratorInfo.revenueBtcPubKey = event.params.btcPubKey.toHexString().slice(2);

    arbitratorInfo.save();
}

export function handleOperatorSet(event: OperatorSet): void {
    const arbitratorAddress = event.params.arbitrator.toHexString();

    const arbitratorInfo = getArbitratorInfo(event.block, arbitratorAddress);
    arbitratorInfo.operatorEvmAddress = event.params.operator.toHexString();
    arbitratorInfo.operatorBtcAddress = event.params.btcAddress;
    arbitratorInfo.operatorBtcPubKey = event.params.btcPubKey.toHexString().slice(2);

    arbitratorInfo.save();
}

export function handleOwnershipTransferred(event: OwnershipTransferred): void {
    // TODO
    log.info("handleOwnershipTransferred not implemented", []);
}

/**
 * Gets the existing arbitrator info if any, otherwise creates a new one.
 */
function getArbitratorInfo(block: ethereum.Block, arbitratorAddress: string): ArbiterInfo {
    let existingArbitrator = ArbiterInfo.load(arbitratorAddress);

    if (existingArbitrator)
        return existingArbitrator;

    const arbitratorInfo = new ArbiterInfo(arbitratorAddress);
    arbitratorInfo.createdAt = block.timestamp.toI32();
    arbitratorInfo.address = arbitratorAddress;
    arbitratorInfo.status = "Paused"; // Default state is paused at creation. Owner must set operator, revenue, params info first
    arbitratorInfo.ethAmount = new BigInt(0);
    arbitratorInfo.nftValue = new BigInt(0);
    arbitratorInfo.currentFeeRate = 0;

    arbitratorInfo.operatorEvmAddress = null;
    arbitratorInfo.operatorBtcAddress = null;
    arbitratorInfo.operatorBtcPubKey = null;

    arbitratorInfo.revenueEvmAddress = null;
    arbitratorInfo.revenueBtcAddress = null;
    arbitratorInfo.revenueBtcPubKey = null;

    return arbitratorInfo;
}

function contractArbitratorStatusToString(status: i32): string {
    switch (status) {
        case 0: return "Active";
        case 1: return "Working";
        case 2: return "Paused";
        case 3: return "Terminated";
        case 4: return "Frozen";
        default:
            return "Unknown";
    }
}