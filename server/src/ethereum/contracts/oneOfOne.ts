import { ethers } from 'ethers';
import axios from 'axios'

import type { AssetMetadata, AssetContract } from './types';
import abi from './ABIs/OOO';
import { provider } from '..';

const address = process.env.OOO_ADDRESS as string;
const contract = new ethers.Contract(address, abi, provider)

const generateMetaData = async (id: string): Promise<AssetMetadata> => {
    try {
        const tokenURI = await contract.tokenURI(id)
        const { data } = await axios.get(tokenURI)

        const meatadata: AssetMetadata = {
            type: 'One of One',
            name: data.name,
            oneOfOne: true,
            ...data
        }
        return meatadata
    }
    catch (e) {
        console.log('Failed to fetch metadata for OOO:', id);
        return {
            type: 'One of One',
            name: 'One of One 404',
            image: 'https://via.placeholder.com/550x1000',
            oneOfOne: true,
        };
    }
}

export default {
    contract,
    address,
    generateMetaData,
} as AssetContract;
