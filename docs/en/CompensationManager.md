# Compensation Manager

## Overview
CompensationManager is a core component in the arbitration protocol responsible for handling and distributing various types of compensation claims. It provides three different compensation mechanisms to address potential anomalies during the arbitration process.

## Features
- Illegal Signature Compensation Management
- Timeout Compensation Management
- Failed Arbitration Compensation Management
- Compensation Calculation and Distribution
- Compensation Claim Status Tracking

## Compensation Types

### 1. Illegal Signature Compensation
When an arbitrator submits an illegal or incorrect signature:
```solidity
function claimIllegalSignatureCompensation(
    address arbitrator,
    bytes calldata btcTx,
    bytes32 calldata evidence
) external returns (bytes32 claimId);
```

Parameter Explanation:
- arbitrator: Address of the arbitrator who submitted the illegal signature
- btcTx: Related Bitcoin transaction content
- evidence: Evidence proving the signature is illegal
- Return Value: Unique identifier for the compensation claim

### 2. Timeout Compensation
When an arbitrator fails to complete arbitration within the specified time:
```solidity
function claimTimeoutCompensation(
    bytes32 txId
) external returns (bytes32 claimId);
```

Parameter Explanation:
- txId: ID of the timed-out transaction
- Return Value: Unique identifier for the compensation claim

### 3. Failed Arbitration Compensation
When an arbitration result is erroneous or disputed:
```solidity
function claimFailedArbitrationCompensation(
    bytes32 txId,
    bytes32 calldata evidence
) external returns (bytes32 claimId);
```

Parameter Explanation:
- txId: ID of the transaction with an error
- evidence: Evidence proving the arbitration error
- Return Value: Unique identifier for the compensation claim

## Compensation Management

### 1. Compensation Withdrawal
Users can withdraw approved compensation:
```solidity
function withdrawCompensation(bytes32 claimId) external;
```

### 2. Compensation Query
Query the amount of compensation that can be claimed:
```solidity
function getClaimableAmount(bytes32 claimId) external view returns (uint256);
```

## Workflow

### 1. Illegal Signature Compensation Process
1. Detect illegal signature submission by the arbitrator
2. Prepare evidence (e.g., proof of signature verification failure)
3. Submit a compensation claim with the arbitrator's address, transaction content, and evidence
4. Wait for claim review
5. Withdraw compensation after approval

### 2. Timeout Compensation Process
1. Transaction exceeds the deadline
2. Submit a timeout compensation claim with the transaction ID
3. System automatically verifies timeout status
4. Withdraw compensation after verification

### 3. Failed Arbitration Compensation Process
1. Detect an error in the arbitration result
2. Collect evidence of the error
3. Submit a failed arbitration compensation claim
4. Wait for claim review
5. Withdraw compensation after approval

## Event System
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

## Error Handling
The contract throws errors in the following cases:
- Invalid Transaction ID (InvalidTransactionId)
- Duplicate Claim (DuplicateClaim)
- Invalid Evidence (InvalidEvidence)
- Zero Compensation (ZeroCompensation)
- Unauthorized Withdrawal (UnauthorizedWithdrawal)
- Compensation Already Withdrawn (CompensationAlreadyWithdrawn)

## Security Considerations
1. Evidence verification mechanism to prevent false claims
2. Compensation amount cap control
3. Duplicate claim check
4. Authorization verification for secure withdrawal
5. Status tracking to prevent duplicate withdrawals

## Interaction with Other Components
1. TransactionManager: Retrieve transaction information and status
2. ArbitratorManager: Verify arbitrator information
3. ConfigManager: Retrieve compensation-related configurations
4. DAppRegistry: Verify DApp status

## Best Practices
1. Submit compensation claims promptly
2. Provide sufficient evidence support
3. Save compensation claim ID
4. Regularly check compensation status
5. Verify the correctness of the compensation amount

## Usage Examples

### Example 1: Apply for Illegal Signature Compensation
```javascript
// 1. Prepare evidence
const btcTx = "0x..."; // Bitcoin transaction content
const evidence = ethers.utils.keccak256(
    ethers.utils.defaultAbiCoder.encode(
        ["bytes", "bytes"],
        [btcTx, invalidSignature]
    )
);

// 2. Submit compensation claim
const claimId = await compensationManager.claimIllegalSignatureCompensation(
    arbitratorAddress,
    btcTx,
    evidence
);

// 3. Query compensation amount
const amount = await compensationManager.getClaimableAmount(claimId);

// 4. Withdraw compensation
if (amount > 0) {
    await compensationManager.withdrawCompensation(claimId);
}
```

### Example 2: Apply for Timeout Compensation
```javascript
// 1. Submit timeout compensation claim
const claimId = await compensationManager.claimTimeoutCompensation(txId);

// 2. Query compensation amount
const amount = await compensationManager.getClaimableAmount(claimId);

// 3. Withdraw compensation
if (amount > 0) {
    await compensationManager.withdrawCompensation(claimId);
}
```

### Example 3: Apply for Failed Arbitration Compensation
```javascript
// 1. Prepare evidence
const evidence = ethers.utils.keccak256(
    ethers.utils.defaultAbiCoder.encode(
        ["bytes32", "string"],
        [txId, "Arbitration result conflicts with on-chain state"]
    )
);

// 2. Submit compensation claim
const claimId = await compensationManager.claimFailedArbitrationCompensation(
    txId,
    evidence
);

// 3. Query and withdraw compensation
const amount = await compensationManager.getClaimableAmount(claimId);
if (amount > 0) {
    await compensationManager.withdrawCompensation(claimId);
}
```