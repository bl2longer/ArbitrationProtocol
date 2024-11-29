// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IConfigManager {
    // 质押相关配置
    function setMinStake(uint256 amount) external;
    function setMaxStake(uint256 amount) external;
    function setMinStakeLockedTime(uint256 time) external;
    
    // 时间相关配置
    function setMinTransactionDuration(uint256 duration) external;
    function setMaxTransactionDuration(uint256 duration) external;
    function setArbitrationTimeout(uint256 timeout) external;
    
    // 费用相关配置
    function setTransactionMinFeeRate(uint256 rate) external;
    
    // 仲裁人相关配置
    function setArbitrationFrozenPeriod(uint256 period) external;
    function getArbitrationFrozenPeriod() external view returns (uint256);
    function setSystemFeeRate(uint256 rate) external;
    function getSystemFeeRate() external view returns (uint256);
    
    // 查询配置
    function getConfig(bytes32 key) external view returns (uint256);
    function getAllConfigs() external view returns (bytes32[] memory keys, uint256[] memory values);
    
    event ConfigUpdated(bytes32 indexed key, uint256 oldValue, uint256 newValue);
    event ArbitrationFrozenPeriodUpdated(uint256 oldPeriod, uint256 newPeriod);
    event ArbitrationTimeoutUpdated(uint256 oldTimeout, uint256 newTimeout);
    event SystemFeeRateUpdated(uint256 oldRate, uint256 newRate);
    event SystemRevenueAddressesUpdated(
        address oldEthAddress,
        address newEthAddress,
        bytes oldBtcPubKey,
        bytes newBtcPubKey,
        string oldBtcAddress,
        string newBtcAddress
    );
}