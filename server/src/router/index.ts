import { Router } from "express";

import handlers from "../handlers";
// import { sign } from '../auth/jwt';

const router = Router();

router.get('/ping', (req, res) => {
    res.send(req.ip).status(200);
});

// router.post('/api/sign', sign);

// router.get('/bids', handlers.allBids);

router.get('/assets', handlers.allAssets);

router.get('/assets/:account', handlers.assetsByAccount);

router.get('/listings', handlers.allListings);

router.get('/listings/account/:account', handlers.listingsByAccount);

router.get('/listings/search', handlers.listingsQuery);

// TODO: Remove Production
router.get('/eegg_metadata', (req, res, next) => {
    res.json({
        "name": "Easter Egg 2022",
        "description": "CryptoZoo Easter Egg Contest 2022 Winner", 
        "external_url": "https://CryptoZoo.co", 
        "image": "https://cdn.discordapp.com/attachments/948678454176514108/976974194707402762/EasterEgg_Design.jpeg",
        "attributes": [], 
    })
});

export default router;
