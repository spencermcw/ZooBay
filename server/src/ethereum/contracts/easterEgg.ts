import { ethers } from 'ethers';
import axios from 'axios'

import type { AssetMetadata, AssetContract } from './types';
import abi from './ABIs/EasterEgg';
import { provider } from '..';
import { Asset } from '../../types';

const address = process.env.EEGG_ADDRESS as string;
const contract = new ethers.Contract(address, abi, provider)

// TODO: Lib this bis
const parseIPFS = (address: string): string => {
    const regexpat = /ipfs:\/\/([^\/]*)\/(.*)$/;
    const match = address.match(regexpat);
    return match === null ?
        '' :
        `https://${match[1]}.ipfs.dweb.link/${match[2]}`
}

const generateMetaData = async (id: string): Promise<AssetMetadata> => {
    try {
        const tokenURI = await contract.tokenURI(id)
        const { data } = await axios.get(parseIPFS(tokenURI))

        const metadata: AssetMetadata = {
            type: 'Easter Egg',
            name: data.name,
            ...data
        }
        metadata.image = parseIPFS(metadata.image);
        return metadata
    }
    catch (e) {
        console.log('Failed to fetch metadata for EEGG');
        return {
            type: 'Easter Egg',
            name: 'EEGG 404',
            image: 'https://via.placeholder.com/15x30',
        };
    }
}

const assetsByOwner = async(_address: string): Promise<Asset[]> => {
    try {
        const balance = ethers.BigNumber.from(await contract.balanceOf(ethers.utils.getAddress(_address)));
        if (balance.eq("0")) {
            return [];
        }
        const asset: Asset = {
            id: "0",
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
