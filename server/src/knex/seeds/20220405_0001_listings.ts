import { Knex } from "knex";
import contracts from "../../ethereum/contracts";
import type { Bid, Asset, Listing } from "../../types";

export async function seed(knex: Knex): Promise<void> {
    await knex<Bid>("bids").del();
    await knex<Asset>("assets").del();
    await knex<Listing>("listings").del();

    const numListings = await contracts.AuctionHouse.nextListingId()
    const listings = await Promise.all<Listing>(
        Array.from({ length: Number(numListings) }, (v, i) => contracts.AuctionHouse.listings(i)),
    )

    if (listings.length === 0)
        return;

    await knex("listings").insert(
        listings.map((listing: Listing) => ({
            id: listing.id.toString(),
            created_at: listing.createdAt.toString(),
            creator: listing.creator.toString(),
            expires_at: listing.expiresAt.toString(),
            price: listing.price.toString(),
            min_bid: listing.minBid.toString(),
            creator_claimed: listing.creatorClaimed,
            bidder_claimed: listing.bidderClaimed,
        }))
    ).onConflict().ignore()

};
