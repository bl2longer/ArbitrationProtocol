// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../libraries/DataTypes.sol";

interface IArbitratorManager {
    // 质押相关操作
    function stakeETH() external payable;
    function stakeERC20(address token, uint256 amount) external;
    function stakeNFT(address nftContract, uint256[] calldata tokenIds) external;
    function unstake() external;  // 取回全部质押资产

    // 设置操作员信息
    function setOperator(
        address operator,
        bytes calldata btcPubKey,
        string calldata btcAddress
    ) external;

    // 设置收益地址
    function setRevenueAddresses(
        address ethAddress,
        bytes calldata btcPubKey,
        string calldata btcAddress
    ) external;
    
    // 设置仲裁人参数
    function setArbitratorParams(
        uint256 feeRate,
        uint256 termDuration  // 任期时长，从设置时开始计算
    ) external;
    
    // 仲裁人状态管理
    function pause() external;    // 暂停接受新交易
    function unpause() external;  // 恢复接受新交易
    
    // 查询接口
    function getArbitratorInfo(address arbitrator) external view returns (DataTypes.ArbitratorInfo memory);
    function getAvailableStake(address arbitrator) external view returns (uint256);
    function isOperatorOf(address arbitrator, address operator) external view returns (bool);
    function canUnstake(address arbitrator) external view returns (bool);
    function isPaused(address arbitrator) external view returns (bool);
    
    // 事件
    event StakeAdded(
        address indexed arbitrator, 
        address indexed assetAddress,  // 0x0 for ETH
        uint256 amount,
        uint256[] nftTokenIds
    );
    
    event StakeRemoved(
        address indexed arbitrator, 
        address indexed assetAddress,
        uint256 amount,
        uint256[] nftTokenIds
    );
    
    event OperatorUpdated(
        address indexed arbitrator, 
        address indexed operator,
        bytes btcPubKey,
        string btcAddress
    );
    
    event RevenueAddressesUpdated(
        address indexed arbitrator,
        address ethAddress,
        bytes btcPubKey,
        string btcAddress
    );
    
    event ArbitratorParamsUpdated(
        address indexed arbitrator,
        uint256 feeRate,
        uint256 termDuration
    );
    
    event ArbitratorStatusChanged(
        address indexed arbitrator,
        bool isPaused
    );
    
    event ArbitratorTermStarted(
        address indexed arbitrator,
        uint256 startTime,
        uint256 endTime
    );
}