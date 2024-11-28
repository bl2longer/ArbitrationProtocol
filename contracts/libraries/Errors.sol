// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

library Errors {
    // 管理权限相关
    error NotAdmin();
    error NotAuthorized();
    
    // DApp相关
    error AlreadyRegistered();
    error NotRegistered();
    error InvalidStatus();
    
    // 参数验证相关
    error InvalidAddress();
    error InvalidAmount();
    error InvalidDuration();
    error InvalidFeeRate();
    
    // 交易相关
    error TransactionNotFound();
    error TransactionExpired();
    error ArbitrationNotRequested();
    
    // 仲裁人相关
    error ArbitratorNotActive();
    error UnauthorizedOperator();
    error StakeStillLocked();
    error InsufficientStake();
    
    // 补偿相关
    error ClaimNotValid();
    error AlreadyClaimed();
    error InsufficientBalance();
}