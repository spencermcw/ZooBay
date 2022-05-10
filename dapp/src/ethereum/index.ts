import {
    ethers
} from 'ethers'

declare global {
    interface Window {
        ethereum: any
    }
}

// window.ethereum => MetaMask
export const provider = window.ethereum ? new ethers.providers.Web3Provider(window.ethereum, 'any') : null;
