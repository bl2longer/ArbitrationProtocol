// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../interfaces/ICompensationManager.sol";
import "../interfaces/IZkService.sol";
import "../interfaces/ITransactionManager.sol";
import "../interfaces/IConfigManager.sol";
import "../interfaces/IArbitratorManager.sol";
import "../libraries/Errors.sol";

contract CompensationManager is ICompensationManager {

    IZkService public zkService;
    ITransactionManager public transactionManager;
    IConfigManager public configManager;
    IArbitratorManager public arbitratorManager;

    // Mapping from claim ID to compensation details
    mapping(bytes32 => CompensationClaim) public claims;

    struct CompensationClaim {
        address dapp;
        address arbitrator;
        uint256 amount;
        bool withdrawn;
        CompensationType claimType;
    }

    enum CompensationType {
        IllegalSignature,
        Timeout,
        FailedArbitration,
        ArbitratorFee
    }

    constructor(
        address _zkService,
        address _transactionManager,
        address _configManager,
        address _arbitratorManager
    ) {
        zkService = IZkService(_zkService);
        transactionManager = ITransactionManager(_transactionManager);
        configManager = IConfigManager(_configManager);
        arbitratorManager = IArbitratorManager(_arbitratorManager);
    }

    function claimIllegalSignatureCompensation(
        address arbitrator,
        bytes calldata btcTx,
        bytes32 evidence
    ) external override returns (bytes32 claimId) {
        // Get ZK verification details
        (bytes memory rawData, bytes memory pubKey, bytes32 txHash, bytes memory signature, bool verified) = zkService.getZkVerification(evidence);
        
        if (rawData.length == 0) revert Errors.EMPTY_RAW_DATA();
        if (pubKey.length == 0) revert Errors.EMPTY_PUBLIC_KEY();
        if (txHash == bytes32(0)) revert Errors.EMPTY_HASH();
        if (signature.length == 0) revert Errors.EMPTY_SIGNATURE();
        if (!verified) revert Errors.INVALID_ZK_PROOF();

        // Check if transaction exists
        bytes32 id = transactionManager.txHashToId(txHash);
        if (id != bytes32(0)) revert Errors.TRANSACTION_EXISTS();

        // Get arbitrator details and verify pubkey match
        DataTypes.ArbitratorInfo memory arbitratorInfo = arbitratorManager.getArbitratorInfo(arbitrator);
        if (arbitratorInfo.operatorBtcPubKey.length == 0) revert Errors.EMPTY_OPERATOR_PUBLIC_KEY();
        if (keccak256(pubKey) != keccak256(arbitratorInfo.operatorBtcPubKey)) revert Errors.PUBLIC_KEY_MISMATCH();
        if (keccak256(btcTx) != keccak256(rawData)) revert Errors.BTC_TRANSACTION_MISMATCH();

        // Get arbitrator's stake amount
        uint256 stakeAmount = arbitratorInfo.ethAmount;
        if (stakeAmount == 0) revert Errors.NO_STAKE_AVAILABLE();

        // Generate claim ID
        claimId = keccak256(abi.encodePacked(block.timestamp, arbitrator, msg.sender, "IllegalSignature"));

        // Create compensation claim
        claims[claimId] = CompensationClaim({
            dapp: msg.sender,
            arbitrator: arbitrator,
            amount: stakeAmount,
            withdrawn: false,
            claimType: CompensationType.IllegalSignature
        });

        // Update arbitrator status
        arbitratorManager.terminateArbitratorWithSlash(arbitrator);

        emit CompensationClaimed(claimId, msg.sender, uint8(CompensationType.IllegalSignature));
    }

    function claimTimeoutCompensation(bytes32 id) external override returns (bytes32 claimId) {
        // Get transaction details
        DataTypes.Transaction memory transaction = transactionManager.getTransactionById(id);
        if (transaction.dapp != msg.sender) revert Errors.NOT_TRANSACTION_OWNER();
        if (transaction.status == DataTypes.TransactionStatus.Completed) revert Errors.TRANSACTION_COMPLETED();
        if (block.timestamp <= transaction.deadline) revert Errors.DEADLINE_NOT_REACHED();
        if (transaction.signature.length > 0) revert Errors.SIGNATURE_ALREADY_SUBMITTED();

        // Get arbitrator's stake amount
        DataTypes.ArbitratorInfo memory arbitratorInfo = arbitratorManager.getArbitratorInfo(transaction.arbitrator);
        uint256 stakeAmount = arbitratorInfo.ethAmount;
        if (stakeAmount == 0) revert Errors.NO_STAKE_AVAILABLE();

        // Generate claim ID
        claimId = keccak256(abi.encodePacked(block.timestamp, transaction.arbitrator, msg.sender, "Timeout", id));

        // Create compensation claim
        claims[claimId] = CompensationClaim({
            dapp: msg.sender,
            arbitrator: transaction.arbitrator,
            amount: stakeAmount,
            withdrawn: false,
            claimType: CompensationType.Timeout
        });

        // Update arbitrator status
        arbitratorManager.terminateArbitratorWithSlash(transaction.arbitrator);

        emit CompensationClaimed(claimId, msg.sender, uint8(CompensationType.Timeout));
    }

    function claimFailedArbitrationCompensation(
        bytes calldata btcTx,
        bytes32 evidence
    ) external override returns (bytes32 claimId) {
        // Get ZK verification details
        (bytes memory rawData, bytes memory pubKey, bytes32 txHash, bytes memory signature, bool verified) = zkService.getZkVerification(evidence);
        
        if (rawData.length == 0) revert Errors.EMPTY_RAW_DATA();
        if (pubKey.length == 0) revert Errors.EMPTY_PUBLIC_KEY();
        if (txHash == bytes32(0)) revert Errors.EMPTY_HASH();
        if (signature.length == 0) revert Errors.EMPTY_SIGNATURE();
        if (verified) revert Errors.INVALID_ZK_PROOF();
        if (keccak256(btcTx) != keccak256(rawData)) revert Errors.BTC_TRANSACTION_MISMATCH();

        // Get transaction details
        DataTypes.Transaction memory transaction = transactionManager.getTransaction(txHash);
        if (transaction.dapp != msg.sender) revert Errors.NOT_TRANSACTION_OWNER();
        if (transaction.signature.length == 0) revert Errors.SIGNATURE_NOT_SUBMITTED();

        // Get transaction signature and verify
        if (keccak256(signature) != keccak256(transaction.signature)) revert Errors.SIGNATURE_MISMATCH();

        // Get arbitrator's stake amount
        DataTypes.ArbitratorInfo memory arbitratorInfo = arbitratorManager.getArbitratorInfo(transaction.arbitrator);
        uint256 stakeAmount = arbitratorInfo.ethAmount;
        if (stakeAmount == 0) revert Errors.NO_STAKE_AVAILABLE();

        // Generate claim ID
        claimId = keccak256(abi.encodePacked(block.timestamp, transaction.arbitrator, msg.sender, "FailedArbitration"));

        // Create compensation claim
        claims[claimId] = CompensationClaim({
            dapp: msg.sender,
            arbitrator: transaction.arbitrator,
            amount: stakeAmount,
            withdrawn: false,
            claimType: CompensationType.FailedArbitration
        });

        // Update arbitrator status
        arbitratorManager.terminateArbitratorWithSlash(transaction.arbitrator);

        emit CompensationClaimed(claimId, msg.sender, uint8(CompensationType.FailedArbitration));
    }

    function claimArbitratorFee(
        bytes32 txId
    ) external override returns (bytes32) {
        // Get transaction details
        DataTypes.Transaction memory transaction = transactionManager.getTransactionById(txId);
        if (transaction.arbitrator != msg.sender) revert Errors.NOT_TRANSACTION_ARBITRATOR();
        if (transaction.status != DataTypes.TransactionStatus.Completed) revert Errors.TRANSACTION_NOT_COMPLETED();

        // Transfer fees and terminate transaction
        (uint256 arbitratorFee, ) = transactionManager.transferArbitrationFee(txId);

        // Generate claim ID
        bytes32 claimId = keccak256(abi.encodePacked(block.timestamp, transaction.arbitrator, msg.sender, "ArbitratorFee"));

        // Create compensation claim
        claims[claimId] = CompensationClaim({
            dapp: transaction.dapp,
            arbitrator: transaction.arbitrator,
            amount: arbitratorFee,
            withdrawn: true,
            claimType: CompensationType.ArbitratorFee
        });

        emit CompensationClaimed(claimId, msg.sender, uint8(CompensationType.ArbitratorFee));
        return claimId;
    }

    function withdrawCompensation(bytes32 claimId) external override payable {
        CompensationClaim storage claim = claims[claimId];
        if (claim.withdrawn) revert Errors.COMPENSATION_WITHDRAWN();
        if (claim.amount == 0) revert Errors.NO_COMPENSATION_AVAILABLE();

        uint256 systemFeeRate = configManager.getSystemCompensationFeeRate();
        uint256 systemFee = claim.amount * systemFeeRate / 10000;
        if (msg.value < systemFee) revert Errors.INSUFFICIENT_SYSTEM_FEE();

        uint256 ethAmount = claim.amount;
        // Mark as withdrawn
        claim.withdrawn = true;
        claim.amount = 0;

        payable(claim.dapp).transfer(ethAmount);

        // Transfer system fee to fee collector
        address payable feeCollector = payable(address(uint160(configManager.getSystemFeeCollector())));
        feeCollector.transfer(systemFee);

        // Refund excess payment
        if (msg.value > systemFee) {
            payable(msg.sender).transfer(msg.value - systemFee);
        }

        emit CompensationWithdrawn(claimId);
    }

    function getClaimableAmount(bytes32 claimId) external view override returns (uint256) {
        CompensationClaim storage claim = claims[claimId];
        if (claim.withdrawn) {
            return 0;
        }
        return claim.amount;
    }
}
