# DApp Registry (DAppRegistry)

## Overview
DAppRegistry is the component for registering and managing DApps in the arbitration protocol. It manages all decentralized applications (DApps) that connect to the arbitration protocol, maintaining their status and configuration information.

## Features
- DApp registration and deregistration management
- DApp status query and update
- DApp configuration management
- Access control

## Core Functions

### 1. DApp Registration
Register a new DApp to the arbitration protocol:
```solidity
function registerDApp(
    address dapp,
    address owner,
    uint256 minStake,
    uint256 arbitratorCount
) external returns (bool);
```

Parameters:
- dapp: DApp contract address
- owner: DApp owner address
- minStake: Minimum staking requirement
- arbitratorCount: Required number of arbitrators
- Returns: Whether the registration was successful

### 2. DApp Deregistration
Deregister a DApp from the arbitration protocol:
```solidity
function unregisterDApp(address dapp) external returns (bool);
```

Parameters:
- dapp: Address of the DApp to deregister
- Returns: Whether the deregistration was successful

### 3. DApp Information Query
Query the registration information of a DApp:
```solidity
function getDAppInfo(address dapp) external view returns (DAppInfo memory);
```

Parameters:
- dapp: DApp address
- Returns: Detailed information of the DApp

### 4. Owner Verification
Verify if an address is the owner of a DApp:
```solidity
function isOwner(address dapp, address account) external view returns (bool);
```

Parameters:
- dapp: DApp address
- account: Account address to verify
- Returns: Whether the account is the owner

## Data Structures

### DApp Information
```solidity
struct DAppInfo {
    address owner;           // DApp owner address
    uint256 minStake;       // Minimum staking requirement
    uint256 arbitratorCount;// Required number of arbitrators
    bool isActive;          // Whether it is active
}
```

## Event System
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

## Error Handling
The contract will throw errors in the following situations:
- DApp already registered (DAppAlreadyRegistered)
- DApp not registered (DAppNotRegistered)
- Invalid owner address (InvalidOwner)
- Invalid minimum stake amount (InvalidMinStake)
- Invalid arbitrator count (InvalidArbitratorCount)
- Unauthorized operation (Unauthorized)

## Security Considerations
1. Owner permission verification
2. Parameter validity checks
3. State consistency maintenance
4. Reentrancy attack protection
5. Hierarchical permission management

## Interaction with Other Components
1. ArbitratorManager: Verify arbitrator configuration
2. ConfigManager: Get system configuration
3. TransactionManager: Validate transaction parameters
4. CompensationManager: Handle compensation-related configuration

## Best Practices
1. Verify DApp contract address before registration
2. Set a reasonable minimum stake requirement
3. Set the number of arbitrators based on business needs
4. Regularly check DApp status
5. Update expired configurations promptly

## Usage Examples

### Example 1: Register a New DApp
```javascript
// 1. Prepare registration parameters
const dappAddress = "0x...";
const ownerAddress = "0x...";
const minStake = ethers.utils.parseEther("10"); // 10 ETH
const arbitratorCount = 3;

// 2. Register DApp
const success = await dappRegistry.registerDApp(
    dappAddress,
    ownerAddress,
    minStake,
    arbitratorCount
);

// 3. Verify registration status
const dappInfo = await dappRegistry.getDAppInfo(dappAddress);
console.log("DApp is active:", dappInfo.isActive);
```

### Example 2: Query and Verify DApp
```javascript
// 1. Get DApp information
const dappInfo = await dappRegistry.getDAppInfo(dappAddress);

// 2. Verify owner
const isOwner = await dappRegistry.isOwner(dappAddress, userAddress);

// 3. Check configuration
if (dappInfo.isActive && isOwner) {
    console.log("DApp configuration:", {
        minStake: ethers.utils.formatEther(dappInfo.minStake),
        arbitratorCount: dappInfo.arbitratorCount.toString()
    });
}
```

### Example 3: Deregister DApp
```javascript
// 1. Verify owner permissions
const isOwner = await dappRegistry.isOwner(dappAddress, userAddress);

// 2. Deregister DApp
if (isOwner) {
    const success = await dappRegistry.unregisterDApp(dappAddress);
    
    // 3. Confirm deregistration status
    const dappInfo = await dappRegistry.getDAppInfo(dappAddress);
    console.log("DApp is inactive:", !dappInfo.isActive);
}
```