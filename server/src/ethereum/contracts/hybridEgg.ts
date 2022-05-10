import { ethers } from 'ethers'
import abi from './ABIs/HybridEgg'
import { provider } from '..'
import type { AssetMetadata, AssetContract } from './types'

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

export default {
    contract,
    address,
    generateMetaData,
} as AssetContract;
