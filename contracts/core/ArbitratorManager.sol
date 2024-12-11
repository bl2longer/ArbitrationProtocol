// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "../interfaces/IArbitratorManager.sol";
import "./ConfigManager.sol";
import "../libraries/DataTypes.sol";
import "../libraries/Errors.sol";

/**
 * @title ArbitratorManager
 * @notice Contract for managing arbitrators in the BeLayer2 arbitration protocol
 * @dev This contract handles arbitrator registration, staking, and lifecycle management
 *
 * Key features:
 * - Arbitrator staking and unstaking
 * - Operator and revenue address management
 * - Fee rate and term duration configuration
 * - Arbitrator status control (pause/unpause)
 *
 * Security considerations:
 * - All stake withdrawals require arbitrator to be in non-working state
 * - Minimum stake and fee rate requirements from ConfigManager
 * - Status changes are protected against invalid state transitions
 */
contract ArbitratorManager is IArbitratorManager, ReentrancyGuard, Ownable {
    // Constants
    address public constant zeroAddress = address(0);

    // Config manager reference for system parameters
    ConfigManager private immutable configManager;
    
    // Mapping of arbitrator addresses to their information
    mapping(address => DataTypes.ArbitratorInfo) private arbitrators;
    
    // State variables
    address public transactionManager;
    bool private initialized;
    
    /**
     * @notice Ensures arbitrator is not currently handling any transactions
     * @dev Prevents critical state changes while arbitrator is working
     */
    modifier notWorking() {
        DataTypes.ArbitratorInfo storage arbitrator = arbitrators[msg.sender];
        require(arbitrator.activeTransactionId == bytes32(0), "ArbitratorWorking");
        _;
    }

    modifier onlyTransactionManager() {
        if (msg.sender != transactionManager) 
            revert Errors.NOT_TRANSACTION_MANAGER();
        if (!initialized)
            revert Errors.NOT_INITIALIZED();
        _;
    }

    /**
     * @notice Initializes the contract with config manager
     * @param _configManager Address of the ConfigManager contract
     * @param initialOwner Initial owner of the contract
     * @dev Config manager provides system-wide parameters like minimum stake
     */
    constructor(address _configManager, address initialOwner) Ownable(initialOwner) {
        if (_configManager == address(0)) 
            revert Errors.ZERO_ADDRESS();
        configManager = ConfigManager(_configManager);
    }

    /**
     * @notice Initialize the contract with transaction manager address
     * @param _transactionManager Address of the TransactionManager contract
     */
    function initialize(address _transactionManager) external onlyOwner {
        if (initialized) revert Errors.ALREADY_INITIALIZED();
        if (_transactionManager == address(0)) revert Errors.ZERO_ADDRESS();
        
        transactionManager = _transactionManager;
        initialized = true;
        
        emit Initialized(_transactionManager);
    }

    /**
     * @notice Allows arbitrators to stake ETH
     * @dev First-time stakers must meet minimum stake requirement
     * Additional stakes can be any amount
     */
    function stakeETH() external payable override {
        DataTypes.ArbitratorInfo storage arbitrator = arbitrators[msg.sender];
        
        // First-time stake must meet minimum requirement
        if (arbitrator.ethAmount == 0) {
            if (msg.value < configManager.getConfig(configManager.MIN_STAKE())) {
                revert Errors.INSUFFICIENT_STAKE();
            }
        }

        // Check if total stake would exceed maximum
        uint256 newTotalStake = arbitrator.ethAmount + msg.value;
        if (newTotalStake > configManager.getConfig(configManager.MAX_STAKE())) {
            revert Errors.STAKE_EXCEEDS_MAX();
        }
        
        arbitrator.ethAmount = newTotalStake;
        emit StakeAdded(msg.sender, zeroAddress, msg.value);
    }

    /**
     * @notice Allows arbitrators to withdraw their entire stake
     * @dev Can only be called when not handling any transactions
     * Withdraws entire stake amount at once
     */
    function unstake() external override notWorking {
        DataTypes.ArbitratorInfo storage arbitrator = arbitrators[msg.sender];
        require(arbitrator.ethAmount > 0, "NoStake");
        
        uint256 amount = arbitrator.ethAmount;
        arbitrator.ethAmount = 0;
        
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "TransferFailed");
        
        emit StakeWithdrawn(msg.sender, zeroAddress, amount);
    }

    /**
     * @notice Sets or updates arbitrator's operator details
     * @param operator Address of the operator
     * @param btcPubKey Bitcoin public key of the operator
     * @param btcAddress Bitcoin address of the operator
     * @dev Operator address cannot be zero address
     */
    function setOperator(
        address operator,
        bytes calldata btcPubKey,
        string calldata btcAddress
    ) external override {
        require(operator != address(0), "InvalidOperator");
        
        DataTypes.ArbitratorInfo storage arbitrator = arbitrators[msg.sender];
        arbitrator.operator = operator;
        arbitrator.operatorBtcPubKey = btcPubKey;
        arbitrator.operatorBtcAddress = btcAddress;
        
        emit OperatorSet(msg.sender, operator, btcPubKey, btcAddress);
    }

    /**
     * @notice Sets or updates arbitrator's revenue addresses
     * @param ethAddress Ethereum address for receiving revenue
     * @param btcPubKey Bitcoin public key for receiving revenue
     * @param btcAddress Bitcoin address for receiving revenue
     * @dev Ethereum address cannot be zero address
     */
    function setRevenueAddresses(
        address ethAddress,
        bytes calldata btcPubKey,
        string calldata btcAddress
    ) external override {
        require(ethAddress != address(0), "InvalidEthAddress");
        
        DataTypes.ArbitratorInfo storage arbitrator = arbitrators[msg.sender];
        arbitrator.arbitrator = ethAddress;
        arbitrator.operatorBtcPubKey = btcPubKey;
        arbitrator.operatorBtcAddress = btcAddress;
        
        emit RevenueAddressesSet(msg.sender, ethAddress, btcPubKey, btcAddress);
    }

    /**
     * @notice Sets arbitrator's fee rate and term deadline
     * @param feeRate Fee rate in basis points (1% = 100)
     * @param deadline Unix timestamp for term end (0 for no end)
     * @dev Fee rate must be >= minimum rate from ConfigManager
     * Deadline must be in future if not zero
     */
    function setArbitratorParams(
        uint256 feeRate,
        uint256 deadline
    ) external override notWorking {
        require(feeRate >= configManager.getConfig(configManager.TRANSACTION_MIN_FEE_RATE()), "FeeTooLow");
        require(deadline == 0 || deadline > block.timestamp, "InvalidDeadline");
        
        DataTypes.ArbitratorInfo storage arbitrator = arbitrators[msg.sender];
        arbitrator.currentFeeRate = feeRate;
        arbitrator.lastArbitrationTime = deadline;
        
        emit ArbitratorParamsSet(msg.sender, feeRate, deadline);
    }

    /**
     * @notice Pauses arbitrator services
     * @dev Can only be called when active and not working
     */
    function pause() external override notWorking {
        DataTypes.ArbitratorInfo storage arbitrator = arbitrators[msg.sender];
        require(arbitrator.status == DataTypes.ArbitratorStatus.Active, "Not active");
        arbitrator.status = DataTypes.ArbitratorStatus.Paused;
        
        emit ArbitratorPaused(msg.sender);
    }

    /**
     * @notice Resumes arbitrator services
     * @dev Can only be called when paused and not working
     */
    function unpause() external override notWorking {
        DataTypes.ArbitratorInfo storage arbitrator = arbitrators[msg.sender];
        require(arbitrator.status == DataTypes.ArbitratorStatus.Paused, "not paused");
        arbitrator.status = DataTypes.ArbitratorStatus.Active;
        
        emit ArbitratorUnpaused(msg.sender);
    }

    /**
     * @notice Retrieves arbitrator information
     * @param arbitratorAddress Address of the arbitrator
     * @return ArbitratorInfo struct containing all arbitrator details
     */
    function getArbitratorInfo(address arbitratorAddress) 
        external 
        view 
        override 
        returns (DataTypes.ArbitratorInfo memory) 
    {
        return arbitrators[arbitratorAddress];
    }

    /**
     * @notice Checks if an arbitrator is active and properly staked
     * @param arbitratorAddress Address of the arbitrator to check
     * @return bool True if arbitrator is active and meets minimum stake
     */
    function isActiveArbitrator(address arbitratorAddress) 
        external 
        view 
        override 
        returns (bool) 
    {
        DataTypes.ArbitratorInfo storage arbitrator = arbitrators[arbitratorAddress];
        return arbitrator.status == DataTypes.ArbitratorStatus.Active &&
            arbitrator.ethAmount >= configManager.getConfig(configManager.MIN_STAKE());
    }

    /**
     * @notice Retrieves available stake for an arbitrator
     * @param arbitrator Address of the arbitrator
     * @return uint256 Available stake amount
     */
    function getAvailableStake(address arbitrator) external view returns (uint256) {
        return arbitrators[arbitrator].ethAmount;
    }

    /**
     * @notice Checks if an address is an operator of an arbitrator
     * @param arbitrator Address of the arbitrator
     * @param operator Address to check
     * @return bool True if operator is associated with arbitrator
     */
    function isOperatorOf(address arbitrator, address operator) external view returns (bool) {
        return arbitrators[arbitrator].operator == operator;
    }

    /**
     * @notice Checks if an arbitrator can unstake
     * @param arbitrator Address of the arbitrator
     * @return bool True if arbitrator is not working
     */
    function canUnstake(address arbitrator) external view returns (bool) {
        return arbitrators[arbitrator].activeTransactionId == bytes32(0);
    }

    /**
     * @notice Checks if an arbitrator is paused
     * @param arbitrator Address of the arbitrator
     * @return bool True if arbitrator is paused
     */
    function isPaused(address arbitrator) external view returns (bool) {
        return arbitrators[arbitrator].status == DataTypes.ArbitratorStatus.Paused;
    }

    /**
     * @notice Set arbitrator to working status with specific transaction
     * @param arbitrator The address of the arbitrator
     * @param transactionId The ID of the transaction
     */
    function setArbitratorWorking(
        address arbitrator, 
        bytes32 transactionId
    ) external onlyTransactionManager {
        DataTypes.ArbitratorInfo storage arbitratorInfo = arbitrators[arbitrator];
        
        // Validate arbitrator state
        if (arbitratorInfo.status != DataTypes.ArbitratorStatus.Active)
            revert Errors.ARBITRATOR_NOT_ACTIVE();
        if (arbitratorInfo.activeTransactionId != bytes32(0))
            revert Errors.ARBITRATOR_ALREADY_WORKING();
            
        // Update arbitrator state
        arbitratorInfo.status = DataTypes.ArbitratorStatus.Working;
        arbitratorInfo.activeTransactionId = transactionId;
        
        emit ArbitratorStatusChanged(arbitrator, DataTypes.ArbitratorStatus.Working);
    }

    /**
     * @notice Release arbitrator from working status
     * @param arbitrator The address of the arbitrator
     * @param transactionId The ID of the transaction
     */
    function releaseArbitrator(
        address arbitrator, 
        bytes32 transactionId
    ) external onlyTransactionManager {
        DataTypes.ArbitratorInfo storage arbitratorInfo = arbitrators[arbitrator];
        
        // Validate arbitrator state
        if (arbitratorInfo.status != DataTypes.ArbitratorStatus.Working)
            revert Errors.ARBITRATOR_NOT_WORKING();
        if (arbitratorInfo.activeTransactionId != transactionId)
            revert Errors.INVALID_TRANSACTION_ID();
            
        // Update arbitrator state
        arbitratorInfo.status = DataTypes.ArbitratorStatus.Active;
        arbitratorInfo.activeTransactionId = bytes32(0);
        
        emit ArbitratorStatusChanged(arbitrator, DataTypes.ArbitratorStatus.Active);
    }
}
