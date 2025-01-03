// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface ICompensationManager {
    // Submit illegal signature compensation claim
    function claimIllegalSignatureCompensation(
        address arbitrator,
        bytes calldata btcTx,
        bytes32 evidence
    ) external returns (bytes32 claimId);

    // Submit timeout compensation claim
    function claimTimeoutCompensation(
        bytes32 id
    ) external returns (bytes32 claimId);
    
    // Submit failed arbitration compensation claim
    function claimFailedArbitrationCompensation(
        bytes calldata btcTx,
        bytes32 evidence
    ) external returns (bytes32 claimId);

    /**
     * @notice Claim arbitrator fee when DApp hasn't completed the transaction after signature submission and lock period
     * @param txId Transaction ID
     * @dev Requirements:
     *  - Transaction must exist
     *  - Caller must be the arbitrator of the transaction
     *  - Arbitrator must have submitted valid signature
     *  - Lock period must have passed
     *  - Transaction must not be completed
     * @return claimId Unique identifier for the claim
     */
    function claimArbitratorFee(
        bytes32 txId
    ) external returns (bytes32 claimId);

    // Withdraw compensation
    function withdrawCompensation(bytes32 claimId) external payable;
    
    // Query claimable compensation amount
    function getClaimableAmount(
        bytes32 claimId
    ) external view returns (uint256);

    // Initialize compensation manager
    function initialize(
        address _zkService,
        address _configManager,
        address _arbitratorManager
    ) external;

    // Setter methods for critical interfaces
    function setZkService(address _zkService) external;
    function setTransactionManager(address _transactionManager) external;
    function setConfigManager(address _configManager) external;
    function setArbitratorManager(address _arbitratorManager) external;

    // Events
    event CompensationClaimed(bytes32 indexed claimId, address indexed claimer, uint8 claimType);
    event CompensationWithdrawn(bytes32 indexed claimId, address indexed recipient, uint256 fee);
    event ZkServiceUpdated(address indexed newZkService);
    event TransactionManagerUpdated(address indexed newTransactionManager);
    event ConfigManagerUpdated(address indexed newConfigManager);
    event ArbitratorManagerUpdated(address indexed newArbitratorManager);
}