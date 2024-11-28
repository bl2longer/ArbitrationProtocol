# 仲裁人管理器 (ArbitratorManager)

## 概述
ArbitratorManager 负责管理仲裁人的注册、质押、状态变更等操作。仲裁人需要质押一定数量的代币才能参与仲裁工作，并且在完成仲裁后会有一定的冻结期。

## 功能特性
- 仲裁人注册与管理
- 质押代币管理（ETH、ERC20、NFT）
- 仲裁人状态管理
- 操作员授权管理
- 仲裁冻结期管理

## 仲裁人生命周期

### 1. 注册和质押
仲裁人通过质押资产来注册。支持以下质押方式：
- ETH 质押
- ERC20 代币质押
- NFT 质押

```solidity
function stakeETH() external payable;
function stakeERC20(address token, uint256 amount) external;
function stakeNFT(address nftContract, uint256[] calldata tokenIds) external;
```

### 2. 配置设置
注册后，仲裁人需要完成以下配置才能开始服务：

#### 2.1 操作员设置
设置负责签名的操作员及其比特币信息：
```solidity
function setOperator(
    address operator,
    bytes calldata btcPubKey,
    string calldata btcAddress
) external;
```

#### 2.2 收益地址设置
配置接收收益的地址：
```solidity
function setRevenueAddresses(
    address ethAddress,
    bytes calldata btcPubKey,
    string calldata btcAddress
) external;
```

#### 2.3 仲裁参数设置
- 仲裁人在完成一次仲裁后，会进入为期7天的冻结期
- 在冻结期内，仲裁人不能参与新的仲裁工作
- 仲裁人必须等待最后一次仲裁的冻结期结束后才能取消质押：

设置服务参数：
```solidity
function setArbitratorParams(
    uint256 feeRate,
    uint256 termDuration
) external;
```

### 3. 运行时管理

#### 3.1 状态管理
仲裁人可以暂停和恢复服务：
```solidity
function pause() external;    // 暂停接受新交易
function unpause() external;  // 恢复接受新交易
```

#### 3.2 质押取回
当没有进行中的交易时，可以取回质押：
```solidity
function unstake() external;  // 取回全部质押资产
```

### 4. 查询功能
提供多个查询接口：
```solidity
struct ArbitratorInfo {
    address operator;          // 操作者地址
    uint256 stakedAmount;      // 质押金额
    uint256 stakeLockedTime;   // 质押锁定时间
    uint256 lastArbitrationTime; // 最后一次仲裁时间
    bool isActive;             // 是否激活
    bytes operatorBtcPubKey;   // 比特币公钥
    string operatorBtcAddress; // 比特币地址
}

function getArbitratorStatus(address arbitrator) external view returns (ArbitratorInfo memory);
function isOperatorOf(address arbitrator, address operator) external view returns (bool);
function canUnstake(address arbitrator) external view returns (bool);
function isPaused(address arbitrator) external view returns (bool);
function getAvailableStake(address arbitrator) external view returns (uint256);
```

## 工作流程

### 1. 成为仲裁人
1. 质押资产（ETH/ERC20/NFT）
2. 设置操作员信息（可以是自己）
3. 设置收益地址
4. 配置仲裁参数（费率等）

### 2. 提供仲裁服务
1. 确保状态为活跃（非暂停）
2. 等待交易匹配（由 TransactionManager 负责）
3. 操作员负责提交仲裁签名

### 3. 暂停服务
1. 调用 pause() 暂停接受新交易
2. 等待现有交易完成
3. 如果没有进行中的交易，可以取回质押

### 4. 退出服务
1. 确保没有进行中的交易
2. 调用 unstake() 取回全部质押资产

## 事件系统

### 质押相关事件
```solidity
event StakeAdded(
    address indexed arbitrator, 
    address indexed assetAddress,
    uint256 amount,
    uint256[] nftTokenIds
);

event StakeRemoved(
    address indexed arbitrator, 
    address indexed assetAddress,
    uint256 amount,
    uint256[] nftTokenIds
);
```

### 配置更新事件
```solidity
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
```

### 状态变更事件
```solidity
event ArbitratorStatusChanged(
    address indexed arbitrator,
    bool isPaused
);

event ArbitratorTermStarted(
    address indexed arbitrator,
    uint256 startTime,
    uint256 endTime
);
```

## 使用示例

### 示例 1: 注册成为仲裁人
```javascript
// 1. 质押 ETH
await arbitratorManager.stakeETH({ value: ethers.utils.parseEther("10") });

// 2. 设置操作员（使用自己作为操作员）
await arbitratorManager.setOperator(
    myAddress,
    btcPubKey,
    btcAddress
);

// 3. 设置收益地址
await arbitratorManager.setRevenueAddresses(
    myEthAddress,
    btcPubKey,
    btcAddress
);

// 4. 设置仲裁参数
await arbitratorManager.setArbitratorParams(
    100,                             // 1% 费率
    30 * 24 * 3600                  // 30天任期
);
```

### 示例 2: 检查仲裁人状态
```javascript
// 1. 检查是否可以参与仲裁
const canUnstake = await arbitratorManager.canUnstake(arbitratorAddress);

// 2. 获取详细信息
const info = await arbitratorManager.getArbitratorInfo(arbitratorAddress);
const frozenUntil = info.lastArbitrationTime + frozenPeriod;

// 3. 检查可用质押金额
const availableStake = await arbitratorManager.getAvailableStake(arbitratorAddress);
```

### 示例 3: 暂停和恢复服务
```javascript
// 暂停服务
await arbitratorManager.pause();

// 检查是否可以取回质押
const canUnstake = await arbitratorManager.canUnstake(myAddress);

// 如果可以取回质押，则退出服务
if (canUnstake) {
    await arbitratorManager.unstake();
}

// 恢复服务
await arbitratorManager.unpause();
```

## 错误处理
合约会在以下情况抛出错误：
- 质押金额不足（InsufficientStake）
- 仲裁人未激活（ArbitratorNotActive）
- 操作员未授权（UnauthorizedOperator）
- 质押仍被锁定（StakeStillLocked）
- 参数无效（InvalidFeeRate）

## 安全考虑
1. 质押锁定机制确保仲裁人在服务期间不能撤回质押
2. 操作员授权机制保护签名权限
3. 状态管理确保服务的平滑过渡
4. 参数限制防止无效配置

## 最佳实践
1. 在质押前充分了解协议机制
2. 合理设置费率
3. 妥善保管操作员私钥
4. 定期检查仲裁人状态和进行中的交易
5. 在退出前确保所有交易都已完成
