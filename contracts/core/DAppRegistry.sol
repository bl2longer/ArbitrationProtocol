// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "../interfaces/IDAppRegistry.sol";
import "../libraries/DataTypes.sol";
import "../libraries/Errors.sol";

/**
 * @title DAppRegistry
 * @notice Manages DApp registration and authorization in the BeLayer2 arbitration protocol
 */
contract DAppRegistry is IDAppRegistry, Ownable {
    // DApp status mapping
    mapping(address => DataTypes.DAppStatus) private dappStatus;
    
    // DApp owner mapping
    mapping(address => address) private dappOwner;

    // DApp registration fee mapping
    mapping(address => uint256) private dappFees;

    // Registration fee amount
    uint256 public constant REGISTRATION_FEE = 0.1 ether;

    /**
     * @notice Constructor to set initial owner
     * @param initialOwner Initial owner of the contract
     */
    constructor(address initialOwner) Ownable(initialOwner) {}

    /**
     * @notice Register DApp
     * @param dappContract DApp contract address
     */
    function registerDApp(address dappContract) external payable {
        if (dappContract == address(0)) {
            revert Errors.ZERO_ADDRESS();
        }

        if (dappStatus[dappContract] != DataTypes.DAppStatus.None) {
            revert Errors.DAPP_ALREADY_REGISTERED();
        }

        if (msg.value < REGISTRATION_FEE) {
            revert Errors.INSUFFICIENT_FEE();
        }

        dappStatus[dappContract] = DataTypes.DAppStatus.Pending;
        dappOwner[dappContract] = msg.sender;
        dappFees[dappContract] = msg.value;

        emit DAppRegistered(dappContract, msg.sender);
    }

    /**
     * @notice Authorize DApp
     * @param dapp DApp address
     */
    function authorizeDApp(address dapp) external onlyOwner {
        if (dapp == address(0)) {
            revert Errors.ZERO_ADDRESS();
        }

        if (dappStatus[dapp] != DataTypes.DAppStatus.Pending) {
            revert Errors.DAPP_NOT_REGISTERED();
        }

        dappStatus[dapp] = DataTypes.DAppStatus.Active;

        emit DAppAuthorized(dapp);
    }

    /**
     * @notice Deregister DApp
     * @param dapp DApp address
     */
    function deregisterDApp(address dapp) external {
        if (dapp == address(0)) {
            revert Errors.ZERO_ADDRESS();
        }

        if (dappStatus[dapp] == DataTypes.DAppStatus.None) {
            revert Errors.DAPP_NOT_REGISTERED();
        }

        if (msg.sender != dappOwner[dapp] && msg.sender != owner()) {
            revert Errors.NOT_AUTHORIZED();
        }

        uint256 fee = dappFees[dapp];
        dappFees[dapp] = 0;
        dappStatus[dapp] = DataTypes.DAppStatus.Terminated;

        // Return registration fee to DApp owner
        if (fee > 0) {
            (bool success, ) = dappOwner[dapp].call{value: fee}("");
            if (!success) revert Errors.TRANSFER_FAILED();
        }

        emit DAppDeregistered(dapp);
    }

    /**
     * @notice Check if DApp is registered
     * @param dapp DApp address
     * @return Returns true if DApp is registered, false otherwise
     */
    function isRegistered(address dapp) external view returns (bool) {
        return dappStatus[dapp] == DataTypes.DAppStatus.Pending;
    }

    /**
     * @notice Check if DApp is active (authorized)
     * @param dapp DApp address
     * @return Returns true if DApp is active, false otherwise
     */
    function isActiveDApp(address dapp) external view returns (bool) {
        return dappStatus[dapp] == DataTypes.DAppStatus.Active;
    }

    /**
     * @notice Get DApp owner
     * @param dapp DApp address
     * @return DApp owner address
     */
    function getDAppOwner(address dapp) external view returns (address) {
        return dappOwner[dapp];
    }

    /**
     * @notice Get DApp status
     * @param dapp DApp address
     * @return DApp status
     */
    function getDAppStatus(address dapp) external view returns (DataTypes.DAppStatus) {
        return dappStatus[dapp];
    }
}
