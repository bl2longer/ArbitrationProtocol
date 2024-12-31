# 仲裁人管理器 (ArbitratorManager)

## 概述
ArbitratorManager 负责管理仲裁人的注册、质押、状态变更等操作。仲裁人需要质押 ETH 或 NFT 才能参与仲裁工作，其状态和活动在协议中被严格管理。

## 核心功能

### 质押操作

```solidity
function stakeETH() external payable;
function stakeNFT(uint256[] calldata tokenIds) external;
function unstake() external;  // 取回所有质押资产
```

### 仲裁人注册

```solidity
function registerArbitratorByStakeETH(
    string calldata defaultBtcAddress,
    bytes calldata defaultBtcPubKey,
    uint256 feeRate,
    uint256 deadline
) external payable;
```
使用 ETH 质押注册为仲裁人：
- `defaultBtcAddress`: 接收收益的比特币地址
- `defaultBtcPubKey`: 对应的比特币公钥
- `feeRate`: 服务费率（基点制，4位小数）
- `deadline`: 注册截止时间戳（0表示无截止时间）

```solidity
function registerArbitratorByStakeNFT(
    uint256[] calldata tokenIds,
    string calldata defaultBtcAddress,
    bytes calldata defaultBtcPubKey,
    uint256 feeRate,
    uint256 deadline
) external;
```
使用 NFT 质押注册为仲裁人：
- `tokenIds`: 要质押的 NFT 代币数组
- 其他参数与 ETH 注册相同

### 配置管理

```solidity
function setOperator(
    address operator,
    bytes calldata btcPubKey,
    string calldata btcAddress
) external;
```
设置操作员地址和比特币凭证。

```solidity
function setRevenueAddresses(
    address ethAddress,
    bytes calldata btcPubKey,
    string calldata btcAddress
) external;
```
配置收益接收地址。

```solidity
function setArbitratorFeeRate(uint256 feeRate) external;
```
更新仲裁人的费率。

```solidity
function setArbitratorDeadline(uint256 deadline) external;
```
设置或延长仲裁人的任期截止时间。

### 状态管理

```solidity
function pause() external;    // 暂停接受新交易
function unpause() external;  // 恢复接受新交易
```

```solidity
function setArbitratorWorking(address arbitrator, bytes32 transactionId) external;
```
标记仲裁人正在处理特定交易（仅限交易管理器调用）。

```solidity
function releaseArbitrator(address arbitrator, bytes32 transactionId) external;
```
解除仲裁人的工作状态（仅限交易管理器调用）。

```solidity
function terminateArbitratorWithSlash(address arbitrator) external;
```
终止仲裁人并没收其质押（仅限补偿管理器调用）。

### 查询功能

```solidity
function getArbitratorInfo(address arbitrator) external view returns (DataTypes.ArbitratorInfo memory);
function getArbitratorOperator(address arbitrator) external view returns (address);
function getArbitratorRevenue(address arbitrator) external view returns (address);
function getArbitratorBtcInfo(address arbitrator) external view returns (DataTypes.BtcInfo memory);
function getArbitratorFeeRate(address arbitrator) external view returns (uint256);
function getArbitratorDeadline(address arbitrator) external view returns (uint256);
function isArbitratorActive(address arbitrator) external view returns (bool);
function isArbitratorWorking(address arbitrator) external view returns (bool);
function getAvailableStake(address arbitrator) external view returns (uint256);
function getTotalNFTStakeValue(address arbitrator) external view returns (uint256);
function isConfigModifiable(address arbitrator) external view returns (bool);
```

## 事件

```solidity
event ArbitratorRegistered(address indexed arbitrator, uint256 stakedAmount);
event ArbitratorUnregistered(address indexed arbitrator);
event ArbitratorStakeETH(address indexed arbitrator, uint256 amount);
event ArbitratorStakeNFT(address indexed arbitrator, uint256[] tokenIds);
event ArbitratorUnstake(address indexed arbitrator);
event ArbitratorOperatorSet(address indexed arbitrator, address indexed operator);
event ArbitratorRevenueSet(address indexed arbitrator, address indexed revenue);
event ArbitratorBtcInfoSet(address indexed arbitrator, string btcAddress, bytes btcPubKey);
event ArbitratorFeeRateSet(address indexed arbitrator, uint256 feeRate);
event ArbitratorDeadlineSet(address indexed arbitrator, uint256 deadline);
event ArbitratorPaused(address indexed arbitrator);
event ArbitratorUnpaused(address indexed arbitrator);
event ArbitratorWorking(address indexed arbitrator, bytes32 indexed transactionId);
event ArbitratorReleased(address indexed arbitrator, bytes32 indexed transactionId);
event ArbitratorTerminated(address indexed arbitrator);
