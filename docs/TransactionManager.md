# 交易管理器 (TransactionManager)

## 概述
TransactionManager 是仲裁协议中负责管理跨链交易生命周期的核心组件。它负责交易的注册、仲裁请求处理、签名提交等关键功能，并与补偿系统紧密集成以处理异常情况。

## 功能特性
- 交易注册与生命周期管理
- 仲裁请求处理
- 比特币交易签名管理
- 补偿机制集成
- 交易状态跟踪

## 交易生命周期

### 1. 交易注册
DApp 通过注册交易来启动跨链交易流程：
```solidity
function registerTransaction(
    bytes32 txId,
    address arbitrator,
    uint256 deadline,
    address compensationReceiver
) external payable;
```

参数说明：
- txId: 交易唯一标识（hash）
- arbitrator: 选定的仲裁人地址
- deadline: 交易截止时间
- compensationReceiver: 仲裁人签署错误签名时的补偿接收地址

### 2. 仲裁请求
当需要仲裁人签名时，可以提交仲裁请求：
```solidity
function requestArbitration(
    bytes32 txId,
    bytes calldata btcTx,
    address timeoutCompensationReceiver
) external;
```

参数说明：
- txId: 交易ID
- btcTx: 待签名的比特币交易内容
- timeoutCompensationReceiver: 仲裁人超时未签名时的补偿接收地址

### 3. 提交签名
仲裁人对比特币交易进行签名并提交：
```solidity
function submitArbitration(
    bytes32 txId,
    bytes calldata signature
) external;
```

参数说明：
- txId: 交易ID
- signature: 比特币交易签名

### 4. 查询交易
可以通过交易ID或比特币交易内容查询交易信息：
```solidity
function getTransaction(bytes32 txId) external view returns (Transaction memory);
function getTransaction(bytes calldata btcTx) external view returns (Transaction memory);
```

### 5. 完成交易
交易完成后调用：
```solidity
function completeTransaction(bytes32 txId) external;
```

## 补偿机制

### 1. 非法签名补偿
当发现仲裁人提交了非法签名时：
```solidity
function claimIllegalSignatureCompensation(
    address arbitrator,
    bytes calldata btcTx,
    bytes32 calldata evidence
) external returns (bytes32 claimId);
```

### 2. 超时补偿
当仲裁人未在截止时间前提交签名：
```solidity
function claimTimeoutCompensation(
    bytes32 txId
) external returns (bytes32 claimId);
```

### 3. 错误仲裁补偿
当仲裁结果出现错误时：
```solidity
function claimFailedArbitrationCompensation(
    bytes32 txId,
    bytes32 calldata evidence
) external returns (bytes32 claimId);
```

## 作恶处理机制

### 作恶类型

1. **恶意转移资产**
   - 现象：仲裁人与某一方勾结，直接签名将锁定的 BTC 转走
   - 受害者：注册交易时指定的 compensationReceiver
   - 处理：受害者可申请获得质押资产补偿

2. **仲裁不作为/错误仲裁**
   - 现象：
     * 未及时签名仲裁交易
     * 签署了错误的仲裁交易
     * 签署了虚假的仲裁交易
   - 受害者：请求仲裁时指定的 timeoutCompensationReceiver
   - 处理：受害者可申请获得质押资产补偿

### 补偿优先级

在某些情况下，两种作恶类型可能同时发生，例如：
- 仲裁人签署了一个错误的仲裁交易
- 该交易既无法帮助任何一方，又构成了对资产的非法处置

处理原则：
1. 请求仲裁在先，timeoutCompensationReceiver 具有优先获得补偿的权利
2. 只有在 timeoutCompensationReceiver 放弃或未在规定时间内申请补偿的情况下，compensationReceiver 才能申请补偿

## 工作流程

### 1. 正常流程
1. DApp注册交易
   - 提供交易ID和仲裁人信息
   - 支付必要的费用
   - 设置补偿接收地址

2. 请求仲裁
   - 提供待签名的比特币交易
   - 设置超时补偿接收地址

3. 仲裁人签名流程
   - 验证交易内容
   - 生成签名
   - 提交签名

4. 完成交易
   - 更新状态
   - 释放资金

### 2. 异常处理流程
1. 仲裁人超时
   - 通过补偿管理器申请超时补偿
   - 补偿发送到指定的接收地址

2. 非法签名
   - 通过补偿管理器申请非法签名补偿
   - 提供比特币交易和证据
   - 补偿发送到注册时指定的接收地址

3. 错误仲裁
   - 通过补偿管理器申请错误仲裁补偿
   - 提供证据
   - 补偿发送到指定地址

## 事件系统
```solidity
event TransactionRegistered(address indexed dapp, bytes32 indexed txId);
event TransactionCompleted(address indexed dapp, bytes32 indexed txId);
event ArbitrationRequested(address indexed dapp, bytes32 indexed txId);
event ArbitrationSubmitted(address indexed dapp, bytes32 indexed txId);
```

## 使用示例

### 示例 1: DApp 注册交易
```javascript
// 1. 准备交易信息
const txId = ethers.utils.keccak256(btcTxHash);
const arbitrator = "0x..."; // 选定的仲裁人地址
const deadline = Math.floor(Date.now() / 1000) + 24 * 3600; // 24小时后
const compensationReceiver = userWalletAddress;

// 2. 注册交易
await transactionManager.registerTransaction(
    txId,
    arbitrator,
    deadline,
    compensationReceiver,
    { value: requiredFee }
);
```

### 示例 2: 请求仲裁签名
```javascript
// 1. 准备比特币交易
const btcTx = "0x..."; // 序列化的比特币交易
const timeoutCompensationReceiver = userWalletAddress;

// 2. 请求仲裁
await transactionManager.requestArbitration(
    txId,
    btcTx,
    timeoutCompensationReceiver
);
```

### 示例 3: 仲裁人提交签名
```javascript
// 1. 签名比特币交易
const signature = await bitcoinWallet.sign(btcTx);

// 2. 提交签名
await transactionManager.submitArbitration(
    txId,
    signature
);
```

### 示例 4: 申请补偿
```javascript
// 1. 申请非法签名补偿
const evidence = "0x..."; // 证据哈希
await compensationManager.claimIllegalSignatureCompensation(
    arbitrator,
    btcTx,
    evidence
);

// 2. 申请错误仲裁补偿
await compensationManager.claimFailedArbitrationCompensation(
    txId,
    evidence
);
```

## 错误处理
合约会在以下情况抛出错误：
- 交易已存在（TransactionExists）
- 交易不存在（TransactionNotFound）
- 仲裁人未授权（UnauthorizedArbitrator）
- 费用不足（InsufficientFee）
- 交易已过期（TransactionExpired）
- 状态错误（InvalidStatus）

## 安全考虑
1. 交易ID使用密码学安全的哈希
2. 多层补偿机制保护用户权益
3. 截止时间机制防止交易无限期挂起
4. 费用机制防止垃圾交易
5. 状态检查防止重复操作

## 与其他组件的交互
1. DAppRegistry：验证DApp注册状态
2. ArbitratorManager：验证仲裁人状态和权限
3. CompensationManager：处理补偿申请
4. ConfigManager：获取系统配置参数

## 最佳实践
1. 设置合理的截止时间
2. 正确配置补偿接收地址
3. 在请求仲裁前验证比特币交易的正确性
4. 及时处理超时和错误情况
5. 保持交易状态的及时更新
6. 在申请补偿时提供充分的证据
