import { BigInt, ethereum } from "@graphprotocol/graph-ts";
import { ArbitratorDeadlineUpdated, ArbitratorFeeRateUpdated, ArbitratorPaused, ArbitratorRegistered, ArbitratorReleased, ArbitratorUnpaused, ArbitratorWorking, OperatorSet, RevenueAddressesSet, StakeAdded, StakeWithdrawn } from "../../generated/ArbitratorManager/ArbitratorManager";
import { ArbiterInfo } from "../../generated/schema";
import { ZERO_ADDRESS } from "../constants";

export function handleArbitratorRegistered(event: ArbitratorRegistered): void {
    const arbitratorAddress = event.params.arbitrator.toHexString();
    const arbitratorInfo = getArbitratorInfo(event.block, arbitratorAddress);

    // Operator
    arbitratorInfo.operatorEvmAddress = event.params.operator.toHexString();
    arbitratorInfo.operatorBtcAddress = event.params.btcAddress;
    arbitratorInfo.operatorBtcPubKey = event.params.btcPubKey.toHexString().slice(2);
    // Revenue
    arbitratorInfo.revenueEvmAddress = event.params.revenueAddress.toHexString();
    arbitratorInfo.revenueBtcAddress = event.params.btcAddress;
    arbitratorInfo.revenueBtcPubKey = event.params.btcPubKey.toHexString().slice(2);
    // Settings
    arbitratorInfo.deadLine = event.params.deadline.toI32();
    arbitratorInfo.currentFeeRate = event.params.feeRate.toI32();

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

    arbitratorInfo.save();
}

/**
 * NOTE: withdraw operation takes out everything.
 */
export function handleStakeWithdrawn(event: StakeWithdrawn): void {
    const arbitratorInfo = getArbitratorInfo(event.block, event.params.arbitrator.toHexString());

    arbitratorInfo.ethAmount = new BigInt(0);
    arbitratorInfo.nftValue = new BigInt(0);

    // TODO: NFT

    arbitratorInfo.save();
}

export function handleArbitratorDeadlineUpdated(event: ArbitratorDeadlineUpdated): void {
    const arbitratorInfo = getArbitratorInfo(event.block, event.params.arbitrator.toHexString());
    arbitratorInfo.deadLine = event.params.deadline.toI32();
    arbitratorInfo.save();
}

export function handleArbitratorFeeRateUpdated(event: ArbitratorFeeRateUpdated): void {
    const arbitratorInfo = getArbitratorInfo(event.block, event.params.arbitrator.toHexString());
    arbitratorInfo.currentFeeRate = event.params.feeRate.toI32();
    arbitratorInfo.save();
}

export function handleArbitratorPaused(event: ArbitratorPaused): void {
    const arbitratorInfo = getArbitratorInfo(event.block, event.params.arbitrator.toHexString());
    arbitratorInfo.paused = true;
    arbitratorInfo.save();
}

export function handleArbitratorUnpaused(event: ArbitratorUnpaused): void {
    const arbitratorInfo = getArbitratorInfo(event.block, event.params.arbitrator.toHexString());
    arbitratorInfo.paused = false;
    arbitratorInfo.save();
}

export function handleRevenueAddressesSet(event: RevenueAddressesSet): void {
    const arbitratorInfo = getArbitratorInfo(event.block, event.params.arbitrator.toHexString());
    arbitratorInfo.revenueEvmAddress = event.params.ethAddress.toHexString();
    arbitratorInfo.revenueBtcAddress = event.params.btcAddress;
    arbitratorInfo.revenueBtcPubKey = event.params.btcPubKey.toHexString().slice(2);
    arbitratorInfo.save();
}

export function handleOperatorSet(event: OperatorSet): void {
    const arbitratorInfo = getArbitratorInfo(event.block, event.params.arbitrator.toHexString());
    arbitratorInfo.operatorEvmAddress = event.params.operator.toHexString();
    arbitratorInfo.operatorBtcAddress = event.params.btcAddress;
    arbitratorInfo.operatorBtcPubKey = event.params.btcPubKey.toHexString().slice(2);
    arbitratorInfo.save();
}

export function handleArbitratorWorking(event: ArbitratorWorking): void {
    const arbitratorInfo = getArbitratorInfo(event.block, event.params.arbitrator.toHexString());
    arbitratorInfo.activeTransactionId = event.params.transactionId.toHexString();
    arbitratorInfo.save();
}

export function handleArbitratorReleased(event: ArbitratorReleased): void {
    const arbitratorInfo = getArbitratorInfo(event.block, event.params.arbitrator.toHexString());
    arbitratorInfo.activeTransactionId = null;
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
    arbitratorInfo.paused = false;
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
