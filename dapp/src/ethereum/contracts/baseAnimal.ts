import { ethers } from 'ethers'
import abi from './ABIs/BaseAnimal'
import { provider } from '..'

export default new ethers.Contract(
    String(import.meta.env.VITE_ANML_ADDRESS),
    abi,
    provider as ethers.providers.Provider
)
