import { ethers } from 'ethers'
import abi from './ABIs/BaseEgg'
import { provider } from '..'
import type { AssetMetadata, AssetContract } from './types'
import type { Asset } from '../../types'

const address = process.env.EGG_ADDRESS as string;
const contract = new ethers.Contract(address, abi, provider)

const generateMetaData = async (id: string): Promise<AssetMetadata> => {
    return {
        type: 'Base Egg',
        name: 'Base Egg',
        image: `${process.env.ZOO_BAY_URL}/images/BaseEgg.gif`,
        // image: 'https://gateway.pinata.cloud/ipfs/QmRtPL5LiDdu7wUoUYPhe3CjfsU9xMHxAqZtJFs73Bmmdn',
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
