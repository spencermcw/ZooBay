import {
    ethers
} from 'ethers'

// This is required for knex migrations
import dotenv from 'dotenv'
dotenv.config({ path: '../.env' })

declare global {
    interface Window {
        ethereum: any
    }
}

const RPC_URL = process.env.RPC_URL;
const NETWORK = Number(process.env.NETWORK);

console.log(RPC_URL, NETWORK)

export const provider = new ethers.providers.JsonRpcProvider(RPC_URL, NETWORK);
