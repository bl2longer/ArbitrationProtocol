// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../libraries/DataTypes.sol";

interface ITransactionManager {    
    // Register transaction
    function registerTransaction(
        address arbitrator,
        uint256 deadline,
        address compensationReceiver
    ) external payable returns (uint256 id);
    
    // Complete transaction
    function completeTransaction(bytes32 id) external;
    
    // Request arbitration
    function requestArbitration(
        bytes32 id,
        bytes calldata btcTx,
        address timeoutCompensationReceiver
    ) external;
    
    // Submit arbitration result
    function submitArbitration(
        bytes32 id,
        bytes calldata btcTxSignature
    ) external;
    
    // Query transaction
    function getTransaction(bytes32 id) external view returns (DataTypes.Transaction memory);
    
    function getTransaction(bytes calldata btcTx) external view returns (DataTypes.Transaction memory);

    event TransactionRegistered(address indexed dapp, bytes32 indexed txId);
    event TransactionCompleted(address indexed dapp, bytes32 indexed txId);
    event ArbitrationRequested(address indexed dapp, bytes32 indexed txId);
    event ArbitrationSubmitted(address indexed dapp, bytes32 indexed txId);
}