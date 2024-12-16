# 补偿管理器 (CompensationManager)

## 概述
CompensationManager 是仲裁协议中负责处理各类补偿申请和发放的核心组件。它提供了三种不同类型的补偿机制，用于处理仲裁过程中可能出现的各种异常情况。

## 功能特性
- 非法签名补偿管理
- 超时补偿管理
- 错误仲裁补偿管理
- 补偿金额计算和发放
- 补偿申请状态跟踪

## 补偿类型

### 1. 非法签名补偿
当仲裁人提交了非法或错误的签名时：
```solidity
function claimIllegalSignatureCompensation(
    address arbitrator,
    bytes calldata btcTx,
    bytes32 calldata evidence
) external returns (bytes32 claimId);
```

参数说明：
- arbitrator: 提交非法签名的仲裁人地址
- btcTx: 相关的比特币交易内容
- evidence: 证明签名非法的证据
- 返回值: 补偿申请的唯一标识

### 2. 超时补偿
当仲裁人未在规定时间内完成仲裁时：
```solidity
function claimTimeoutCompensation(
    bytes32 txId
) external returns (bytes32 claimId);
```

参数说明：
- txId: 超时交易的ID
- 返回值: 补偿申请的唯一标识

### 3. 错误仲裁补偿
当仲裁结果出现错误或争议时：
```solidity
function claimFailedArbitrationCompensation(
    bytes32 txId,
    bytes32 calldata evidence
) external returns (bytes32 claimId);
```

参数说明：
- txId: 出现错误的交易ID
- evidence: 证明仲裁错误的证据
- 返回值: 补偿申请的唯一标识

## 补偿管理

### 1. 补偿领取
用户可以领取已批准的补偿：
```solidity
function withdrawCompensation(bytes32 claimId) external;
```

### 2. 补偿查询
查询可领取的补偿金额：
```solidity
function getClaimableAmount(bytes32 claimId) external view returns (uint256);
```

## 工作流程

### 1. 非法签名补偿流程
1. 发现仲裁人提交了非法签名
2. 准备证据（如签名验证失败证明）
3. 提交补偿申请，提供仲裁人地址、交易内容和证据
4. 等待补偿申请审核
5. 审核通过后领取补偿

### 2. 超时补偿流程
1. 交易超过截止时间
2. 提交超时补偿申请，提供交易ID
3. 系统自动验证超时状态
4. 验证通过后领取补偿

### 3. 错误仲裁补偿流程
1. 发现仲裁结果存在错误
2. 收集错误证据
3. 提交错误仲裁补偿申请
4. 等待申请审核
5. 审核通过后领取补偿

## 事件系统
```solidity
event CompensationClaimed(
    bytes32 indexed claimId,
    address indexed claimer,
    bytes32 indexed txId,
    uint256 amount
);

event CompensationWithdrawn(
    bytes32 indexed claimId,
    address indexed recipient,
    uint256 amount
);
```

## 错误处理
合约会在以下情况抛出错误：
- 无效的交易ID（InvalidTransactionId）
- 重复的补偿申请（DuplicateClaim）
- 无效的证据（InvalidEvidence）
- 补偿金额为零（ZeroCompensation）
- 未经授权的领取（UnauthorizedWithdrawal）
- 补偿已领取（CompensationAlreadyWithdrawn）

## 安全考虑
1. 证据验证机制防止虚假申请
2. 补偿金额上限控制
3. 重复申请检查
4. 授权验证确保安全领取
5. 状态追踪防止重复领取

## 与其他组件的交互
1. TransactionManager：获取交易信息和状态
2. ArbitratorManager：验证仲裁人信息
3. ConfigManager：获取补偿相关配置
4. DAppRegistry：验证DApp状态

## 最佳实践
1. 及时提交补偿申请
2. 提供充分的证据支持
3. 保存补偿申请ID
4. 定期检查补偿状态
5. 验证补偿金额正确性

## 使用示例

### 示例 1: 申请非法签名补偿
```javascript
// 1. 准备证据
const btcTx = "0x..."; // 比特币交易内容
const evidence = ethers.utils.keccak256(
    ethers.utils.defaultAbiCoder.encode(
        ["bytes", "bytes"],
        [btcTx, invalidSignature]
    )
);

// 2. 提交补偿申请
const claimId = await compensationManager.claimIllegalSignatureCompensation(
    arbitratorAddress,
    btcTx,
    evidence
);

// 3. 查询补偿金额
const amount = await compensationManager.getClaimableAmount(claimId);

// 4. 领取补偿
if (amount > 0) {
    await compensationManager.withdrawCompensation(claimId);
}
```

### 示例 2: 申请超时补偿
```javascript
// 1. 提交超时补偿申请
const claimId = await compensationManager.claimTimeoutCompensation(txId);

// 2. 查询补偿金额
const amount = await compensationManager.getClaimableAmount(claimId);

// 3. 领取补偿
if (amount > 0) {
    await compensationManager.withdrawCompensation(claimId);
}
```

### 示例 3: 申请错误仲裁补偿
```javascript
// 1. 准备证据
const evidence = ethers.utils.keccak256(
    ethers.utils.defaultAbiCoder.encode(
        ["bytes32", "string"],
        [txId, "Arbitration result conflicts with on-chain state"]
    )
);

// 2. 提交补偿申请
const claimId = await compensationManager.claimFailedArbitrationCompensation(
    txId,
    evidence
);

// 3. 查询并领取补偿
const amount = await compensationManager.getClaimableAmount(claimId);
if (amount > 0) {
    await compensationManager.withdrawCompensation(claimId);
}
```
