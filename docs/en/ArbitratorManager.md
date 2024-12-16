# ArbitratorManager

## Overview
The ArbitratorManager is responsible for managing arbitrator registration, staking, status changes, and other operations. Arbitrators must stake a certain amount of tokens to participate in arbitration work, and there is a freeze period after completing arbitration.

## Features
- Arbitrator registration and management
- Staking token management (ETH, ERC20, NFT)
- Arbitrator status management
- Operator authorization management
- Arbitration freeze period management

## Arbitrator Lifecycle

### 1. Registration and Staking
Arbitrators register by staking assets. The following staking methods are supported:
- ETH staking
- ERC20 token staking
- NFT staking

```solidity
function stakeETH() external payable;
function stakeERC20(address token, uint256 amount) external;
function stakeNFT(address nftContract, uint256[] calldata tokenIds) external;
```

### 2. Configuration Settings
After registration, arbitrators need to complete the following configurations to start service:

#### 2.1 Operator Settings
Set the operator responsible for signing and their Bitcoin information:
```solidity
function setOperator(
    address operator,
    bytes calldata btcPubKey,
    string calldata btcAddress
) external;
```

#### 2.2 Revenue Address Settings
Configure the address to receive revenue:
```solidity
function setRevenueAddresses(
    address ethAddress,
    bytes calldata btcPubKey,
    string calldata btcAddress
) external;
```

#### 2.3 Arbitration Parameter Settings
- After completing an arbitration, the arbitrator enters a 7-day freeze period.
- During the freeze period, the arbitrator cannot participate in new arbitration work.
- The arbitrator must wait for the last arbitration's freeze period to end before unstaking:

Set service parameters:
```solidity
function setArbitratorParams(
    uint256 feeRate,
    uint256 termDuration
) external;
```

### 3. Runtime Management

#### 3.1 Status Management
Arbitrators can pause and resume services:
```solidity
function pause() external;    // Pause accepting new transactions
function unpause() external;  // Resume accepting new transactions
```

#### 3.2 Unstaking
Stakes can be retrieved when there are no ongoing transactions:
```solidity
function unstake() external;  // Retrieve all staked assets
```

### 4. Query Functions
Provide multiple query interfaces:
```solidity
struct ArbitratorInfo {
    address operator;          // Operator address
    uint256 stakedAmount;      // Staked amount
    uint256 stakeLockedTime;   // Stake locked time
    uint256 lastArbitrationTime; // Last arbitration time
    bool isActive;             // Is active
    bytes operatorBtcPubKey;   // Bitcoin public key
    string operatorBtcAddress; // Bitcoin address
}

function getArbitratorStatus(address arbitrator) external view returns (ArbitratorInfo memory);
function isOperatorOf(address arbitrator, address operator) external view returns (bool);
function canUnstake(address arbitrator) external view returns (bool);
function isPaused(address arbitrator) external view returns (bool);
function getAvailableStake(address arbitrator) external view returns (uint256);
```

## Workflow

### 1. Becoming an Arbitrator
1. Stake assets (ETH/ERC20/NFT)
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

## Event System

### Staking Related Events
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

### Configuration Update Events
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

### Status Change Events
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
await arbitratorManager.setArbitratorParams(
    100,                             // 1% fee rate
    30 * 24 * 3600                  // 30-day term
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
```

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