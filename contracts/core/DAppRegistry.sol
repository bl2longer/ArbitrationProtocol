// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../interfaces/IDAppRegistry.sol";
import "../libraries/DataTypes.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title DAppRegistry
 * @notice DApp 注册表合约，管理所有接入仲裁协议的 DApp
 */
contract DAppRegistry is IDAppRegistry, Ownable {
    // DApp 注册映射
    mapping(address => bool) private registeredDapps;
    
    // DApp 授权映射
    mapping(address => bool) private authorizedDapps;
    
    // 修饰器：检查 DApp 是否已注册
    modifier dappRegistered(address dapp) {
        require(registeredDapps[dapp], "DAppNotRegistered");
        _;
    }
    
    // 修饰器：检查 DApp 是否未注册
    modifier dappNotRegistered(address dapp) {
        require(!registeredDapps[dapp], "DAppAlreadyRegistered");
        _;
    }

    /**
     * @notice 注册新的 DApp
     * @param dapp DApp 合约地址
     * @param owner DApp 所有者地址
     * @param minStake 最小质押要求
     * @param arbitratorCount 所需仲裁人数量
     */
    function registerDApp(
        address dapp,
        address owner,
        uint256 minStake,
        uint256 arbitratorCount
    ) external dappNotRegistered(dapp) returns (bool) {
        require(dapp != address(0), "InvalidDAppAddress");
        require(owner != address(0), "InvalidOwner");
        require(minStake > 0, "InvalidMinStake");
        require(arbitratorCount > 0, "InvalidArbitratorCount");

        registeredDapps[dapp] = true;
        emit DAppRegistered(dapp, owner, minStake, arbitratorCount);
        return true;
    }

    /**
     * @notice 授权 DApp
     * @param dapp DApp 合约地址
     */
    function authorizeDApp(address dapp) 
        external 
        override 
        onlyOwner 
        dappRegistered(dapp) 
    {
        require(!authorizedDapps[dapp], "DAppAlreadyAuthorized");
        authorizedDapps[dapp] = true;
        emit DAppAuthorized(dapp);
    }

    /**
     * @notice 注销 DApp
     * @param dapp DApp 合约地址
     */
    function deregisterDApp(address dapp) 
        external 
        override 
        onlyOwner 
        dappRegistered(dapp)
    {
        registeredDapps[dapp] = false;
        authorizedDapps[dapp] = false;
        emit DAppDeregistered(dapp);
    }

    /**
     * @notice 检查 DApp 是否已注册
     * @param dapp DApp 合约地址
     */
    function isRegistered(address dapp) external view returns (bool) {
        return registeredDapps[dapp];
    }

    /**
     * @notice 检查 DApp 是否已授权
     * @param dapp DApp 合约地址
     */
    function isAuthorized(address dapp) external view returns (bool) {
        return authorizedDapps[dapp];
    }
}
