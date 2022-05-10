import { ethers } from 'ethers'
import abi from './ABIs/AuctionHouse'
import { provider } from '..'

const address = process.env.AUCTION_HOUSE_ADDRESS as string;
const contract = new ethers.Contract(address, abi, provider);

export default contract;
