import { ethers } from 'ethers'
import abi from './ABIs/HybridEgg'
import { provider } from '..'
import type { AssetMetadata, AssetContract } from './types'
import type { Asset } from '../../types'

const address = process.env.HEGG_ADDRESS as string;
const contract = new ethers.Contract(address, abi, provider)

import baseAnimal from './baseAnimal';
import axios from 'axios';

const generateMetaData = async (id: string): Promise<AssetMetadata> => {
    try {
        const parents = await Promise.all<string>([
            (await axios.get(await baseAnimal.contract.tokenURI(await contract.parents1(id)))).data.name,
            (await axios.get(await baseAnimal.contract.tokenURI(await contract.parents2(id)))).data.name,
        ]);

        const metadata: AssetMetadata = {
            type: 'Hybrid Egg',
            name: 'Hybrid Egg',
            image: `${process.env.ZOO_BAY_URL}/images/HybridEgg.gif`,
            parents,
        }
        return metadata;
    }
    catch (e) {
        console.log('Failed to fetch metadata for Hybrid Egg:', id);
        return {
            type: 'Hybrid Egg',
            name: 'Hybrid Egg',
            image: `${process.env.ZOO_BAY_URL}/images/HybridEgg.gif`,
            // image: 'https://media.cryptozoo.co/eggs/photos/GoldenEgg.mp4'
        }
    }
}


const assetsByOwner = async (_address: string): Promise<Asset[]> => {
    try {
        _address = ethers.utils.getAddress(_address);
        const balance = await contract.balanceOf(_address)
        const ids: ethers.BigNumber[] = await Promise.all(
            Array.from({length: Number(balance)}, async (v, i) => contract.tokenOfOwnerByIndex(_address, i))
        )
        ids.sort((a, b) => a.gt(b) ? 1 : -1)
        const formattedAssets = await Promise.all<Asset>(ids.map(async v => {
            return {
                id: v.toString(),
                contract: address,
                metadata: (await generateMetaData(v.toString()))
            }
        }))
        return formattedAssets;
    } catch (e) {
        console.log('Error Handled', e);
        return [];
    }
}


export default {
    contract,
    address,
    generateMetaData,
    assetsByOwner,
} as AssetContract;
