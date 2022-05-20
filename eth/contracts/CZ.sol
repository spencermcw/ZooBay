// tokenContracts/MyNFT.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

contract DummyERC721 is ERC721Enumerable {
    constructor(string memory token) ERC721(token, token) {}
    uint private tokenId;
    function mint(uint amount) external {
        for (uint i; i < amount; i++) {
            _safeMint(_msgSender(), tokenId++);
        }
    }
}


contract EEGG is ERC721 {
    constructor() ERC721("EEGG22", "CZ Easter Egg 2022")
    {
        _safeMint(_msgSender(), 0);
    }

    function tokenURI(uint id)
        override public pure returns (string memory)
    {
        id;
        return "ipfs://bafyreifxjgxlubg7hnb4tpkwmqqdmuwkgedom5jlvwwgv4nbkmt2lsvape/metadata.json";
    }
}


contract EGG is DummyERC721 {
    constructor() DummyERC721("EGG") { }
}

contract HEGG is DummyERC721 {
    constructor() DummyERC721("HEGG") { }

    function breeds ( uint256 tokenId )
        external pure returns (uint8)
    {
        return uint8(tokenId % 7);
    }

    function parents1 ( uint tokenId )
        external pure returns (uint)
    {
        return tokenId + 1;
    }

    function parents2 ( uint tokenId )
        external pure returns (uint)
    {
        return tokenId + 2;
    }
}

contract ANML is DummyERC721 {
    // Base Animal: 
    // metadata.cryptozoo.co/nft/56/0xb6a988721FAc6805e991b3aC7cb295A0b6CdBD38/(tokenId)
    constructor() DummyERC721("ANML") { }
    function _baseURI() override internal pure returns (string memory) {
        return "http://metadata.cryptozoo.co/nft/56/0xb6a988721FAc6805e991b3aC7cb295A0b6CdBD38/";
    }
}

contract HANML is DummyERC721 {
    // Hybrid Animal
    // metadata.cryptozoo.co/nft/56/0x686445f68ECB7F963960cb7A381491Be4aa65750/(tokenId)
    constructor() DummyERC721("HANML") { }
    function _baseURI() override internal pure returns (string memory) {
        return "http://metadata.cryptozoo.co/nft/56/0x686445f68ECB7F963960cb7A381491Be4aa65750/";
    }
}


contract ZOO is ERC20Burnable {
    constructor() ERC20("ZOO", "ZOO") { }
    function mint(uint amount) external {
        _mint(_msgSender(), amount);
    }
}

