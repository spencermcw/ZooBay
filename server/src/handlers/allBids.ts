import { NextFunction, Request, Response } from 'express';
import Bids from '../knex/models/Bids';

export default (req: Request, res: Response, next: NextFunction) => {
    Bids.query()
        .select()
        .then(bids => res.send(bids))
        .catch((e) => {
            console.log(e)
            res.sendStatus(500)
        })
}
