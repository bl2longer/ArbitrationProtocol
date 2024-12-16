# DApp 注册表 (DAppRegistry)

## 概述
DAppRegistry 是仲裁协议中的 DApp 注册和管理组件。它负责管理所有接入仲裁协议的去中心化应用程序（DApp），维护其状态和配置信息。

## 功能特性
- DApp 注册和注销管理
- DApp 状态查询和更新
- DApp 配置管理
- 权限控制

## 核心功能

### 1. DApp 注册
注册新的 DApp 到仲裁协议：
```solidity
function registerDApp(
    address dapp,
    address owner,
    uint256 minStake,
    uint256 arbitratorCount
) external returns (bool);
```

参数说明：
- dapp: DApp 合约地址
- owner: DApp 所有者地址
- minStake: 最小质押要求
- arbitratorCount: 所需仲裁人数量
- 返回值: 注册是否成功

### 2. DApp 注销
从仲裁协议中注销 DApp：
```solidity
function unregisterDApp(address dapp) external returns (bool);
```

参数说明：
- dapp: 要注销的 DApp 地址
- 返回值: 注销是否成功

### 3. DApp 信息查询
查询 DApp 的注册信息：
```solidity
function getDAppInfo(address dapp) external view returns (DAppInfo memory);
```

参数说明：
- dapp: DApp 地址
- 返回值: DApp 的详细信息

### 4. 所有者验证
验证地址是否为 DApp 的所有者：
```solidity
function isOwner(address dapp, address account) external view returns (bool);
```

参数说明：
- dapp: DApp 地址
- account: 待验证的账户地址
- 返回值: 是否为所有者

## 数据结构

### DApp 信息
```solidity
struct DAppInfo {
    address owner;           // DApp 所有者地址
    uint256 minStake;       // 最小质押要求
    uint256 arbitratorCount;// 所需仲裁人数量
    bool isActive;          // 是否处于活跃状态
}
```

## 事件系统
```solidity
event DAppRegistered(
    address indexed dapp,
    address indexed owner,
    uint256 minStake,
    uint256 arbitratorCount
);

event DAppUnregistered(
    address indexed dapp
);

event DAppOwnerUpdated(
    address indexed dapp,
    address indexed oldOwner,
    address indexed newOwner
);
```

## 错误处理
合约会在以下情况抛出错误：
- DApp 已注册（DAppAlreadyRegistered）
- DApp 未注册（DAppNotRegistered）
- 无效的所有者地址（InvalidOwner）
- 无效的最小质押金额（InvalidMinStake）
- 无效的仲裁人数量（InvalidArbitratorCount）
- 未经授权的操作（Unauthorized）

## 安全考虑
1. 所有者权限验证
2. 参数有效性检查
3. 状态一致性维护
4. 重入攻击防护
5. 权限分级管理

## 与其他组件的交互
1. ArbitratorManager：验证仲裁人配置
2. ConfigManager：获取系统配置
3. TransactionManager：验证交易参数
4. CompensationManager：处理补偿相关配置

## 最佳实践
1. 注册前验证 DApp 合约地址
2. 设置合理的最小质押要求
3. 根据业务需求设置仲裁人数量
4. 定期检查 DApp 状态
5. 及时更新过期配置

## 使用示例

### 示例 1: 注册新 DApp
```javascript
// 1. 准备注册参数
const dappAddress = "0x...";
const ownerAddress = "0x...";
const minStake = ethers.utils.parseEther("10"); // 10 ETH
const arbitratorCount = 3;

// 2. 注册 DApp
const success = await dappRegistry.registerDApp(
    dappAddress,
    ownerAddress,
    minStake,
    arbitratorCount
);

// 3. 验证注册状态
const dappInfo = await dappRegistry.getDAppInfo(dappAddress);
console.log("DApp is active:", dappInfo.isActive);
```

### 示例 2: 查询和验证 DApp
```javascript
// 1. 获取 DApp 信息
const dappInfo = await dappRegistry.getDAppInfo(dappAddress);

// 2. 验证所有者
const isOwner = await dappRegistry.isOwner(dappAddress, userAddress);

// 3. 检查配置
if (dappInfo.isActive && isOwner) {
    console.log("DApp configuration:", {
        minStake: ethers.utils.formatEther(dappInfo.minStake),
        arbitratorCount: dappInfo.arbitratorCount.toString()
    });
}
```

### 示例 3: 注销 DApp
```javascript
// 1. 验证所有者权限
const isOwner = await dappRegistry.isOwner(dappAddress, userAddress);

// 2. 注销 DApp
if (isOwner) {
    const success = await dappRegistry.unregisterDApp(dappAddress);
    
    // 3. 确认注销状态
    const dappInfo = await dappRegistry.getDAppInfo(dappAddress);
    console.log("DApp is inactive:", !dappInfo.isActive);
}
```
