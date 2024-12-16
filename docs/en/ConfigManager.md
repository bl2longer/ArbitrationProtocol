# ConfigManager

## Overview
ConfigManager is the configuration management center of the arbitration protocol, responsible for managing and maintaining various parameter configurations within the protocol. It provides a centralized configuration management interface to ensure that all components of the protocol can correctly access and update configuration information.

## Features
- Arbitration fee management
- Arbitration frozen period management
- System parameter configuration
- Configuration updates and queries

## Core Functions

### 1. Arbitration Fee Management
Set and query arbitration fees:
```solidity
function setArbitrationFee(uint256 fee) external;
function getArbitrationFee() external view returns (uint256);
```

Parameter Description:
- fee: The amount of the arbitration fee (in wei)
- Return Value: The currently set arbitration fee

### 2. Arbitration Frozen Period Management
Set and query arbitration frozen periods:
```solidity
function setArbitrationFrozenPeriod(uint256 period) external;
function getArbitrationFrozenPeriod() external view returns (uint256);
```

Parameter Description:
- period: Duration of the arbitration frozen period (in seconds)
- Return Value: The currently set frozen period duration

### 3. Minimum Stake Amount Management
Set and query minimum stake amounts:
```solidity
function setMinStakeAmount(uint256 amount) external;
function getMinStakeAmount() external view returns (uint256);
```

Parameter Description:
- amount: Minimum stake amount (in wei)
- Return Value: The currently set minimum stake amount

### 4. Arbitration Timeout Management
Set and query arbitration timeouts:
```solidity
function setArbitrationTimeout(uint256 timeout) external;
function getArbitrationTimeout() external view returns (uint256);
```

Parameter Description:
- timeout: Arbitration timeout period (in seconds)
- Return Value: The currently set timeout period

## Event System
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

## Error Handling
The contract will throw errors in the following situations:
- Invalid fee amount (InvalidFeeAmount)
- Invalid period (InvalidPeriod)
- Invalid stake amount (InvalidStakeAmount)
- Invalid timeout (InvalidTimeout)
- Unauthorized operation (Unauthorized)

## Security Considerations
1. Parameter range validation
2. Access control
3. State consistency
4. Atomicity of update operations
5. Audit logs for configuration changes

## Interaction with Other Components
1. ArbitratorManager: Provides arbitrator-related configurations
2. TransactionManager: Provides transaction-related configurations
3. CompensationManager: Provides compensation-related configurations
4. DAppRegistry: Provides DApp-related configurations

## Best Practices
1. Regularly check configuration parameters
2. Adjust timeout periods according to network conditions
3. Set reasonable stake amounts
4. Record configuration change history
5. Regularly verify configuration validity

## Usage Examples

### Example 1: Update Arbitration Fee
```javascript
// 1. Get the current fee
const currentFee = await configManager.getArbitrationFee();

// 2. Set a new fee
const newFee = ethers.utils.parseEther("0.1"); // 0.1 ETH
await configManager.setArbitrationFee(newFee);

// 3. Verify the update
const updatedFee = await configManager.getArbitrationFee();
console.log("Fee updated:", ethers.utils.formatEther(updatedFee));
```

### Example 2: Configure Arbitration Frozen Period
```javascript
// 1. Get the current frozen period
const currentPeriod = await configManager.getArbitrationFrozenPeriod();

// 2. Set a new frozen period (7 days)
const newPeriod = 7 * 24 * 60 * 60; // 7 days in seconds
await configManager.setArbitrationFrozenPeriod(newPeriod);

// 3. Verify the update
const updatedPeriod = await configManager.getArbitrationFrozenPeriod();
console.log("Frozen period updated:", updatedPeriod / (24 * 60 * 60), "days");
```

### Example 3: Update Minimum Stake Amount
```javascript
// 1. Get the current minimum stake amount
const currentMinStake = await configManager.getMinStakeAmount();

// 2. Set a new minimum stake amount
const newMinStake = ethers.utils.parseEther("5"); // 5 ETH
await configManager.setMinStakeAmount(newMinStake);

// 3. Verify the update
const updatedMinStake = await configManager.getMinStakeAmount();
console.log("Min stake updated:", ethers.utils.formatEther(updatedMinStake));
```

### Example 4: Manage Arbitration Timeout
```javascript
// 1. Get the current timeout
const currentTimeout = await configManager.getArbitrationTimeout();

// 2. Set a new timeout (24 hours)
const newTimeout = 24 * 60 * 60; // 24 hours in seconds
await configManager.setArbitrationTimeout(newTimeout);

// 3. Verify the update
const updatedTimeout = await configManager.getArbitrationTimeout();
console.log("Timeout updated:", updatedTimeout / (60 * 60), "hours");
```