import { ethers } from 'ethers'
import abi from './ABIs/HybridEgg'
import { provider } from '..'

export default new ethers.Contract(
    String(import.meta.env.VITE_HEGG_ADDRESS),
    abi,
    provider as ethers.providers.Provider
)
