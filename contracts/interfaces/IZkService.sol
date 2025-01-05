// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../libraries/DataTypes.sol";
/**
 * @title IZkService
 * @notice Interface for ZK service verification
 */
interface IZkService {
    /**
     * @notice Retrieves the complete zero-knowledge (ZK) verification details for a given ID
     * @param id A unique bytes32 identifier for the ZK verification record
     * @return verification A ZKVerification struct containing all verification details including raw data, public key, transaction hash, signature, verification status, and associated UTXOs
     * @dev This function provides comprehensive read-only access to ZK verification information
     */
    function getZkVerification(bytes32 id) external view returns (DataTypes.ZKVerification memory );

    // Submits arbitration-related data for verification to the ZK service.
    function submitArbitration(
        bytes calldata  pubKey,
        bytes calldata rawData,
        bytes[] calldata utxos,
        uint256 inputIndex,
        uint256 signatureIndex
    ) external payable returns (bytes32);

    // get the fee in wei for the verification
    function fee() external view returns (uint256);

    // emit after the zkp service completed, save the result in the contract
    event TransactionStored(
        bytes32 indexed id,
        bytes pubKey,
        bool verified
    );

    // emit after the data stored in submitArbitration
    event ArbitrationReqStored(
        bytes32 indexed id,
        bytes pubKey,
        bytes rawData,
        bytes[] utxos,
        uint256 inputIndex,
        uint256 signatureIndex
    );
}