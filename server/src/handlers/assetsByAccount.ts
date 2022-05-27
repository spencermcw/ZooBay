import { NextFunction, Request, Response } from 'express';
import contracts from "../ethereum/contracts";
import { ethers } from "ethers";
import { Asset } from '../types';

export default async (req: Request, res: Response, next: NextFunction) => {
    let { account } = req.params;
    account = ethers.utils.getAddress(account);

    const assets: Asset[] = [];

    try {
        assets.push(...(await contracts.EasterEgg.assetsByOwner!(account)));
        assets.push(...(await contracts.OneOfOne.assetsByOwner!(account)));
        assets.push(...(await contracts.BaseEgg.assetsByOwner!(account)));
        assets.push(...(await contracts.BaseAnimal.assetsByOwner!(account)));
        assets.push(...(await contracts.HybridEgg.assetsByOwner!(account)));
        assets.push(...(await contracts.HybridAnimal.assetsByOwner!(account)));
    } catch(e) {
        console.error(e);
        return res.sendStatus(500);
    }

    return res.json(assets).status(200);
}
