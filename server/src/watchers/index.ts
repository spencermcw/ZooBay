import { ethers } from "ethers";
import { AuctionHouse, AssetContractsByAddress } from "../ethereum/contracts";
import Listings from "../knex/models/Listings";
import Bids from "../knex/models/Bids";
import Assets from "../knex/models/Assets";
import ListingAssets from "../knex/models/ListingAssets";

const getAddress = ethers.utils.getAddress

const ListingFromChain = async (listingId: string) => {
    const listing = await AuctionHouse.listings(listingId)
    return {
        id: listing.id.toString(),
        created_at: listing.createdAt.toString(),
        creator: listing.creator.toString(),
        expires_at: listing.expiresAt.toString(),
        price: listing.price.toString(),
        min_bid: listing.minBid.toString(),
        creator_claimed: listing.creatorClaimed,
        bidder_claimed: listing.bidderClaimed,
    }
}

AuctionHouse.on(
    AuctionHouse.filters.ListingCreated(),
    async (creator: string, listingId: ethers.BigNumber) => {
        const listing = await AuctionHouse.listings(listingId)
        const listingRecord = await ListingFromChain(listingId.toString());
        await Listings.query()
            .insert(listingRecord)
            .onConflict()
            .ignore()
        const { tokenContracts, tokenIds }: {
            tokenContracts: string[];
            tokenIds: ethers.BigNumber[][];
        } = await AuctionHouse.listingTokens(listingId);
        for (let c = 0; c < tokenContracts.length; c++) {
            const contract = getAddress(tokenContracts[c]);
            const ids = tokenIds[c];
            const assets = await Promise.all(ids.map(async (id: ethers.BigNumber) => ({
                id: id.toString(),
                contract: contract,
                metadata: await AssetContractsByAddress[contract].generateMetaData(id.toString())
            })))
            await Assets.query()
                .insert(assets)
                .onConflict()
                .ignore()
            const listingAssets = ids.map((id: ethers.BigNumber) => ({
                listing_id: listing.id.toString(),
                asset_id: id.toString(),
                asset_contract: contract,
            }))
            await ListingAssets.query()
                .insert(listingAssets)
                .onConflict()
                .ignore()
        }
    }
)

AuctionHouse.on(
    AuctionHouse.filters.ListingClaimed(),
    async (listingId: ethers.BigNumber) => {
        const listing = await ListingFromChain(listingId.toString());
        await Listings.query()
            .update(listing)
            .where({ id: listing.id })
    }
)

AuctionHouse.on(
    AuctionHouse.filters.ListingCancelled(),
    async (listingId: ethers.BigNumber) => {
        const listing = await ListingFromChain(listingId.toString());
        await Listings.query()
            .update(listing)
            .where({ id: listing.id })
    }
)

AuctionHouse.on(
    AuctionHouse.filters.BidCreated(),
    async (bidder: string, listingId: ethers.BigNumber, bidId: ethers.BigNumber) => {
        const bid = await AuctionHouse.bids(bidId);
        const bidRecord = {
            id: bidId.toString(),
            bidder: bid.bidder,
            amount: bid.amount.toString(),
            listing_id: listingId.toString(),
            timestamp: bid.timestamp.toString()
        }
        await Bids.query()
            .insert(bidRecord)
            .onConflict()
            .ignore()
        const listing = await AuctionHouse.listings(listingId);
        const listingRecord = {
            id: listing.id.toString(),
            expires_at: listing.expiresAt.toString()
        }
        await Listings.query()
            .update(listingRecord)
            .where({ id: listingRecord.id })
    }
)
