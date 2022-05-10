import { NextFunction, Request, Response } from 'express';
import Listings from '../knex/models/Listings';

export default (req: Request, res: Response, next: NextFunction) => {
    Listings.query()
        .select()
        .where(req.query)
        .orderBy('id')
        .withGraphFetched('[assets, bids]')
        .modifyGraph('bids', 'ordered')
        .limit(50)
        .then(listings => res.json(listings))
        .catch((e) => {
            console.log(e)
            res.sendStatus(500)
        });
}
