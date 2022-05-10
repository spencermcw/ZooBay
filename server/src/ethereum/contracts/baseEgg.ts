import { ethers } from 'ethers'
import abi from './ABIs/BaseEgg'
import { provider } from '..'
import type { AssetMetadata, AssetContract } from './types'

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

export default {
    contract,
    address,
    generateMetaData,
} as AssetContract;
