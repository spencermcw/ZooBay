import { ethers } from 'ethers';
import axios from 'axios'

import type { AssetMetadata, AssetContract } from './types';
import type { Asset } from '../../types'
import abi from './ABIs/OOO';
import { provider } from '..';

import { parseIPFS } from '../../lib';

const address = process.env.OOO_ADDRESS as string;
const contract = new ethers.Contract(address, abi, provider)

const generateMetaData = async (id: string): Promise<AssetMetadata> => {
    try {
        const tokenURI = await contract.tokenURI(id)
        const { data } = await axios.get(parseIPFS(tokenURI))

        const metadata: AssetMetadata = {
            type: 'One of One',
            name: data.name,
            claimable: false,
            ...data
        }
        metadata.image = parseIPFS(metadata.image);
        return metadata
    }
    catch (e) {
        console.log('Failed to fetch metadata for OOO:', id);
        return {
            type: 'One of One',
            name: 'One of One 404',
            image: 'https://via.placeholder.com/550x1000',
            claimable: false,
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
