// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../libraries/DataTypes.sol";

interface ICompensationManager {
    // Submit illegal signature compensation claim
    function claimIllegalSignatureCompensation(
        address arbitrator,
        bytes calldata btcTx,
        bytes32 evidence
    ) external returns (bytes32 claimId);

    // Submit timeout compensation claim
    function claimTimeoutCompensation(
        bytes32 id
    ) external returns (bytes32 claimId);
    
    // Submit failed arbitration compensation claim
    function claimFailedArbitrationCompensation(
        bytes32 txId,
        bytes32 evidence
    ) external returns (bytes32 claimId);

    // Withdraw compensation
    function withdrawCompensation(bytes32 claimId) external;
    
    // Query claimable compensation amount
    function getClaimableAmount(
        bytes32 claimId
    ) external view returns (uint256);

    event CompensationClaimed(bytes32 indexed claimId, address indexed claimer);
    event CompensationWithdrawn(bytes32 indexed claimId);
}