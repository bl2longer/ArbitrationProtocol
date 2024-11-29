// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../libraries/DataTypes.sol";

interface ITransactionManager {    
    // 登记交易
    function registerTransaction(
        bytes32 id,
        address arbitrator,
        uint256 deadline,
        address compensationReceiver
    ) external payable returns (uint256 txId);
    
    // 完成交易
    function completeTransaction(bytes32 txId) external;
    
    // 请求仲裁
    function requestArbitration(
        bytes32 id,
        bytes calldata btcTx,
        address timeoutCompensationReceiver
    ) external;
    
    // 提交仲裁结果
    function submitArbitration(
        bytes32 id,
        bytes32 btcTxId
    ) external;
    
    // 查询交易
    function getTransaction(bytes32 id) external view returns (DataTypes.Transaction memory);
    
    function getTransaction(bytes calldata btcTx) external view returns (DataTypes.Transaction memory);

    event TransactionRegistered(address indexed dapp, bytes32 indexed txId);
    event TransactionCompleted(address indexed dapp, bytes32 indexed txId);
    event ArbitrationRequested(address indexed dapp, bytes32 indexed txId);
    event ArbitrationSubmitted(address indexed dapp, bytes32 indexed txId);
}