// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "../interfaces/ITransactionManager.sol";
import "../interfaces/IArbitratorManager.sol";
import "../interfaces/IDAppRegistry.sol";
import "../interfaces/IConfigManager.sol";
import "../core/ConfigManager.sol";
import "../libraries/DataTypes.sol";
import "../libraries/Errors.sol";

/**
 * @title TransactionManager
 * @notice Manages transaction lifecycle in the BeLayer2 arbitration protocol
 */
contract TransactionManager is ITransactionManager, ReentrancyGuard, Ownable {
    // Constants
    uint256 private constant SECONDS_PER_YEAR = 365 days;
    uint256 private constant FEE_RATE_MULTIPLIER = 10000;

    // Contract references
    IArbitratorManager public immutable arbitratorManager;
    IDAppRegistry public immutable dappRegistry;
    ConfigManager public immutable configManager;

    // Transaction storage
    mapping(bytes32 => DataTypes.Transaction) private transactions;
    uint256 private _transactionIdCounter;

    // Events
    event TransactionRegistered(bytes32 indexed id, address indexed dapp, address indexed arbitrator);
    event TransactionCompleted(bytes32 indexed id);
    event ArbitrationRequested(bytes32 indexed id);
    event ArbitrationCompleted(bytes32 indexed id);
    event TransactionExpired(bytes32 indexed id);

    /**
     * @notice Constructor to set contract references and initial owner
     * @param _arbitratorManager Address of the arbitrator manager contract
     * @param _dappRegistry Address of the DApp registry contract
     * @param _configManager Address of the config manager contract
     * @param initialOwner Initial owner of the contract
     */
    constructor(
        address _arbitratorManager,
        address _dappRegistry,
        address _configManager,
        address initialOwner
    ) Ownable(initialOwner) {
        if (_arbitratorManager == address(0) || _dappRegistry == address(0) || 
            _configManager == address(0) || initialOwner == address(0)) {
            revert Errors.ZERO_ADDRESS();
        }

        arbitratorManager = IArbitratorManager(_arbitratorManager);
        dappRegistry = IDAppRegistry(_dappRegistry);
        configManager = ConfigManager(_configManager);
    }

    /**
     * @notice Register a new transaction
     * @param arbitrator The arbitrator address
     * @param deadline The deadline for the transaction
     * @param compensationReceiver Address to receive compensation in case of timeout
     * @return id The unique transaction ID
     */
    function registerTransaction(
        address arbitrator,
        uint256 deadline,
        address compensationReceiver
    ) external payable nonReentrant returns (uint256) {
        if (arbitrator == address(0) || compensationReceiver == address(0)) {
            revert Errors.ZERO_ADDRESS();
        }

        // Check DApp status
        if (!dappRegistry.isActiveDApp(msg.sender)) {
            revert Errors.DAPP_NOT_ACTIVE();
        }

        // Validate arbitrator and get info
        DataTypes.ArbitratorInfo memory arbitratorInfo = arbitratorManager.getArbitratorInfo(arbitrator);
        if (!arbitratorManager.isActiveArbitrator(arbitrator))
            revert Errors.ARBITRATOR_NOT_ACTIVE();

        // Validate deadline
        if (deadline <= block.timestamp) 
            revert Errors.INVALID_DEADLINE();

        uint256 duration = deadline - block.timestamp;
        if (duration < configManager.getConfig(configManager.MIN_TRANSACTION_DURATION()) ||
            duration > configManager.getConfig(configManager.MAX_TRANSACTION_DURATION())) {
            revert Errors.INVALID_DURATION();
        }

        // Calculate and validate fee
        // fee = stake * (duration / secondsPerYear) * (feeRate / feeRateMultiplier)
        uint256 fee = (arbitratorInfo.ethAmount * duration * arbitratorInfo.currentFeeRate) / (SECONDS_PER_YEAR * FEE_RATE_MULTIPLIER);
        uint256 minFeeRate = configManager.getConfig(configManager.TRANSACTION_MIN_FEE_RATE());
        if (arbitratorInfo.currentFeeRate < minFeeRate || arbitratorInfo.currentFeeRate > 10000) {
            revert Errors.INVALID_FEE_RATE();
        }
        if (fee == 0) revert Errors.INVALID_FEE();
        if (msg.value < fee) revert Errors.INSUFFICIENT_FEE();

        // Generate transaction ID
        bytes32 id = keccak256(
            abi.encodePacked(
                block.timestamp,
                msg.sender,
                arbitrator,
                _transactionIdCounter++
            )
        );

        // Set arbitrator to working status
        arbitratorManager.setArbitratorWorking(arbitrator, id);

        // Store transaction
        transactions[id] = DataTypes.Transaction({
            dapp: msg.sender,
            arbitrator: arbitrator,
            deadline: deadline,
            depositedFee: fee,
            startTime: block.timestamp,
            status: DataTypes.TransactionStatus.Active,
            btcTx: new bytes(0),
            signature: new bytes(0),
            compensationReceiver: compensationReceiver,
            timeoutCompensationReceiver: compensationReceiver
        });

        emit TransactionRegistered(id, msg.sender, arbitrator);
        return uint256(id);
    }

    /**
     * @notice Complete a transaction
     * @param id Transaction ID
     */
    function completeTransaction(bytes32 id) external {
        DataTypes.Transaction storage transaction = transactions[id];
        
        if (transaction.status != DataTypes.TransactionStatus.Active) {
            revert Errors.INVALID_TRANSACTION_STATUS();
        }

        if (msg.sender != transaction.dapp) {
            revert Errors.NOT_AUTHORIZED();
        }

        // Get arbitrator info and calculate duration-based fee
        DataTypes.ArbitratorInfo memory arbitratorInfo = arbitratorManager.getArbitratorInfo(transaction.arbitrator);
        uint256 duration = block.timestamp - transaction.startTime;
        uint256 arbitratorFee = (arbitratorInfo.ethAmount * duration * arbitratorInfo.currentFeeRate) / (SECONDS_PER_YEAR * FEE_RATE_MULTIPLIER);

        // Calculate system fee from arbitrator's fee and get fee collector
        uint256 systemFee = (arbitratorFee * configManager.getConfig(configManager.SYSTEM_FEE_RATE())) / 10000;
        uint256 finalArbitratorFee = arbitratorFee - systemFee;
        address feeCollector = configManager.getSystemFeeCollector();

        // Pay system fee to collector
        (bool success1, ) = feeCollector.call{value: systemFee}("");
        if (!success1) revert Errors.TRANSFER_FAILED();

        // Pay arbitrator
        (bool success2, ) = transaction.arbitrator.call{value: finalArbitratorFee}("");
        if (!success2) revert Errors.TRANSFER_FAILED();

        // Refund remaining balance to DApp
        uint256 remainingBalance = address(this).balance;
        if (remainingBalance > 0) {
            (bool success3, ) = transaction.dapp.call{value: remainingBalance}("");
            if (!success3) revert Errors.TRANSFER_FAILED();
        }

        // Release arbitrator from working status
        arbitratorManager.releaseArbitrator(transaction.arbitrator, id);

        transaction.status = DataTypes.TransactionStatus.Completed;
        emit TransactionCompleted(id);
    }

    /**
     * @notice Request arbitration for a transaction
     * @param id Transaction ID
     * @param btcTx Bitcoin transaction data
     * @param timeoutCompensationReceiver Address to receive timeout compensation
     */
    function requestArbitration(
        bytes32 id,
        bytes calldata btcTx,
        address timeoutCompensationReceiver
    ) external nonReentrant {
        if (timeoutCompensationReceiver == address(0)) {
            revert Errors.ZERO_ADDRESS();
        }

        DataTypes.Transaction storage transaction = transactions[id];

        if (transaction.status != DataTypes.TransactionStatus.Active) {
            revert Errors.INVALID_TRANSACTION_STATUS();
        }

        if (msg.sender != transaction.dapp) {
            revert Errors.NOT_AUTHORIZED();
        }

        transaction.status = DataTypes.TransactionStatus.Arbitrated;
        transaction.btcTx = btcTx;
        transaction.timeoutCompensationReceiver = timeoutCompensationReceiver;

        emit ArbitrationRequested(id);
    }

    /**
     * @notice Submit arbitration result
     * @param id Transaction ID
     * @param btcTxSignature Bitcoin transaction signature
     */
    function submitArbitration(
        bytes32 id,
        bytes calldata btcTxSignature
    ) external {
        DataTypes.Transaction storage transaction = transactions[id];

        if (transaction.status != DataTypes.TransactionStatus.Arbitrated) {
            revert Errors.INVALID_TRANSACTION_STATUS();
        }

        if (!arbitratorManager.isOperatorOf(transaction.arbitrator, msg.sender)) {
            revert Errors.NOT_AUTHORIZED();
        }

        transaction.status = DataTypes.TransactionStatus.Completed;
        transaction.signature = btcTxSignature;

        emit ArbitrationCompleted(id);
    }

    /**
     * @notice Get transaction by Bitcoin transaction
     * @param btcTx Bitcoin transaction data
     * @return Transaction struct
     */
    function getTransaction(bytes calldata btcTx) external view returns (DataTypes.Transaction memory) {
        for (uint256 i = 0; i < _transactionIdCounter; i++) {
            bytes32 id = keccak256(abi.encodePacked(i));
            DataTypes.Transaction memory transaction = transactions[id];
            if (keccak256(transaction.btcTx) == keccak256(btcTx)) {
                return transaction;
            }
        }
        revert Errors.TRANSACTION_NOT_FOUND();
    }

    /**
     * @notice Get transaction details
     * @param id Transaction ID
     * @return Transaction details
     */
    function getTransaction(bytes32 id) external view override returns (DataTypes.Transaction memory) {
        return transactions[id];
    }
}
