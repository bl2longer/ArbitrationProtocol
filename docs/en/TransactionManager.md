# Transaction Manager

## Overview
The TransactionManager is a core component in the arbitration protocol responsible for managing the lifecycle of cross-chain transactions. It handles transaction registration, arbitration request processing, signature submission, and integrates closely with the compensation system to handle exceptions.

## Features
- Transaction registration and lifecycle management
- Arbitration request processing
- Bitcoin transaction signature management
- Compensation mechanism integration
- Transaction status tracking

## Transaction Lifecycle

### 1. Transaction Registration
DApps initiate the cross-chain transaction process by registering a transaction:
```solidity
function registerTransaction(
    bytes32 txId,
    address arbitrator,
    uint256 deadline,
    address compensationReceiver
) external payable;
```

Parameter explanation:
- txId: Unique transaction identifier (hash)
- arbitrator: Selected arbitrator address
- deadline: Transaction deadline
- compensationReceiver: Address to receive compensation if the arbitrator submits an incorrect signature

### 2. Arbitration Request
Submit an arbitration request when an arbitrator's signature is needed:
```solidity
function requestArbitration(
    bytes32 txId,
    bytes calldata btcTx,
    address timeoutCompensationReceiver
) external;
```

Parameter explanation:
- txId: Transaction ID
- btcTx: Bitcoin transaction content to be signed
- timeoutCompensationReceiver: Address to receive compensation if the arbitrator fails to sign on time

### 3. Submit Signature
The arbitrator signs the Bitcoin transaction and submits it:
```solidity
function submitArbitration(
    bytes32 txId,
    bytes calldata signature
) external;
```

Parameter explanation:
- txId: Transaction ID
- signature: Bitcoin transaction signature

### 4. Query Transaction
Query transaction information by transaction ID or Bitcoin transaction content:
```solidity
function getTransaction(bytes32 txId) external view returns (Transaction memory);
function getTransaction(bytes calldata btcTx) external view returns (Transaction memory);
```

### 5. Complete Transaction
Called when the transaction is completed:
```solidity
function completeTransaction(bytes32 txId) external;
```

## Compensation Mechanism

### 1. Illegal Signature Compensation
When an arbitrator submits an illegal signature:
```solidity
function claimIllegalSignatureCompensation(
    address arbitrator,
    bytes calldata btcTx,
    bytes32 calldata evidence
) external returns (bytes32 claimId);
```

### 2. Timeout Compensation
When the arbitrator fails to submit a signature by the deadline:
```solidity
function claimTimeoutCompensation(
    bytes32 txId
) external returns (bytes32 claimId);
```

### 3. Failed Arbitration Compensation
When there is an error in the arbitration result:
```solidity
function claimFailedArbitrationCompensation(
    bytes32 txId,
    bytes32 calldata evidence
) external returns (bytes32 claimId);
```

## Malicious Behavior Handling

### Types of Malicious Behavior

1. **Malicious Asset Transfer**
   - Phenomenon: Arbitrator colludes with a party to directly sign and transfer locked BTC
   - Victim: CompensationReceiver specified during transaction registration
   - Handling: Victim can apply for compensation from staked assets

2. **Arbitration Inaction/Error**
   - Phenomenon:
     * Failure to timely sign arbitration transaction
     * Signing incorrect arbitration transaction
     * Signing fraudulent arbitration transaction
   - Victim: TimeoutCompensationReceiver specified during arbitration request
   - Handling: Victim can apply for compensation from staked assets

### Compensation Priority

In some cases, both types of malicious behavior may occur simultaneously, such as:
- The arbitrator signs an incorrect arbitration transaction
- The transaction neither helps any party nor constitutes illegal asset disposal

Handling principles:
1. Arbitration requests take precedence; the timeoutCompensationReceiver has the priority to receive compensation
2. The compensationReceiver can only apply for compensation if the timeoutCompensationReceiver waives or fails to apply within the specified time

## Workflow

