import { ethers } from 'ethers'
import abi from './ABIs/AuctionHouse'
import { provider } from '..'

export default new ethers.Contract(
    String(import.meta.env.VITE_AUCTION_HOUSE_ADDRESS),
    abi,
    provider as ethers.providers.Provider
)
