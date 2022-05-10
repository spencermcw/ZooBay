import { ethers } from 'ethers'
import abi from './ABIs/ZOO'
import { provider } from '..'

export default new ethers.Contract(
    String(import.meta.env.VITE_ZOO_ADDRESS),
    abi,
    provider as ethers.providers.Provider
)
