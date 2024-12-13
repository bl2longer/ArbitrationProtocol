// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

struct VotesWithLockTime {
    bytes candidate;
    uint64 votes;
    uint32 lockTime;
}

struct BNFTVoteInfo {
    bytes32 transactionHash;
    uint32 blockHeight;
    uint8 voteType;
    VotesWithLockTime[] infos;
}

interface IBNFTInfo {
    function addNftInfo(uint256 tokenId, bytes32 referKey, BNFTVoteInfo calldata info) external;
    function getNftInfo(uint256 tokenId) external view returns (bytes32, BNFTVoteInfo memory);
    function getNFTInfoByReferKey(bytes32 referKey) external view returns (BNFTVoteInfo memory);
    function setAccessControlAddress(address accessControl) external;
    function getAccessControlAddress() external view returns(address);
}
