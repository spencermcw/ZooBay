import { Knex } from "knex";
import contracts from "../../ethereum/contracts";
import type { Bid } from "../../types";


export async function seed(knex: Knex): Promise<void> {
    await knex<Bid>("bids").del();

    const numBids = await contracts.AuctionHouse.nextBidId();
    const bids = await Promise.all<Bid>(
        Array.from({ length: Number(numBids) }, (v, i) => contracts.AuctionHouse.bids(i)),
    )

    if (bids.length === 0)
        return;

    await knex("bids").insert(
        bids.map((bid: Bid) => ({
            id: bid.id.toString(),
            listing_id: bid.listingId.toString(),
            bidder: bid.bidder,
            amount: bid.amount.toString(),
            timestamp: bid.timestamp.toString(),
        }))
    ).onConflict().ignore()
};