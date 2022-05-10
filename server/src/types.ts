export interface Listing {
    id: string;
    creator: string;
    createdAt: string;
    expiresAt: string;
    price: string;
    minBid: string;
    creatorClaimed: boolean;
    bidderClaimed: boolean;
}

export interface Bid {
    id: string;
    bidder: string;
    listingId: string;
    amount: string;
    timestamp: string;
}

export interface Asset {
    id: string;
    contract: string;
    metadata: object;
}

export interface Field {
    selected: Set<any>;
    values: string[];
}


