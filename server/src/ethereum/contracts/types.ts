import { ethers } from "ethers";
import { Asset } from "../../types";

export interface AssetMetadata {
    type: string;
    image: string;
    name: string;
    claimable?: boolean;
    cooldown?: string;
    breeds?: number;
    parents?: string[];
}

export interface AssetContract {
    address: string;
    contract: ethers.Contract;
    generateMetaData: (id: string) => Promise<AssetMetadata>;
    assetsByOwner: (address: string) => Promise<Asset[]>;
}
