// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IZkService
 * @notice Interface for ZK service verification
 */
interface IZkService {
    /**
     * @notice Get raw data, public key and verify signature for a given id
     * @param id The ID to query
     * @return rawData The raw data associated with the ID
     * @return pubKey The public key associated with the ID
     * @return hash The hash of the standard rawdata
    * @return  signature The signature associated with the ID
     * @return verified Whether the signature is verified
     */
    function getZkVerification(bytes32 id) external view returns (
        bytes memory rawData,
        bytes memory pubKey,
        bytes32 hash,
        bytes memory signature,
        bool verified
    );
}
