import { ethers } from 'ethers';
import abi from './ABIs/HybridAnimal';
import { provider } from '..';
import type { AssetMetadata, AssetContract } from './types';
import axios from 'axios'

import oooIds from '../../1of1s/hybrid_1of1';

const address = ethers.utils.getAddress(process.env.HANML_ADDRESS as string);
const contract = new ethers.Contract(address, abi, provider)

const generateMetaData = async (id: string): Promise<AssetMetadata> => {
    try {
        const tokenURI = await contract.tokenURI(id)
        const { data } = await axios.get(tokenURI)
        const metadata: AssetMetadata = {
            type: 'Hybrid Animal',
            oneOfOne: oooIds.has(id),
            ...data
        }
        return metadata;
    }
    catch (e) {
        console.log('Failed to fetch metadata for Hybrid Animal:', id);
        return {
            type: 'Hybrid Animal',
            name: 'Hybrid Animal',
            image: 'https://via.placeholder.com/550x1000',
            oneOfOne: oooIds.has(id),
        };
    }

}

export default {
    contract,
    address,
    generateMetaData,
} as AssetContract;
