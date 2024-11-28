// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

library DataTypes {
    enum DAppStatus {
        None,
        Pending,
        Active,
        Suspended,
        Terminated
    }

    enum TransactionStatus {
        Active,
        Completed,
        Arbitrated,
        Expired,
        Disputed
    }

    enum CompensationType {
        IllegalSignature,
        TimeoutPenalty
    }

    struct ArbitratorInfo {
        address arbitrator;        // 仲裁人以太坊地址
        uint256 currentFeeRate;    // 当前费率
        uint256 pendingFeeRate;    // 待生效的新费率
        bool isActive;
        bytes32 activeTransactionId; // 当前进行中的交易ID
        uint256 ethAmount;         // ETH质押数量
        address erc20Token;        // ERC20代币地址
        uint256 erc20Amount;       // ERC20质押数量
        address nftContract;       // NFT合约地址
        uint256[] nftTokenIds;     // NFT token IDs
        address operator;          // 操作员地址
        bytes operatorBtcPubKey;   // 比特币公钥
        string operatorBtcAddress; // 比特币地址
        uint256 lastArbitrationTime; // 最后一次仲裁时间
    }

    struct Transaction {
        address dapp;
        address arbitrator;
        uint256 startTime;
        uint256 deadline;
        bytes btcTx;               // 待签名的比特币交易
        TransactionStatus status;
        uint256 depositedFee;
        bytes signature;           // 仲裁人提交的签名
        address compensationReceiver;           // 错误签名补偿接收地址
        address timeoutCompensationReceiver;    // 超时补偿接收地址
    }

    struct ArbitrationRequest {
        uint256 txId;
        address requester;
        uint256 requestTime;
        uint256 deadline;
        address timeoutCompensationReceiver;
        bool fulfilled;
    }

    struct CompensationClaim {
        address arbitrator;
        address claimer;
        uint256 amount;
        CompensationType claimType;
        bool claimed;
        bytes evidence;
    }
}