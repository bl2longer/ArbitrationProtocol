// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../libraries/DataTypes.sol";

interface IDAppRegistry {
    /**
     * @notice 注册DApp
     * @param dappContract DApp合约地址
     */
    function registerDApp(address dappContract) external;

    /**
     * @notice 授权DApp
     * @param dapp DApp地址
     */
    function authorizeDApp(address dapp) external;

    /**
     * @notice 注销DApp
     * @param dapp DApp地址
     * @dev 将DApp状态设置为Deregistered，表示DApp已注销
     */
    function deregisterDApp(address dapp) external;

    /**
     * @notice 检查DApp是否已注册
     * @param dapp DApp地址
     * @return 如果DApp已注册返回true，否则返回false
     */
    function isRegistered(address dapp) external view returns (bool);

    /**
     * @notice DApp注册事件
     * @param dapp DApp地址
     * @param owner DApp所有者
     */
    event DAppRegistered(address indexed dapp, address indexed owner);

    /**
     * @notice DApp授权事件
     * @param dapp DApp地址
     */
    event DAppAuthorized(address indexed dapp);

    /**
     * @notice DApp暂停事件
     * @param dapp DApp地址
     */
    event DAppSuspended(address indexed dapp);

    /**
     * @notice DApp注销事件
     * @param dapp DApp地址
     */
    event DAppDeregistered(address indexed dapp);
}