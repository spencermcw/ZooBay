export const parseIPFS = (address: string): string => {
    const regexpat = /ipfs:\/\/([^\/]*)\/(.*)$/;
    const match = address.match(regexpat);
    return match === null ?
        '' :
        `https://${match[1]}.ipfs.dweb.link/${match[2]}`
}

export default {
    parseIPFS
}
