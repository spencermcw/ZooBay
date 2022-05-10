//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

contract OOO is ERC721, Ownable {
    uint private tokenIndex;

    /// @notice Contract Whitelist
    mapping(address => bool) public _whitelist;

    struct Claim {
        bool claimed;
        string URI;
    }

    /// @notice Mapping Animal Tokens to 1 of 1 Metadata
    mapping(address => mapping(uint => Claim)) private _claims;

    constructor(
        string memory name_,
        string memory symbol_
    )
        ERC721(name_, symbol_)
    { }

    function whitelist(address[] memory contractAddrs, bool enable)
        external onlyOwner
    {
        for(uint i; i < contractAddrs.length; i++) {
            _whitelist[contractAddrs[i]] = enable;
        }
    }

    function claim(address contractAddr, uint tokenId)
        external
        returns (uint)
    {
        Claim storage claim_ = _claims[contractAddr][tokenId];

        require(
            _whitelist[contractAddr] && bytes(claim_.URI).length != 0,
            "Not Valid Claim"
        );

        require(
            !claim_.claimed,
            "Already Claimed"
        );

        require(
            ERC721(contractAddr).ownerOf(tokenId) == _msgSender(),
            "Not Owner"
        );

        claim_.claimed = true;
        tokenIndex++;

        _safeMint(_msgSender(), tokenIndex);
        _setTokenURI(tokenIndex, claim_.URI);

        return tokenIndex;
    }

    function isClaimed(address contractAddr, uint tokenId)
        public view
        returns (bool)
    {
        return _claims[contractAddr][tokenId].claimed;
    }

    function tokenURI(uint tokenId)
        public view virtual override
        returns (string memory)
    {
        require(
            _exists(tokenId),
            "ERC721Metadata: URI query for nonexistent token"
        );

        return _claims[address(this)][tokenId].URI;
    }

    function _setTokenURI(uint tokenId, string memory newURI)
        internal
    {
        _claims[address(this)][tokenId].URI = newURI;
    }

    /**
     * @dev Admin Controls for updating 1 of 1s
     */
    function setTokenURI(uint tokenId, string memory newURI)
        public onlyOwner
    {
        _setTokenURI(tokenId, newURI);
    }

    function setMetadata(
        address contractAddr,
        uint tokenId,
        string memory newURI
    )
        external onlyOwner
    {
        _claims[contractAddr][tokenId].URI = newURI;
    }

    function setBulkMetadata(
        address contractAddr,
        uint[] memory tokenIds,
        string[] memory uris
    )
        external onlyOwner
    {
        require(_whitelist[contractAddr], "Not on Whitelist");
        require(tokenIds.length == uris.length);

        for (uint idx; idx < tokenIds.length; idx++) {
            _claims[contractAddr][tokenIds[idx]].URI = uris[idx];
        }
    }

    function setWhitelist(address contractAddr, bool approved)
        external onlyOwner
    {
        _whitelist[contractAddr] = approved;
    }
}
