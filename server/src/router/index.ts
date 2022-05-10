import { Router } from "express";

import handlers from "../handlers";
// import { sign } from '../auth/jwt';

const router = Router();

router.get('/ping', (req, res) => {
    res.send(req.ip).status(200);
});

// router.post('/api/sign', sign);

// router.get('/bids', handlers.allBids);

// router.get('/assets', handlers.allAssets);

router.get('/assets/:account', handlers.assetsByAccount);

router.get('/listings', handlers.allListings);

router.get('/listings/account/:account', handlers.listingsByAccount);

router.get('/listings/search', handlers.listingsQuery);

export default router;
