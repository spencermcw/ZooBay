import { NextFunction, Request, Response } from 'express';
import Assets from '../knex/models/Assets';

export default (req: Request, res: Response, next: NextFunction) => {
    Assets.query()
        .select()
        // .withGraphFetched('listings')
        .then(assets => res.send(assets))
        .catch((e) => {
            console.log(e)
            res.sendStatus(500)
        })
}
