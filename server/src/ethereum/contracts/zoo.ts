import { ethers } from 'ethers'
import abi from './ABIs/ZOO'
import { provider } from '..'

const address = process.env.ZOO_ADDRESS as string;
const contract = new ethers.Contract(address, abi, provider)

export default contract;
