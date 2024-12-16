# 配置管理器 (ConfigManager)

## 概述
ConfigManager 是仲裁协议的配置管理中心，负责管理和维护协议中的各项参数配置。它提供了一个集中式的配置管理接口，确保协议中的各个组件能够正确地访问和更新配置信息。

## 功能特性
- 仲裁费用管理
- 仲裁冻结期管理
- 系统参数配置
- 配置更新和查询

## 核心功能

### 1. 仲裁费用管理
设置和查询仲裁费用：
```solidity
function setArbitrationFee(uint256 fee) external;
function getArbitrationFee() external view returns (uint256);
```

参数说明：
- fee: 仲裁费用金额（以 wei 为单位）
- 返回值: 当前设置的仲裁费用

### 2. 仲裁冻结期管理
设置和查询仲裁冻结期：
```solidity
function setArbitrationFrozenPeriod(uint256 period) external;
function getArbitrationFrozenPeriod() external view returns (uint256);
```

参数说明：
- period: 仲裁冻结期时长（以秒为单位）
- 返回值: 当前设置的冻结期时长

### 3. 最小质押金额管理
设置和查询最小质押金额：
```solidity
function setMinStakeAmount(uint256 amount) external;
function getMinStakeAmount() external view returns (uint256);
```

参数说明：
- amount: 最小质押金额（以 wei 为单位）
- 返回值: 当前设置的最小质押金额

### 4. 仲裁超时时间管理
设置和查询仲裁超时时间：
```solidity
function setArbitrationTimeout(uint256 timeout) external;
function getArbitrationTimeout() external view returns (uint256);
```

参数说明：
- timeout: 仲裁超时时间（以秒为单位）
- 返回值: 当前设置的超时时间

## 事件系统
```solidity
event ArbitrationFeeUpdated(
    uint256 oldFee,
    uint256 newFee
);

event ArbitrationFrozenPeriodUpdated(
    uint256 oldPeriod,
    uint256 newPeriod
);

event MinStakeAmountUpdated(
    uint256 oldAmount,
    uint256 newAmount
);

event ArbitrationTimeoutUpdated(
    uint256 oldTimeout,
    uint256 newTimeout
);
```

## 错误处理
合约会在以下情况抛出错误：
- 无效的费用金额（InvalidFeeAmount）
- 无效的时间周期（InvalidPeriod）
- 无效的质押金额（InvalidStakeAmount）
- 无效的超时时间（InvalidTimeout）
- 未经授权的操作（Unauthorized）

## 安全考虑
1. 参数范围验证
2. 权限控制
3. 状态一致性
4. 更新操作的原子性
5. 配置变更的审计日志

## 与其他组件的交互
1. ArbitratorManager：提供仲裁人相关配置
2. TransactionManager：提供交易相关配置
3. CompensationManager：提供补偿相关配置
4. DAppRegistry：提供 DApp 相关配置

## 最佳实践
1. 定期检查配置参数
2. 根据网络状况调整超时时间
3. 合理设置质押金额
4. 记录配置变更历史
5. 定期验证配置有效性

## 使用示例

### 示例 1: 更新仲裁费用
```javascript
// 1. 获取当前费用
const currentFee = await configManager.getArbitrationFee();

// 2. 设置新的费用
const newFee = ethers.utils.parseEther("0.1"); // 0.1 ETH
await configManager.setArbitrationFee(newFee);

// 3. 验证更新
const updatedFee = await configManager.getArbitrationFee();
console.log("Fee updated:", ethers.utils.formatEther(updatedFee));
```

### 示例 2: 配置仲裁冻结期
```javascript
// 1. 获取当前冻结期
const currentPeriod = await configManager.getArbitrationFrozenPeriod();

// 2. 设置新的冻结期（7天）
const newPeriod = 7 * 24 * 60 * 60; // 7 days in seconds
await configManager.setArbitrationFrozenPeriod(newPeriod);

// 3. 验证更新
const updatedPeriod = await configManager.getArbitrationFrozenPeriod();
console.log("Frozen period updated:", updatedPeriod / (24 * 60 * 60), "days");
```

### 示例 3: 更新最小质押金额
```javascript
// 1. 获取当前最小质押金额
const currentMinStake = await configManager.getMinStakeAmount();

// 2. 设置新的最小质押金额
const newMinStake = ethers.utils.parseEther("5"); // 5 ETH
await configManager.setMinStakeAmount(newMinStake);

// 3. 验证更新
const updatedMinStake = await configManager.getMinStakeAmount();
console.log("Min stake updated:", ethers.utils.formatEther(updatedMinStake));
```

### 示例 4: 管理仲裁超时时间
```javascript
// 1. 获取当前超时时间
const currentTimeout = await configManager.getArbitrationTimeout();

// 2. 设置新的超时时间（24小时）
const newTimeout = 24 * 60 * 60; // 24 hours in seconds
await configManager.setArbitrationTimeout(newTimeout);

// 3. 验证更新
const updatedTimeout = await configManager.getArbitrationTimeout();
console.log("Timeout updated:", updatedTimeout / (60 * 60), "hours");
```
