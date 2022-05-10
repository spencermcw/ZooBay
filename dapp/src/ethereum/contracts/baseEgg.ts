import { ethers } from 'ethers'
import abi from './ABIs/BaseEgg'
import { provider } from '..'

export default new ethers.Contract(
    String(import.meta.env.VITE_EGG_ADDRESS),
    abi,
    provider as ethers.providers.Provider
)
