import { Knex } from "knex";
import contracts from "../../ethereum/contracts";
import type { Bid, Asset, Listing } from "../../types";
import Listings from '../models/Listings';
import Assets from '../models/Assets';
import Bids from '../models/Bids';
import ListingAssets from '../models/ListingAssets';
import { BigNumber, ethers } from 'ethers';
import { AssetContractsByAddress } from "../../ethereum/contracts";

const getAddress = ethers.utils.getAddress;

async function main() {
    const [ , , id] = process.argv;

    if (id === undefined) {
        console.log("ID not defined in args")
        return;
    }

    const listingRecord = await Listings.query().findById(id)
    const listing: Listing = await contracts.AuctionHouse.listings(id);
    // console.log(listingRecord, listing)

    if (ethers.BigNumber.from(listing.createdAt).eq(0)) {
        console.log("No Listing found on blockchain");
        return;
    }

    // Update Listing
    console.log("Upserting Listing:", listing.id.toString())
    await Listings.query()
        .insert({
            id: listing.id.toString(),
            created_at: listing.createdAt.toString(),
            creator: listing.creator.toString(),
            expires_at: listing.expiresAt.toString(),
            price: listing.price.toString(),
            min_bid: listing.minBid.toString(),
            creator_claimed: listing.creatorClaimed,
            bidder_claimed: listing.bidderClaimed,
        })
        .onConflict('id')
        .merge()

    // Update Assets
    const { tokenContracts, tokenIds }: {
        tokenContracts: string[];
        tokenIds: ethers.BigNumber[][];
    } = await contracts.AuctionHouse.listingTokens(listing.id)

    for (let c = 0; c < tokenContracts.length; c++) {
        const contract = getAddress(tokenContracts[c]);
        const ids = tokenIds[c];

        const assets = await Promise.all(ids.map(async (id: ethers.BigNumber) => ({
            id: id.toString(),
            contract: contract,
            metadata: await AssetContractsByAddress[contract].generateMetaData(id.toString())
        })))

        console.log("Inserting/Linking Assets");

        await Assets.query().insert(assets).onConflict().ignore()

        await ListingAssets.query().insert(
            ids.map((id: ethers.BigNumber) => ({
                listing_id: listing.id.toString(),
                asset_id: id.toString(),
                asset_contract: contract,
            }))
        ).onConflict().ignore()
    }

    // Update Bids
    const bidIds = await contracts.AuctionHouse.listingBids(listing.id);

    if (bidIds.length === 0) {
        console.log("No Bids Found");
        return;
    }

    const bids = await Promise.all<Bid>(bidIds.map((id: BigNumber) => contracts.AuctionHouse.bids(id)))

    console.log("Inserting Bids");
    await Bids.query().insert(
        bids.map((bid: Bid) => ({
            id: bid.id.toString(),
            listing_id: bid.listingId.toString(),
            bidder: bid.bidder,
            amount: bid.amount.toString(),
            timestamp: bid.timestamp.toString(),
        }))
    ).onConflict().ignore()
};

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
