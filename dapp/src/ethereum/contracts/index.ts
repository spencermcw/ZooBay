import zoo from './zoo'
import auctionHouse from './auctionHouse'
import baseEgg from './baseEgg'
import baseAnimal from './baseAnimal'
import hybridEgg from './hybridEgg'
import hybridAnimal from './hybridAnimal'
import oneOfOne from './oneOfOne'
import easterEgg from './easterEgg'

export const Zoo = zoo
export const AuctionHouse = auctionHouse
export const BaseEgg = baseEgg
export const BaseAnimal = baseAnimal
export const HybridEgg = hybridEgg
export const HybridAnimal = hybridAnimal
export const OneOfOne = oneOfOne
export const EasterEgg = easterEgg

export const ContractByAddress = {
    [import.meta.env.VITE_ZOO_ADDRESS as string]: Zoo,
    [import.meta.env.VITE_AUCTION_HOUSE_ADDRESS as string]: AuctionHouse,
    [import.meta.env.VITE_EGG_ADDRESS as string]: BaseEgg,
    [import.meta.env.VITE_ANML_ADDRESS as string]: BaseAnimal,
    [import.meta.env.VITE_HEGG_ADDRESS as string]: HybridEgg,
    [import.meta.env.VITE_HANML_ADDRESS as string]: HybridAnimal,
    [import.meta.env.VITE_OOO_ADDRESS as string]: OneOfOne,
    [import.meta.env.VITE_EEGG_ADDRESS as string]: EasterEgg,
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
