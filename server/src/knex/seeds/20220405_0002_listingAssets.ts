import { Knex } from "knex";
import { ethers } from "ethers";
import contracts from "../../ethereum/contracts";
import { AssetContractsByAddress } from "../../ethereum/contracts";
import type { Listing } from "../../types";

const getAddress = ethers.utils.getAddress;

export async function seed(knex: Knex): Promise<void> {
    await knex<Listing>("listings_assets").del();
    await knex<Listing>("assets").del();

    const listings = await knex<Listing>("listings").select();

    if (listings.length === 0)
        return;

    for (let l = 0; l < listings.length; l++) {
        const listing = listings[l];
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

            await knex("assets").insert(assets).onConflict().ignore()

            await knex("listings_assets").insert(
                ids.map((id: ethers.BigNumber) => ({
                    listing_id: listing.id,
                    asset_id: id.toString(),
                    asset_contract: contract,
                }))
            ).onConflict().ignore()
        }
    }
};
