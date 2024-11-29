// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../libraries/DataTypes.sol";

interface ICompensationManager {
    // 提交非法签名补偿申请
    function claimIllegalSignatureCompensation(
        address arbitrator,
        bytes calldata btcTx,
        bytes32 calldata evidence
    ) external returns (bytes32 claimId);

    // 提交超时补偿申请
    function claimTimeoutCompensation(
        bytes32 id
    ) external returns (bytes32 claimId);
    
    // 提交错误仲裁签名补偿申请
    function claimFailedArbitrationCompensation(
        bytes32 txId,
        bytes32 calldata evidence
    ) external returns (bytes32 claimId);

    // 领取补偿
    function withdrawCompensation(bytes32 claimId) external;
    
    // 查询可领取的补偿金额
    function getClaimableAmount(
        bytes32 claimId
    ) external view returns (uint256);
    
    event CompensationClaimed(bytes32 indexed claimId, address indexed claimer);
    event CompensationWithdrawn(bytes32 indexed claimId);
}