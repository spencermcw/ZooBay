import { NextFunction, Request, Response } from 'express';
import contracts from "../ethereum/contracts";
import { ethers } from "ethers";
import { Asset } from '../types';
import { AssetContract } from "../ethereum/contracts/types";

export default async (req: Request, res: Response, next: NextFunction) => {
    const { account } = req.params;
    const assets: Asset[] = [];

    const assetsForContract = async (contract: AssetContract) => {
        try {
            const balance = await contract.contract.balanceOf(account)
            const ids: ethers.BigNumber[] = await Promise.all(
                Array.from({length: Number(balance)}, async (v, i) => contract.contract.tokenOfOwnerByIndex(account, i))
            )
            ids.sort((a, b) => a.gt(b) ? 1 : -1)
            const formattedAssets = await Promise.all<Asset>(ids.map(async v => {
                return {
                    id: v.toString(),
                    contract: contract.address,
                    metadata: (await contract.generateMetaData(v.toString()))
                }
            }))
            assets.push(...formattedAssets);
        } catch (e) {
            console.log('Error Handled', e);
        }
    }

    try {
        await assetsForContract(contracts.BaseEgg);
        await assetsForContract(contracts.BaseAnimal);
        await assetsForContract(contracts.HybridEgg);
        await assetsForContract(contracts.HybridAnimal);
        await assetsForContract(contracts.OneOfOne);
    } catch(e) {
        console.error(e);
        return res.sendStatus(500);
    }

    return res.json(assets).status(200);
}
