import { NextFunction, Request, Response } from 'express';
import Assets from "../knex/models/Assets";
import Listings from "../knex/models/Listings";
import { OrderByDirection, ref } from "objection";
import dayjs from "dayjs";

export default async (req: Request, res: Response, next: NextFunction) => {
    const page: number = req.query.page ? Number(req.query.page) : 0;
    const listingFilters: string[] | null = req.query.listings as string[] || null;
    const searchTerms: string[] | null = req.query.searchTerms as string[] || null;
    const assetContract: string | null = req.query.assetContract as string || null;
    const assetField_name: string[] | null = req.query.assetField_name as string[] || null;
    const assetField_rarity: string[] | null = req.query.assetField_rarity as string[] || null;
    const assetField_breeds: string[] | null = req.query.assetField_breeds as string[] || null;
    const orderBy: string | null = req.query.orderBy as string || "createdAt";
    const orderDirection: OrderByDirection = req.query.orderDirection as OrderByDirection || 'desc';

    const assets = Assets.query()
        .select()
        .modify(builder => {
            // Search Term (name)
            if (searchTerms !== null) {
                searchTerms.forEach(term => {
                    builder.orWhereRaw(`LOWER (metadata ->> 'name') LIKE LOWER ('%${term}%')`)
                });
            }
            // Contract
            if (assetContract !== null)
                builder.where('contract', assetContract)
            // Name
            if (assetField_name !== null)
                builder.whereIn(ref('metadata:name').castText(), assetField_name)
            // Rarity
            if (assetField_rarity !== null)
                builder.whereIn(ref('metadata:rarity').castText(), assetField_rarity)
            // Breed Count
            if (assetField_breeds !== null)
                builder.whereIn(ref('metadata:breeds').castText(), assetField_breeds)
        })

    Assets.relatedQuery('listings')
        .for(assets)
        .select('listings.*',
            Listings.relatedQuery('bids')
                .max('amount')
                .as('highBid'),
            Listings.relatedQuery('assets')
                .count('*')
                .as('numAssets')
        )
        .distinct('id')
        .page(page, 24)
        .withGraphFetched('[assets, bids]')
        .modifyGraph('bids', 'ordered')
        // Listing Filters
        .modify(builder => {
            if (listingFilters === null || listingFilters.length === 0) {
                builder.whereRaw('expires_at > ?', [dayjs().unix()]) // Hide Ended by default
                return;
            }
            // Signles
            if (listingFilters.includes('Singles')) {
                builder.whereRaw('(select count(*) from listings_assets where listing_id = listings.id) = 1')
            }
            // Bundles
            if (listingFilters.includes('Bundles')) {
                builder.whereRaw('(select count(*) from listings_assets where listing_id = listings.id) > 1')
            }
            // Buy Now
            if (listingFilters.includes('Buy Now')) {
                builder.where('price', '>', '0');
            }
            // Has Bids
            if (listingFilters.includes('Has Bids')) {
                builder.whereExists(builder => {
                    builder.table('bids')
                        .select('*')
                        .whereRaw('listings.id = bids.listing_id')
                })
            }
            // No Bids
            if (listingFilters.includes('No Bids')) {
                builder.whereNotExists(builder => {
                    builder.table('bids')
                        .select('*')
                        .whereRaw('listings.id = bids.listing_id')
                })
            }
            // Ended
            if (listingFilters.includes('Ended')) {
                builder.whereRaw('expires_at <= ?', [dayjs().unix()])
            } else {
                builder.whereRaw('expires_at > ?', [dayjs().unix()])
            }
        })
        // Sorting
        .modify(builder => {
            // Created At
            const orderByValues = ['createdAt', 'expiresAt', 'price', 'highBid', 'numAssets'];
            if (orderBy !== null && orderByValues.includes(orderBy)) {
                builder.orderBy(orderBy, orderDirection);
            }
        })
        .then(_results => {
            res.json(_results)
        })
        .catch((e) => {
            console.log(e)
            res.sendStatus(500)
        })
}
