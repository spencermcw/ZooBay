import { ethers } from 'ethers';
import abi from './ABIs/HybridAnimal';
import { provider } from '..';
import type { AssetMetadata, AssetContract } from './types';
import axios from 'axios'
import type { Asset } from '../../types'

import oneOfOne from './oneOfOne';

const address = ethers.utils.getAddress(process.env.HANML_ADDRESS as string);
const contract = new ethers.Contract(address, abi, provider)

const generateMetaData = async (id: string): Promise<AssetMetadata> => {
    let claimable = false;
    try {
        const isClaimed = await oneOfOne.contract.isClaimed(address, id);
        claimable = !isClaimed;
    } catch (e) {
        claimable = false;
    }

    try {
        const tokenURI = await contract.tokenURI(id)
        const { data } = await axios.get(tokenURI)
        const metadata: AssetMetadata = {
            type: 'Hybrid Animal',
            claimable,
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
            claimable,
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
