// SPDX-License-Identifier: Unlicense

// Author: Spencer K. McWilliams

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";


/// @title An Auction House Protocol
/// @author Spencer K. McWilliams
/// @notice A contract to facilitate auctions via Listings and Bids
contract AuctionHouse is Ownable, Pausable, ReentrancyGuard, ERC721Holder {
    /// @notice Generic Bid
    struct Bid {
        uint id;
        address bidder;
        uint listingId;
        uint amount;
        uint timestamp;
    }

    /// @notice Generic Listing
    struct Listing {
        uint id;
        address creator;
        uint createdAt;
        uint expiresAt;
        uint price;
        uint minBid;
        bool creatorClaimed;
        bool bidderClaimed;
        address currency;
        uint[] bids;
        address[] tokenContracts;
        uint[][] tokenIds;
    }

    /// @notice The primary ERC20 token for the Auction House
    address public currency;

    /// @notice Listing ID Incrementor
    /// @dev Doubles as an indicator of total Listings
    uint public nextListingId;

    /// @notice Bid ID Incrementor
    /// @dev Doubles as an indicator of total Bids
    uint public nextBidId;

    /// @notice Tracker of toal burn
    uint public burned;

    /// @notice Record of contracts this Auction House may process
    /// @dev Only used for Listing creation
    mapping(address => bool) public contractAllowed;

    /// @notice Listings by ID
    mapping(uint => Listing) public listings;

    /// @notice Bids by ID
    mapping(uint => Bid) public bids;

    /// @notice All Listings created by an address
    mapping(address => uint[]) private mlistingsByCreator_;

    /// @notice All Bids created by an address
    mapping(address => uint[]) private mbidsByBidder_;

    /// @notice Emitted upon Listing creation
    event ListingCreated(address indexed creator, uint id);

    /// @notice Emitted upon Listing Claim
    /// @dev Emitted twice (independent transactions) per Listing: once for creator, one for winning bidder
    event ListingClaimed(uint indexed id, address indexed account);

    /// @notice Emitted upon Listing Cancellation
    event ListingCancelled(uint indexed id);

    /// @notice Emitted upon Bid creation
    event BidCreated(address indexed bidder, uint indexed listingId, uint bidId);

    constructor() {
        _pause();
    }

    /// @notice Sets the contract's primary (ERC20) currency
    /// @dev Will not affect pre-existing Listings
    /// @param currency_ The (ERC20) currency address to use for Listings/Bids
    function setCurrency(address currency_)
        public onlyOwner whenPaused
    {
        currency = currency_;
    }

    /// @notice Enables or disables a given contract address for use in Listings
    /// @dev Only affects Listing creation
    /// @param contract_ The (ERC721) token address to enable or disable
    /// @param allowed_ Indicates enable or disable
    function setContractAllowed(address contract_, bool allowed_)
        public onlyOwner whenPaused
    {
        contractAllowed[contract_] = allowed_;
    }

    /// @notice Creates a new Listing
    /// @param contracts_ The (ERC721) token contracts to include in the Listing
    /// @param tokenIds_ The (ERC721) token IDs for same-index contract
    /// @param days_ The number of days before the Listing will expire
    /// @param price_ The direct purchase price for a given listing (0 indicates no direct purchase allowed)
    /// @param minBid_ The minimum allowed bid amount
    function createListing(
        address[] memory contracts_,
        uint[][] memory tokenIds_,
        uint days_,
        uint price_,
        uint minBid_
    )
        external nonReentrant whenNotPaused
    {
        require(contracts_.length == tokenIds_.length);
        require(minBid_ >= 100);
        require(days_ > 0 && days_ < 15);
        // Build Listing
        Listing memory listing;
        listing.id = nextListingId++;
        listing.creator = _msgSender();
        listing.createdAt = block.timestamp;
        listing.price = price_;
        listing.minBid = minBid_;
        listing.currency = currency;
        listing.tokenContracts = contracts_;
        listing.tokenIds = tokenIds_;
        if (price_ > 0 && minBid_ >= price_) {
            listing.expiresAt = 2**255;
            listing.minBid = price_;
        } else {
            listing.expiresAt = block.timestamp + (days_ * 1 days);
        }
        // Write Listing
        mlistingsByCreator_[_msgSender()].push(listing.id);
        listings[listing.id] = listing;
        // Take Tokens
        transferListingTokensFrom(listing.id, _msgSender(), address(this));
        // Event
        emit ListingCreated(_msgSender(), listing.id);
    }

    /// @notice Cancels a Listing
    /// @param listingId_ The ID of the desired Listing to Cancel
    function cancelListing(uint listingId_)
        external nonReentrant whenNotPaused
    {
        Listing storage listing = listings[listingId_];
        require(listing.bids.length == 0);
        require(listing.creator == _msgSender());
        require(listing.expiresAt > block.timestamp);
        listing.expiresAt = block.timestamp - 1;
        // Return Tokens to Creator
        transferListingTokensFrom(listingId_, address(this), _msgSender());
        // Update Listing
        listing.creatorClaimed = true;
        listing.bidderClaimed = true;
        // Event
        emit ListingCancelled(listing.id);
    }

    /// @notice Creates a Bid
    /// @param listingId_ The ID of the desired Listing on which to Bid
    /// @param amount_ The amount of (ERC20) currency to place as a Bid
    function createBid(uint listingId_, uint amount_)
        external nonReentrant whenNotPaused
    {
        Listing storage listing = listings[listingId_];
        require(listing.expiresAt > block.timestamp);
        require(amount_ >= listing.minBid);
        // Exisiting Bids
        if (listing.bids.length > 0) {
            Bid memory highBid = bids[listingHighestBidId(listingId_)];
            require(amount_ > highBid.amount);
            // Return Currency to previous bidder
            IERC20(listing.currency).transfer(highBid.bidder, highBid.amount);
        }
        // Direct Purchase
        if (listing.price > 0 && amount_ >= listing.price) {
            listing.expiresAt = block.timestamp - 1;
            // Cap amount_
            amount_ = listing.price;
        }
        // Take Currency into Escrow
        IERC20(listing.currency).transferFrom(_msgSender(), address(this), amount_);
        // Build Bid
        Bid memory bid;
        bid.id = nextBidId++;
        bid.bidder = _msgSender();
        bid.listingId = listingId_;
        bid.amount = amount_;
        bid.timestamp = block.timestamp;
        // Update Storage
        bids[bid.id] = bid;
        mbidsByBidder_[_msgSender()].push(bid.id);
        listings[listingId_].bids.push(bid.id);
        // Event
        emit BidCreated(_msgSender(), listing.id, bid.id);
    }

    /// @notice Claims (ERC721) tokens and/or (ERC20) currency for an expired Listing
    /// @dev This will be called by the Listing winner and/or creator (twice per Listing maximum)
    /// @param listingId_ The ID of the desired Listing from which to claim tokens or currency
    function claimListing(uint listingId_)
        external nonReentrant
    {
        Listing storage listing = listings[listingId_];
        require(block.timestamp > listing.expiresAt);
        require(!listing.creatorClaimed || !listing.bidderClaimed);
        // Listing has no Bids
        if (listing.bids.length < 1) {
            require(_msgSender() == listing.creator && !listing.creatorClaimed);
            // Transfer Tokens to Creator
            transferListingTokensFrom(listingId_, address(this), _msgSender());
            // Update Listing
            listing.creatorClaimed = true;
            listing.bidderClaimed = true;
        }
        // Listing has Bids
        else {
            Bid memory highBid = bids[listingHighestBidId(listingId_)];
            require(_msgSender() == listing.creator || _msgSender() == highBid.bidder);
            if (_msgSender() == listing.creator) {
                require(!listing.creatorClaimed);
                // Burn
                uint burn = (highBid.amount / 100 * 3) + (highBid.amount % 100);
                ERC20Burnable(listing.currency).burn(burn);
                burned += burn;
                // Transfer Currency to Owner
                IERC20(listing.currency).transfer(owner(), highBid.amount / 100 * 2);
                // Transfer Currency to Creator
                IERC20(listing.currency).transfer(listing.creator, highBid.amount / 100 * 95);
                // Update Listing
                listing.creatorClaimed = true;
            }
            if (_msgSender() == highBid.bidder) {
                require(!listing.bidderClaimed);
                // Transfer Tokens to Bidder
                transferListingTokensFrom(listingId_, address(this), highBid.bidder);
                // Update Listing
                listing.bidderClaimed = true;
            }
        }
        // Event
        emit ListingClaimed(listing.id, _msgSender());
    }

    /// @notice Utility method to transfer all (ERC721) tokens of a given listing between addresses
    /// @param listingId_ The ID of the Listing to Bid on
    /// @param from_ The address from which to take the tokens
    /// @param to_ The address to which to send the tokens
    function transferListingTokensFrom(uint listingId_, address from_, address to_)
        private
    {
        Listing storage listing = listings[listingId_];
        for (uint c; c < listing.tokenContracts.length; c++) {
            for (uint i; i < listing.tokenIds[c].length; i++) {
                IERC721(listing.tokenContracts[c]).safeTransferFrom(from_, to_, listing.tokenIds[c][i]); // TODO: [i][c]?
            }
        }
    }

    /// @notice Utility for obtaining the highest bidder for a given Listing
    /// @param listingId_ The ID of the target Listing
    /// @return bidId The ID of the highest Bid of target Listing
    function listingHighestBidId(uint listingId_)
        public view returns (uint bidId)
    {
        return listings[listingId_].bids[listings[listingId_].bids.length-1];
    }

    /// @notice Utility for obtaining all Bid IDs for a given Listing
    /// @param listingId_ The ID of the target Listing
    /// @return bidIds The IDs of Bids for target Listing
    function listingBids(uint listingId_)
        public view returns (uint[] memory bidIds)
    {
        return listings[listingId_].bids;
    }

    /// @notice Utility for obtaining all (ERC721) token contracts and IDs for a given Listing
    /// @param listingId_ The ID of the target Listing
    /// @return tokenContracts The contract addresses of tokens for target Listing
    /// @return tokenIds The IDs of tokens for target Listing
    function listingTokens(uint listingId_)
        public view returns (address[] memory tokenContracts, uint[][] memory tokenIds)
    {
        tokenContracts = listings[listingId_].tokenContracts;
        tokenIds = listings[listingId_].tokenIds;
    }

    /// @notice Utility for obtaining all Listings created by a given address
    /// @param creator_ The address of target Listing creator
    /// @return listingIds The IDs of Listings created by target address
    function listingsByCreator(address creator_)
        public view returns (uint[] memory listingIds)
    {
        return mlistingsByCreator_[creator_];
    }

    /// @notice Utility for obtaining all Bids created by a given address
    /// @param bidder_ The address of target Bid Creator
    /// @return bidIds The IDs of Bids created by target address
    function bidsByBidder(address bidder_)
        public view returns (uint[] memory bidIds)
    {
        return mbidsByBidder_[bidder_];
    }

    /// @notice Pauses or Unpauses the contract
    function togglePause()
        external onlyOwner
    {
        paused() ? _unpause() : _pause();
    }
}
