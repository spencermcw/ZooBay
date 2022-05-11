import { Contract } from 'ethers'
import { AssetContract } from './types'
import { ethers } from 'ethers'

import zoo from './zoo'
import auctionHouse from './auctionHouse'

import baseEgg from './baseEgg'
import baseAnimal from './baseAnimal'
import hybridEgg from './hybridEgg'
import hybridAnimal from './hybridAnimal'

import oneOfOne from './oneOfOne'

export const Zoo = zoo
export const AuctionHouse = auctionHouse

export const BaseEgg = baseEgg
export const BaseAnimal = baseAnimal
export const HybridEgg = hybridEgg
export const HybridAnimal = hybridAnimal
export const OneOfOne = oneOfOne


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
}


export default {
    Zoo,
    AuctionHouse,
    BaseEgg,
    BaseAnimal,
    HybridEgg,
    HybridAnimal,
    OneOfOne,
}
