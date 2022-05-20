import { NextFunction, Request, Response } from 'express';
import contracts from "../ethereum/contracts";
import { ethers } from "ethers";
import { Asset } from '../types';

export default async (req: Request, res: Response, next: NextFunction) => {
    let { account } = req.params;
    account = ethers.utils.getAddress(account);

    const assets: Asset[] = [];


    // const assetsForContract = async (contract: AssetContract) => {
    //     try {
    //         const balance = await contract.contract.balanceOf(account)
    //         const ids: ethers.BigNumber[] = await Promise.all(
    //             Array.from({length: Number(balance)}, async (v, i) => contract.contract.tokenOfOwnerByIndex(account, i))
    //         )
    //         ids.sort((a, b) => a.gt(b) ? 1 : -1)
    //         const formattedAssets = await Promise.all<Asset>(ids.map(async v => {
    //             return {
    //                 id: v.toString(),
    //                 contract: contract.address,
    //                 metadata: (await contract.generateMetaData(v.toString()))
    //             }
    //         }))
    //         assets.push(...formattedAssets);
    //     } catch (e) {
    //         console.log('Error Handled', e);
    //     }
    // }

    try {
        assets.push(...(await contracts.EasterEgg.assetsByOwner!(account)));
        assets.push(...(await contracts.BaseEgg.assetsByOwner!(account)));
        assets.push(...(await contracts.BaseAnimal.assetsByOwner!(account)));
        assets.push(...(await contracts.HybridEgg.assetsByOwner!(account)));
        assets.push(...(await contracts.HybridAnimal.assetsByOwner!(account)));
        // assets.push(...(await contracts.OneOfOne.assetsByOwner!(account)));
    } catch(e) {
        console.error(e);
        return res.sendStatus(500);
    }

    return res.json(assets).status(200);
}
