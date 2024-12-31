# ArbitratorManager

## Overview
The ArbitratorManager is responsible for managing arbitrator registration, staking, status changes, and other operations. Arbitrators must stake either ETH or NFTs to participate in arbitration work, and their status and activities are carefully managed within the protocol.

## Core Functions

### Staking Operations

```solidity
function stakeETH() external payable;
function stakeNFT(uint256[] calldata tokenIds) external;
function unstake() external;  // Withdraw all staked assets
```

### Arbitrator Registration

```solidity
function registerArbitratorByStakeETH(
    string calldata defaultBtcAddress,
    bytes calldata defaultBtcPubKey,
    uint256 feeRate,
    uint256 deadline
) external payable;
```
Register as an arbitrator using ETH stake:
- `defaultBtcAddress`: Bitcoin address for receiving earnings
- `defaultBtcPubKey`: Corresponding Bitcoin public key
- `feeRate`: Service fee rate in basis points (4 decimal places)
- `deadline`: Registration deadline timestamp (0 for no deadline)

```solidity
function registerArbitratorByStakeNFT(
    uint256[] calldata tokenIds,
    string calldata defaultBtcAddress,
    bytes calldata defaultBtcPubKey,
    uint256 feeRate,
    uint256 deadline
) external;
```
Register as an arbitrator using NFT stake:
- `tokenIds`: Array of NFT tokens to stake
- Other parameters same as ETH registration

### Configuration Management

```solidity
function setOperator(
    address operator,
    bytes calldata btcPubKey,
    string calldata btcAddress
) external;
```
Set the operator address and Bitcoin credentials.

```solidity
function setRevenueAddresses(
    address ethAddress,
    bytes calldata btcPubKey,
    string calldata btcAddress
) external;
```
Configure revenue receiving addresses.

```solidity
function setArbitratorFeeRate(uint256 feeRate) external;
```
Update the arbitrator's fee rate.

```solidity
function setArbitratorDeadline(uint256 deadline) external;
```
Set or extend arbitrator's term deadline.

### Status Management

```solidity
function pause() external;    // Pause accepting new transactions
function unpause() external;  // Resume accepting new transactions
```

```solidity
function setArbitratorWorking(address arbitrator, bytes32 transactionId) external;
```
Mark arbitrator as working on a specific transaction (only callable by transaction manager).

```solidity
function releaseArbitrator(address arbitrator, bytes32 transactionId) external;
```
Release arbitrator from working status (only callable by transaction manager).

```solidity
function terminateArbitratorWithSlash(address arbitrator) external;
```
Terminate an arbitrator and slash their stake (only callable by compensation manager).

### Query Functions

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

## Events

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
```

## Workflow

### 1. Becoming an Arbitrator
1. Stake assets (ETH/NFT)
2. Set operator information (can be self)
3. Set revenue addresses
4. Configure arbitration parameters (fee rate, etc.)

### 2. Providing Arbitration Services
1. Ensure status is active (not paused)
2. Wait for transaction matching (handled by TransactionManager)
3. Operator submits arbitration signature

### 3. Pausing Services
1. Call `pause()` to stop accepting new transactions
2. Wait for existing transactions to complete
3. If there are no ongoing transactions, retrieve stake

### 4. Exiting Services
1. Ensure no ongoing transactions
2. Call `unstake()` to retrieve all staked assets

## Error Handling
The contract will throw errors in the following situations:
- Insufficient stake amount (InsufficientStake)
- Arbitrator not active (ArbitratorNotActive)
- Operator not authorized (UnauthorizedOperator)
- Stake still locked (StakeStillLocked)
- Invalid parameters (InvalidFeeRate)

## Security Considerations
1. The stake lock mechanism ensures arbitrators cannot withdraw stakes during service.
2. Operator authorization mechanism protects signing rights.
3. Status management ensures smooth service transitions.
4. Parameter limits prevent invalid configurations.

## Best Practices
1. Fully understand protocol mechanisms before staking.
2. Set reasonable fee rates.
3. Safeguard operator private keys.
4. Regularly check arbitrator status and ongoing transactions.
5. Ensure all transactions are completed before exiting.

## Usage Examples

### Example 1: Register as an Arbitrator
```javascript
// 1. Stake ETH
await arbitratorManager.stakeETH({ value: ethers.utils.parseEther("10") });

// 2. Set operator (using self as operator)
await arbitratorManager.setOperator(
    myAddress,
    btcPubKey,
    btcAddress
);

// 3. Set revenue addresses
await arbitratorManager.setRevenueAddresses(
    myEthAddress,
    btcPubKey,
    btcAddress
);

// 4. Set arbitration parameters
await arbitratorManager.setArbitratorFeeRate(
    100,                             // 1% fee rate
);
```

### Example 2: Check Arbitrator Status
```javascript
// 1. Check if can participate in arbitration
const canUnstake = await arbitratorManager.canUnstake(arbitratorAddress);

// 2. Get detailed information
const info = await arbitratorManager.getArbitratorInfo(arbitratorAddress);
const frozenUntil = info.lastArbitrationTime + frozenPeriod;

// 3. Check available stake amount
const availableStake = await arbitratorManager.getAvailableStake(arbitratorAddress);
```

### Example 3: Pause and Resume Service
```javascript
// Pause service
await arbitratorManager.pause();

// Check if stake can be retrieved
const canUnstake = await arbitratorManager.canUnstake(myAddress);

// If stake can be retrieved, exit service
if (canUnstake) {
    await arbitratorManager.unstake();
}

// Resume service
await arbitratorManager.unpause();