//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";

// import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title A Claimable ERC721
/// @notice Holders of requisite tokens can claim an ERC721 token
contract ClaimableERC721 is ERC721Enumerable, Ownable {
    /// @notice Claimable Token Events
    /// @dev Watch events to track unclaimed tokens
    event ClaimableAdded(
        address indexed requisiteTokenAddr,
        uint indexed requisiteTokenId
    );
    event Claimed(
        address indexed requisiteTokenAddr,
        uint indexed requisiteTokenId,
        uint tokenId
    );

    uint private tokenIndex;

    /// @notice Claimable token
    struct Token {
        bool claimed;
        string URI;
    }

    /// @notice Requisite token mapped to claimable token
    mapping(address => mapping(uint => Token)) private _tokens;

    constructor(string memory name_, string memory symbol_)
        ERC721(name_, symbol_)
    {}

    /// @notice Claim token
    /// @param contractAddr of the requisite token
    /// @param tokenId of the requisite token
    /// @return uint Claimed token Id
    /// @dev msg.sender must possess the requisite token in order to claim
    function claim(address contractAddr, uint tokenId) external returns (uint) {
        Token storage token_ = _tokens[contractAddr][tokenId];

        require(bytes(token_.URI).length != 0, "Not Valid Claim");

        require(!token_.claimed, "Already Claimed");

        require(
            ERC721(contractAddr).ownerOf(tokenId) == msg.sender,
            "Not Owner"
        );

        token_.claimed = true;
        tokenIndex++;

        _tokens[address(this)][tokenIndex] = token_;
        _safeMint(msg.sender, tokenIndex);

        emit Claimed(contractAddr, tokenId, tokenIndex);

        return tokenIndex;
    }

    /// @notice Checks if a claimable token has already been claimed
    /// @param contractAddr of the requisite token
    /// @param tokenId of the requisite token
    /// @return bool Claim Status
    function isClaimed(address contractAddr, uint tokenId)
        public
        view
        returns (bool)
    {
        Token storage token_ = _tokens[contractAddr][tokenId];

        require(bytes(token_.URI).length != 0, "Not Valid Claim");

        return token_.claimed;
    }

    /// @notice Owner can bulk add new claimable tokens
    /// @param contractAddr of the requisite tokens
    /// @param tokenIds[] of the requisite tokens
    /// @param uris[] of the new claimable tokens
    /// @dev tokenIds[] and uris[] require matching indexes
    function addTokens(
        address contractAddr,
        uint[] memory tokenIds,
        string[] memory uris
    ) external onlyOwner {
        require(tokenIds.length == uris.length);

        for (uint idx; idx < tokenIds.length; idx++) {
            _tokens[contractAddr][tokenIds[idx]].URI = uris[idx];

            emit ClaimableAdded(contractAddr, tokenIds[idx]);
        }
    }

    /// @notice Returns the claimable token URI
    /// @param tokenId of the claimable token
    /// @return string Token URI
    function tokenURI(uint tokenId)
        public
        view
        virtual
        override
        returns (string memory)
    {
        require(
            _exists(tokenId),
            "ERC721Metadata: URI query for nonexistent token"
        );

        return _tokens[address(this)][tokenId].URI;
    }
}
