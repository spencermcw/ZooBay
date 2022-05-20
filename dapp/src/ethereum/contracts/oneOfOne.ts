import { ethers } from 'ethers'
import abi from './ABIs/OOO'
import { provider } from '..'

export default new ethers.Contract(
    String(import.meta.env.VITE_OOO_ADDRESS),
    abi,
    provider as ethers.providers.Provider
)
