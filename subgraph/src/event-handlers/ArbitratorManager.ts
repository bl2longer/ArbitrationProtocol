import { BigInt, ethereum } from "@graphprotocol/graph-ts";
import { ArbitratorParamsSet, ArbitratorPaused, ArbitratorRegistered, ArbitratorStatusChanged, ArbitratorUnpaused, OperatorSet, OwnershipTransferred, RevenueAddressesSet, StakeAdded, StakeWithdrawn } from "../../generated/ArbitratorManager/ArbitratorManager";
import { ArbiterInfo } from "../../generated/schema";
import { ZERO_ADDRESS } from "../constants";

export function handleArbitratorRegistered(event: ArbitratorRegistered): void {
    const arbitratorAddress = event.params.arbitrator.toHexString();
    const arbitratorInfo = getArbitratorInfo(event.block, arbitratorAddress);

    arbitratorInfo.status = "Active";
    arbitratorInfo.operatorEvmAddress = event.params.operator.toHexString();
    arbitratorInfo.operatorBtcAddress = event.params.btcAddress;
    arbitratorInfo.operatorBtcPubKey = event.params.btcPubKey.toHexString().slice(2);
    arbitratorInfo.currentFeeRate = event.params.feeRate.toI32();
    arbitratorInfo.revenueEvmAddress = event.params.revenueAddress.toHexString();
    arbitratorInfo.revenueBtcAddress = event.params.btcAddress;
    arbitratorInfo.revenueBtcPubKey = event.params.btcPubKey.toHexString().slice(2);

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
    const amount = event.params.amount;

    // TODO: save event.params.nftTokenIds so UI can easily get the list of staked NFTs

    const arbitratorInfo = getArbitratorInfo(event.block, arbitratorAddress);

    if (assetAddress == ZERO_ADDRESS) // Native token staked - strict equality doesn't work here
        arbitratorInfo.ethAmount = arbitratorInfo.ethAmount.plus(amount);
    else
        throw new Error(`Non native add stake not implemented yet, asset address ${assetAddress} ${assetAddress.length} ${typeof assetAddress} ${ZERO_ADDRESS} ${typeof ZERO_ADDRESS} ${assetAddress === ZERO_ADDRESS}`);

    arbitratorInfo.save();
}

/**
 * NOTE: withdraw operation takes out everything.
 */
export function handleStakeWithdrawn(event: StakeWithdrawn): void {
    const arbitratorAddress = event.params.arbitrator.toHexString();

    const arbitratorInfo = getArbitratorInfo(event.block, arbitratorAddress);

    arbitratorInfo.ethAmount = new BigInt(0);

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

    arbitratorInfo.save();
}

export function handleArbitratorPaused(event: ArbitratorPaused): void {
    const arbitratorAddress = event.params.arbitrator.toHexString();

    const arbitratorInfo = getArbitratorInfo(event.block, arbitratorAddress);
    arbitratorInfo.status = "Paused";

    arbitratorInfo.save();
}

export function handleArbitratorUnpaused(event: ArbitratorUnpaused): void {
    const arbitratorAddress = event.params.arbitrator.toHexString();

    const arbitratorInfo = getArbitratorInfo(event.block, arbitratorAddress);
    arbitratorInfo.status = "Active";

    arbitratorInfo.save();
}

export function handleOwnershipTransferred(event: OwnershipTransferred): void {
    // TODO
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
        default:
            return "Unknown";
    }
}