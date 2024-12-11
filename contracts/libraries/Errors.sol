// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

library Errors {
    // Common errors
    error ZERO_ADDRESS();
    error NOT_AUTHORIZED();
    error INVALID_PARAMETER();
    error INSUFFICIENT_BALANCE();
    error NOT_TRANSACTION_MANAGER();
    error NOT_ARBITRATOR_MANAGER();
    error NOT_CONFIG_MANAGER();
    error NOT_DAPP_REGISTRY();
    error NOT_INITIALIZED();
    error ALREADY_INITIALIZED();
    error INVALID_DURATION();
    error LENGTH_MISMATCH();
    
    // DApp related errors
    error DAPP_ALREADY_REGISTERED();
    error DAPP_NOT_REGISTERED();
    error DAPP_NOT_ACTIVE();
    error INVALID_DAPP_STATUS();
    
    // Transaction related errors
    error TRANSACTION_NOT_FOUND();
    error TRANSACTION_EXPIRED();
    error INVALID_TRANSACTION_STATUS();
    error INVALID_DEADLINE();
    error INVALID_FEE();
    error INSUFFICIENT_FEE();
    error INVALID_TRANSACTION_ID();
    
    // Arbitrator related errors
    error ARBITRATOR_ALREADY_REGISTERED();
    error ARBITRATOR_NOT_REGISTERED();
    error ARBITRATOR_NOT_ACTIVE();
    error ARBITRATOR_ALREADY_WORKING();
    error ARBITRATOR_NOT_WORKING();
    error INVALID_ARBITRATOR_STATUS();
    error INVALID_STAKE_AMOUNT();
    error INVALID_FEE_RATE();
    error STAKE_STILL_LOCKED();
    error INSUFFICIENT_STAKE();
    error STAKE_EXCEEDS_MAX();
    error INVALID_TOKEN();
    error INVALID_TOKEN_ID();
    error TRANSFER_FAILED();
    
    // Config related errors
    error INVALID_CONFIG_KEY();
    error INVALID_CONFIG_VALUE();
    error CONFIG_NOT_FOUND();
    
    // Operator related errors
    error OPERATOR_ALREADY_REGISTERED();
    error OPERATOR_NOT_REGISTERED();
    error OPERATOR_NOT_AUTHORIZED();
}