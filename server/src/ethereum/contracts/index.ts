import { Contract } from 'ethers'
import { AssetContract } from './types'
import { ethers } from 'ethers'

// Top Contracts
import zoo from './zoo'
export const Zoo = zoo
import auctionHouse from './auctionHouse'
export const AuctionHouse = auctionHouse

// CZ Assets General Assets
import baseEgg from './baseEgg'
export const BaseEgg = baseEgg
import baseAnimal from './baseAnimal'
export const BaseAnimal = baseAnimal
import hybridEgg from './hybridEgg'
export const HybridEgg = hybridEgg
import hybridAnimal from './hybridAnimal'
export const HybridAnimal = hybridAnimal

// One-Offs
import oneOfOne from './oneOfOne'
export const OneOfOne = oneOfOne
import easterEgg from './easterEgg'
export const EasterEgg = easterEgg


const getAddress = ethers.utils.getAddress

export const ContractByAddress: {
    [contract: string]: Contract 
} = {
    [getAddress(process.env.ZOO_ADDRESS as string)]: Zoo,
    [getAddress(process.env.AUCTION_HOUSE_ADDRESS as string)]: AuctionHouse,
}

export const AssetContractsByAddress: {
    [contract: string]: AssetContract
} = {
    [getAddress(process.env.EGG_ADDRESS as string)]: BaseEgg,
    [getAddress(process.env.ANML_ADDRESS as string)]: BaseAnimal,
    [getAddress(process.env.HEGG_ADDRESS as string)]: HybridEgg,
    [getAddress(process.env.HANML_ADDRESS as string)]: HybridAnimal,
    [getAddress(process.env.OOO_ADDRESS as string)]: OneOfOne,
    [getAddress(process.env.EEGG_ADDRESS as string)]: EasterEgg,
}


export default {
    Zoo,
    AuctionHouse,
    BaseEgg,
    BaseAnimal,
    HybridEgg,
    HybridAnimal,
    OneOfOne,
    EasterEgg,
}
