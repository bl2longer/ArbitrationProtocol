// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../interfaces/IConfigManager.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ConfigManager
 * @notice 配置管理合约，负责管理协议的各项参数配置
 */
contract ConfigManager is IConfigManager, Ownable {
    // 仲裁冻结期（秒）
    uint256 private arbitrationFrozenPeriod;
    
    // 仲裁超时时间（秒）
    uint256 private arbitrationTimeout;

    // 仲裁人冷却期（秒）
    uint256 private arbitratorCooldownPeriod;

    // 系统费率（基点，1% = 100）
    uint256 private systemFeeRate;

    // 系统收款地址
    struct SystemRevenueAddresses {
        address ethAddress;
        bytes btcPubKey;
        string btcAddress;
    }
    SystemRevenueAddresses private systemRevenueAddresses;

    /**
     * @notice 构造函数，初始化默认配置
     */
    constructor(
        uint256 _arbitrationFrozenPeriod,
        uint256 _arbitrationTimeout,
        uint256 _arbitratorCooldownPeriod,
        uint256 _systemFeeRate,
        address _systemEthAddress,
        bytes memory _systemBtcPubKey,
        string memory _systemBtcAddress
    ) {
        require(_arbitrationFrozenPeriod > 0, "InvalidFrozenPeriod");
        require(_arbitrationTimeout > 0, "InvalidTimeout");
        require(_arbitratorCooldownPeriod > 0, "InvalidCooldownPeriod");
        require(_systemFeeRate <= 10000, "InvalidFeeRate"); // 最大100%
        require(_systemEthAddress != address(0), "InvalidEthAddress");

        arbitrationFrozenPeriod = _arbitrationFrozenPeriod;
        arbitrationTimeout = _arbitrationTimeout;
        arbitratorCooldownPeriod = _arbitratorCooldownPeriod;
        systemFeeRate = _systemFeeRate;
        
        systemRevenueAddresses = SystemRevenueAddresses({
            ethAddress: _systemEthAddress,
            btcPubKey: _systemBtcPubKey,
            btcAddress: _systemBtcAddress
        });
    }

    /**
     * @notice 设置仲裁冻结期
     * @param period 新的冻结期（秒）
     */
    function setArbitrationFrozenPeriod(uint256 period) external override onlyOwner {
        require(period > 0, "InvalidPeriod");
        uint256 oldPeriod = arbitrationFrozenPeriod;
        arbitrationFrozenPeriod = period;
        emit ArbitrationFrozenPeriodUpdated(oldPeriod, period);
    }

    /**
     * @notice 获取仲裁冻结期
     */
    function getArbitrationFrozenPeriod() external view override returns (uint256) {
        return arbitrationFrozenPeriod;
    }

    /**
     * @notice 设置仲裁超时时间
     * @param timeout 新的超时时间（秒）
     */
    function setArbitrationTimeout(uint256 timeout) external override onlyOwner {
        require(timeout > 0, "InvalidTimeout");
        uint256 oldTimeout = arbitrationTimeout;
        arbitrationTimeout = timeout;
        emit ArbitrationTimeoutUpdated(oldTimeout, timeout);
    }

    /**
     * @notice 获取仲裁超时时间
     */
    function getArbitrationTimeout() external view override returns (uint256) {
        return arbitrationTimeout;
    }

    /**
     * @notice 设置仲裁人冷却期
     * @param period 新的冷却期（秒）
     */
    function setArbitratorCooldownPeriod(uint256 period) external override onlyOwner {
        require(period > 0, "InvalidPeriod");
        uint256 oldPeriod = arbitratorCooldownPeriod;
        arbitratorCooldownPeriod = period;
        emit ArbitratorCooldownPeriodUpdated(oldPeriod, period);
    }

    /**
     * @notice 获取仲裁人冷却期
     */
    function getArbitratorCooldownPeriod() external view override returns (uint256) {
        return arbitratorCooldownPeriod;
    }

    /**
     * @notice 设置系统费率
     * @param rate 新的费率（基点，1% = 100）
     */
    function setSystemFeeRate(uint256 rate) external override onlyOwner {
        require(rate <= 10000, "InvalidFeeRate"); // 最大100%
        uint256 oldRate = systemFeeRate;
        systemFeeRate = rate;
        emit SystemFeeRateUpdated(oldRate, rate);
    }

    /**
     * @notice 获取系统费率
     */
    function getSystemFeeRate() external view override returns (uint256) {
        return systemFeeRate;
    }

    /**
     * @notice 设置系统收款地址
     * @param ethAddress 以太坊收款地址
     * @param btcPubKey 比特币公钥
     * @param btcAddress 比特币收款地址
     */
    function setSystemRevenueAddresses(
        address ethAddress,
        bytes calldata btcPubKey,
        string calldata btcAddress
    ) external override onlyOwner {
        require(ethAddress != address(0), "InvalidEthAddress");
        
        SystemRevenueAddresses memory oldAddresses = systemRevenueAddresses;
        
        systemRevenueAddresses = SystemRevenueAddresses({
            ethAddress: ethAddress,
            btcPubKey: btcPubKey,
            btcAddress: btcAddress
        });

        emit SystemRevenueAddressesUpdated(
            oldAddresses.ethAddress,
            ethAddress,
            oldAddresses.btcPubKey,
            btcPubKey,
            oldAddresses.btcAddress,
            btcAddress
        );
    }

    /**
     * @notice 获取系统收款地址
     */
    function getSystemRevenueAddresses() external view override returns (
        address ethAddress,
        bytes memory btcPubKey,
        string memory btcAddress
    ) {
        return (
            systemRevenueAddresses.ethAddress,
            systemRevenueAddresses.btcPubKey,
            systemRevenueAddresses.btcAddress
        );
    }
}
