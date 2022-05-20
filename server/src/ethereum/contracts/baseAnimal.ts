import { ethers } from 'ethers';
import axios from 'axios'

import type { Asset } from '../../types';
import type { AssetMetadata, AssetContract } from './types';
import abi from './ABIs/BaseAnimal';
import { provider } from '..';

import HybridEgg from './hybridEgg';

import oooIds from '../../1of1s/base_1of1';

const address = process.env.ANML_ADDRESS as string;
const contract = new ethers.Contract(address, abi, provider)

const generateMetaData = async (id: string): Promise<AssetMetadata> => {
    try {
        const tokenURI = await contract.tokenURI(id)
        const { data } = await axios.get(tokenURI)
        const breeds = await HybridEgg.contract.breeds(id);
        const cooldown = await HybridEgg.contract.nextBreedTimes(id);

        const meatadata: AssetMetadata = {
            type: 'Base Animal',
            name: data.name,
            breeds: breeds,
            cooldown: cooldown.toString(),
            oneOfOne: oooIds.has(id),
            ...data
        }
        return meatadata
    }
    catch (e) {
        console.log('Failed to fetch metadata for Base Animal:', id);
        return {
            type: 'Base Animal',
            name: 'Base Animal',
            image: 'https://via.placeholder.com/550x1000',
            breeds: 0,
            oneOfOne: oooIds.has(id),
            cooldown: '0',
        };
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