### 1. Normal Process
1. DApp registers a transaction
   - Provides transaction ID and arbitrator information
   - Pays necessary fees
   - Sets compensation receiver address

2. Request arbitration
   - Provides Bitcoin transaction to be signed
   - Sets timeout compensation receiver address

3. Arbitrator signature process
   - Verifies transaction content
   - Generates signature
   - Submits signature

4. Complete transaction
   - Updates status
   - Releases funds

### 2. Exception Handling Process
1. Arbitrator timeout
   - Apply for timeout compensation via the compensation manager
   - Compensation sent to the specified receiver address

2. Illegal signature
   - Apply for illegal signature compensation via the compensation manager
   - Provide Bitcoin transaction and evidence
   - Compensation sent to the receiver address specified during registration

3. Error in arbitration
   - Apply for failed arbitration compensation via the compensation manager
   - Provide evidence
   - Compensation sent to the specified address

## Event System
```solidity
event TransactionRegistered(address indexed dapp, bytes32 indexed txId);
event TransactionCompleted(address indexed dapp, bytes32 indexed txId);
event ArbitrationRequested(address indexed dapp, bytes32 indexed txId);
event ArbitrationSubmitted(address indexed dapp, bytes32 indexed txId);
```

## Usage Examples

### Example 1: DApp Registers a Transaction
```javascript
// 1. Prepare transaction information
const txId = ethers.utils.keccak256(btcTxHash);
const arbitrator = "0x..."; // Selected arbitrator address
const deadline = Math.floor(Date.now() / 1000) + 24 * 3600; // 24 hours later
const compensationReceiver = userWalletAddress;

// 2. Register transaction
await transactionManager.registerTransaction(
    txId,
    arbitrator,
    deadline,
    compensationReceiver,
    { value: requiredFee }
);
```

### Example 2: Request Arbitration Signature
```javascript
// 1. Prepare Bitcoin transaction
const btcTx = "0x..."; // Serialized Bitcoin transaction
const timeoutCompensationReceiver = userWalletAddress;

// 2. Request arbitration
await transactionManager.requestArbitration(
    txId,
    btcTx,
    timeoutCompensationReceiver
);
```

### Example 3: Arbitrator Submits Signature
```javascript
// 1. Sign Bitcoin transaction
const signature = await bitcoinWallet.sign(btcTx);

// 2. Submit signature
await transactionManager.submitArbitration(
    txId,
    signature
);
```

### Example 4: Apply for Compensation
```javascript
// 1. Apply for illegal signature compensation
const evidence = "0x..."; // Evidence hash
await compensationManager.claimIllegalSignatureCompensation(
    arbitrator,
    btcTx,
    evidence
);

// 2. Apply for failed arbitration compensation
await compensationManager.claimFailedArbitrationCompensation(
    txId,
    evidence
);
```

## Error Handling
The contract will throw errors in the following situations:
- Transaction already exists (TransactionExists)
- Transaction not found (TransactionNotFound)
- Unauthorized arbitrator (UnauthorizedArbitrator)
- Insufficient fee (InsufficientFee)
- Transaction expired (TransactionExpired)
- Invalid status (InvalidStatus)

## Security Considerations
1. Use cryptographically secure hashes for transaction IDs
2. Multi-layer compensation mechanisms to protect user rights
3. Deadline mechanism to prevent indefinite transaction suspension
4. Fee mechanism to prevent spam transactions
5. Status checks to prevent duplicate operations

## Interaction with Other Components
1. DAppRegistry: Verify DApp registration status
2. ArbitratorManager: Verify arbitrator status and permissions
3. CompensationManager: Handle compensation claims
4. ConfigManager: Retrieve system configuration parameters

## Best Practices
1. Set reasonable deadlines
2. Correctly configure compensation receiver addresses
3. Verify the correctness of Bitcoin transactions before requesting arbitration
4. Handle timeouts and errors promptly
5. Keep transaction status updated in a timely manner
6. Provide sufficient evidence when applying for compensation