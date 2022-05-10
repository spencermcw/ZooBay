import { ethers } from 'ethers'
import abi from './ABIs/HybridAnimal'
import { provider } from '..'

export default new ethers.Contract(
    String(import.meta.env.VITE_HANML_ADDRESS),
    abi,
    provider as ethers.providers.Provider
)
