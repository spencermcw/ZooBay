import { ethers } from 'ethers';
import axios from 'axios'

import type { AssetMetadata, AssetContract } from './types';
import abi from './ABIs/EasterEgg';
import { provider } from '..';
import { Asset } from '../../types';

const address = process.env.EEGG_ADDRESS as string;
const contract = new ethers.Contract(address, abi, provider)

const generateMetaData = async (id: string): Promise<AssetMetadata> => {
    try {
        const tokenURI = await contract.tokenURI(id)
        const { data } = await axios.get(tokenURI)

        const metadata: AssetMetadata = {
            type: 'Easter Egg',
            name: data.name,
            oneOfOne: true,
            ...data
        }
        return metadata
    }
    catch (e) {
        console.log('Failed to fetch metadata for EEGG');
        return {
            type: 'Easter Egg',
            name: 'EEGG 404',
            image: 'https://via.placeholder.com/15x30',
            oneOfOne: true,
        };
    }
}

const assetsByOwner = async(address: string): Promise<Asset[]> => {
    try {
        const balance = ethers.BigNumber.from(await contract.balanceOf(ethers.utils.getAddress(address)));
        if (balance.eq("0")) {
            return [];
        }
        const asset: Asset = {
            id: "1",
            contract: ethers.utils.getAddress(address),
            metadata: {},
        }
        asset.metadata = await generateMetaData("0");
        return [asset];
    } catch (e) {
        console.error(e);
        return [];
    }
}

export default {
    contract,
    address,
    generateMetaData,
    assetsByOwner,
} as AssetContract;
