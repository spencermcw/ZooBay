import { NextFunction, Request, Response } from 'express';
import Bids from '../knex/models/Bids';
import Listings from '../knex/models/Listings';
import { Bid } from '../types';

export default async (req: Request, res: Response, next: NextFunction) => {
    const { account } = req.params;
    Bids.query()
        .select('listingId')
        .where({ bidder: account })
        .then((bids: any) => bids.map((bid: Bid) => bid.listingId))
        .then(listingIds => Listings.query()
            .select()
            .where({ 'creator': account })
            .orWhereIn('id', listingIds)
            .orderBy('expiresAt', 'desc')
            .withGraphFetched('[assets, bids]')
            .modifyGraph('bids', 'ordered')
        )
        .then(listings => res.json(listings))
        .catch((e) => {
            console.log(e)
            res.sendStatus(500)
        })
  
}
