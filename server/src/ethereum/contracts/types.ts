import { ethers } from "ethers";

export interface AssetMetadata {
    type: string;
    image: string;
    name: string;
    oneOfOne?: boolean;
    cooldown?: string;
    breeds?: number;
    parents?: string[];
}

export interface AssetContract {
    address: string;
    contract: ethers.Contract;
    generateMetaData: (id: string) => Promise<AssetMetadata>;
}
