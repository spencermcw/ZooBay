import { ethers } from 'ethers'
import abi from './ABIs/EasterEgg'
import { provider } from '..'

export default new ethers.Contract(
    String(import.meta.env.VITE_EEGG_ADDRESS),
    abi,
    provider as ethers.providers.Provider
)
