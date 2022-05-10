import { ethers } from "ethers"
import dayjs from "dayjs"

export const countdown = (time: string | null) => {
    const expiry = dayjs.unix(Number(time)).diff(dayjs(), "seconds")

    if (expiry <= 0) {
        return null
    }

    let adjExpiry = expiry

    const SPD = 60 * 60 * 24
    const days = Math.trunc(adjExpiry/SPD)
    adjExpiry = adjExpiry - days * SPD

    const SPH = 60 * 60
    const hours = Math.trunc(adjExpiry/SPH)
    adjExpiry = adjExpiry - hours * SPH

    const SPM = 60
    const mins = Math.trunc(adjExpiry/SPM)
    adjExpiry = adjExpiry - mins * SPM

    return`${days>0?days+'d':''} ${hours>0?hours+'h':''} ${mins>0?mins+'m':''} ${adjExpiry}s`
}

export const humanizeEther = (amount: string): string => {
    const val = ethers.utils.commify(ethers.utils.formatEther(amount))
    return val.slice(0, val.indexOf('.'));
}

export const tryParseEther = (ether: string): string => {
    try {
        return humanizeEther(ethers.utils.parseEther(ether).toString());
    } catch (e) {
        return 'Invalid';
    }
}

export const shortAddress = (address: string): string => {
    return address.slice(0, 5) + '...' + address.slice(-4, address.length);
}

export const sessionAccounts = () => {
    const accounts = window.localStorage.getItem('ACCOUNTS') || '[]';
    return JSON.parse(accounts);
}

