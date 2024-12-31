# Transaction Manager

## Overview
The TransactionManager is a core component in the arbitration protocol responsible for managing the lifecycle of cross-chain transactions. It handles transaction registration, arbitration request processing, signature submission, and integrates closely with the compensation system to handle exceptions.

## Core Functions

### Transaction Registration and Management

```solidity
function registerTransaction(
    DataTypes.UTXO[] calldata utxos,
    address arbitrator,
    uint256 deadline,
    address compensationReceiver
) external payable returns (bytes32 id);
```
Registers a new transaction in the system.
- `utxos`: Array of UTXO data for the transaction
- `arbitrator`: Selected arbitrator address
- `deadline`: Transaction deadline timestamp
- `compensationReceiver`: Address to receive compensation if needed
- Returns: Unique transaction ID

```solidity
function completeTransaction(bytes32 id) external;
```
Marks a transaction as completed.

```solidity
function isAbleCompletedTransaction(bytes32 id) external view returns (bool);
```
Checks if a transaction can be completed.

### Arbitration Functions

```solidity
function requestArbitration(
    bytes32 id,
    bytes calldata btcTx,
    bytes calldata script,
    address timeoutCompensationReceiver
) external;
```
Requests arbitration for a transaction.
- `id`: Transaction ID
- `btcTx`: Bitcoin transaction data
- `script`: Transaction script data
- `timeoutCompensationReceiver`: Address to receive timeout compensation

```solidity
function submitArbitration(
    bytes32 id,
    bytes calldata btcTxSignature
) external;
```
Submits arbitration result with signature.
- `id`: Transaction ID
- `btcTxSignature`: Bitcoin transaction signature

### Query Functions

```solidity
function getTransactionById(bytes32 id) external view returns (DataTypes.Transaction memory);
function getTransaction(bytes32 txHash) external view returns (DataTypes.Transaction memory);
function txHashToId(bytes32 txHash) external view returns (bytes32);
```
Functions to query transaction information:
- Get transaction by ID or hash
- Convert transaction hash to ID

```solidity
function getRegisterTransactionFee(uint256 deadline, address arbitrator) external view returns (uint256 fee);
```
Calculates the required fee for registering a transaction.

### Fee Management

```solidity
function transferArbitrationFee(
    bytes32 id
) external returns (uint256 arbitratorFee, uint256 systemFee);
```
Transfers arbitration fees to arbitrator and system.
- Only callable by compensation manager
- Returns both arbitrator and system fee amounts

### Initialization and Configuration

```solidity
function initialize(address _arbitratorManager, address _dappRegistry, address _configManager) external;
function initCompensationManager(address _compensationManager) external;
function setArbitratorManager(address _arbitratorManager) external;
```
System initialization and configuration functions.

## Events

```solidity
event TransactionRegistered(
    bytes32 indexed id,
    address indexed dapp,
    address indexed arbitrator,
    uint256 deadline,
    uint256 depositFee
);
event TransactionCompleted(address indexed dapp, bytes32 indexed txId);
event ArbitrationRequested(address indexed dapp, bytes32 indexed txId, bytes btcTx, bytes script, address arbitrator);
event ArbitrationSubmitted(address indexed dapp, bytes32 indexed txId);
event TransactionCreated(bytes32 indexed id, address indexed sender, address indexed arbitrator);
event TransactionCancelled(bytes32 indexed id);
event CompensationManagerInitialized(address indexed compensationManager);
event SetArbitratorManager(address indexed arbitratorManager);
```
Events emitted during various transaction lifecycle stages.

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