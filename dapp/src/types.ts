export interface Bid {
    id: string;
    bidder: string;
    listingId: string;
    amount: string;
    timestamp: string;
}

export interface AssetMetadata {
    image: string;
    type: string;
    name: string;

    claimable?: boolean;

    // Base Animal
    breeds?: string;
    dailyYield?: number;
    dropVersion?: number;
    external_url?: string;
    probability?: string;
    rarity?: string;
    tokenId?: number;
    parents?: string[];
    cooldown?: string;
}

export interface Asset {
    id: string;
    contract: string;
    metadata: AssetMetadata;
    claimable?: boolean;
}

export interface AssetCollection {
    [contract: string]: {
        contract: string;
        title: string;
        tokens: Asset[];
    }
}

export interface Listing {
    id: string;
    creator: string;
    createdAt: string;
    expiresAt: string;
    expired: boolean;
    buyNowOnly: boolean;
    price: string;
    minBid: string;
    creatorClaimed: boolean;
    bidderClaimed: boolean;
    assets: Asset[];
    bids: Bid[];
}

export interface Approval {
    title: string;
    contract: string;
    approval: boolean;
}

export interface State {
    burn: string;
    zooBalance: string;
    allowance: string;
    accounts: string[];
    txnPending: boolean;
    approvals: {
        [contract: string]: Approval;
    },
    userAssets: Asset[];
    listings: Listing[];
    listingsTotal: number;
}

export interface Field {
    title: string;
    selected: Set<string>;
    values: any[];
}

export interface AssetFilters {
    [contract: string]: {
        address: string;
        title: string;
        fieldNames: string[];
        fields?: {
            [fieldName: string]: Field;
        }
    }
}

