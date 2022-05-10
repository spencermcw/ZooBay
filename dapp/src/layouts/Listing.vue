<script setup lang="ts">
import { ref, computed, onBeforeMount } from 'vue'
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import dayjs from 'dayjs';
import { ethers } from 'ethers';

import { GETTERS, ACTIONS, key } from '../store'
import { Listing } from '../types';
import { shortAddress, humanizeEther } from '../lib';

import AssetExplorerVue from './AssetExplorer.vue';
import BidVue from '../components/Bid.vue';
import CountdownVue from '../components/Countdown.vue';
import SpinnerVue from '../components/Spinner.vue';
import WalletVue from '../components/Wallet.vue';

const store = useStore(key);
const router = useRouter();

const loading = ref(true);

const account = computed(() => store.getters[GETTERS.ACTIVE_ACCOUNT_ADDRESS]);
const loggedIn = computed(() => store.getters[GETTERS.LOGGED_IN]);

const listing = computed(() => {
    const listingId = router.currentRoute.value.params.id
    return store.state.listings.find((listing: Listing) => listing.id === listingId)
});

const uniqueBidders = computed(() => {
    const bidders = new Set<string>();
    listing.value!.bids.forEach(bid => bidders.add(bid.bidder));
    return bidders.size;
});

const nextListing = computed(() => {
    if (!listing.value) {
        return undefined;
    }
    const index = store.state.listings.findIndex(l => l.id === listing.value!.id)
    const next = store.state.listings[index + 1];
    return next;
})

const prevListing = computed(() => {
    if (!listing.value) {
        return undefined;
    }
    const index = store.state.listings.findIndex(l => l.id === listing.value!.id)
    const prev = store.state.listings[index - 1];
    return prev;
})

const toNext = () => {
    const next = nextListing.value;
    if (next !== undefined)
        router.replace({ name: 'Listing', params: { id: next.id }})
}

const toPrev = () => {
    const prev = prevListing.value;
    if (prev !== undefined)
        router.replace({ name: 'Listing', params: { id: prev.id }})
}

onBeforeMount(async () => {
    const promises = []
    if (loggedIn.value) {
        promises.push(store.dispatch(ACTIONS.FETCH_ALLOWANCE));
    }
    if (!listing.value) {
        promises.push(
            store.dispatch(ACTIONS.FETCH_LISTINGS, { id: router.currentRoute.value.params.id })
        );
    }
    Promise.all(promises)
        .then(() => { loading.value = false })
        .catch(console.error);
})
</script>



<template>
<div class="container" v-if="loading">
    <h1>Loading Listing...</h1>
    <SpinnerVue></SpinnerVue>
</div>

<div class="container" v-if="!loading && !listing">
    <h1>No Listing Found...</h1>
</div>

<div class="container listing-container" v-if="!loading && listing">
    <div class="row">
        <div class="col-12 col-lg-5">
            <h1 class="d-flex gap-3 justify-content-between">
                <button class="btn cz-btn cz-btn--secondary px-3" @click="toPrev" :disabled="prevListing === undefined">
                    <i class="bi bi-chevron-left"></i>
                </button>
                Listing {{ router.currentRoute.value.params.id }}
                <button class="btn cz-btn cz-btn--secondary px-3" @click="toNext" :disabled="nextListing === undefined">
                    <i class="bi bi-chevron-right"></i>
                </button>
            </h1>
            <h2 v-if="!listing.expired">
                <i class="bi bi-clock me-3"></i>
                <CountdownVue :expiration="listing.expiresAt" v-if="!listing.buyNowOnly"></CountdownVue>
                <i class="bi bi-infinity" v-if="listing.buyNowOnly"></i>
            </h2>
            <h2 v-if="listing.expired">
                <span v-if="listing.bids.length < 1">Closed</span>
                <div v-if="listing.bids.length > 0">
                    Sold for<br>
                    <span class="gold wb">
                        {{ humanizeEther(listing.bids[0].amount) }}
                    </span>
                    $ZOO
                </div>
            </h2>
            <p>on {{ dayjs.unix(Number(listing.expiresAt)) }}</p>

            <div class="listing-details my-3">
                <div v-if="listing.assets.length < 2">
                    <p class="listing-details__type">{{ listing.assets[0].metadata.type }}</p>
                    <p class="listing-details__title">{{ listing.assets[0].metadata.type }} {{ listing.assets[0].id }}</p>
                </div>
                <div v-else>
                    <p class="listing-details__type">Bundle</p>
                    <p class="listing-details__title">{{ listing.assets.length }} CryptoZoo Assets</p>
                </div>
                <p v-if="listing.bids.length > 0">
                    <strong>Current Bid: </strong>
                    <span class="gold wb">
                        {{ humanizeEther(listing.bids[0].amount) }}
                    </span>
                    $ZOO
                </p>
                <p v-else>
                    <strong>Starting Bid: </strong>
                    <span class="gold wb">
                        {{ humanizeEther(listing.minBid) }}
                    </span>
                    $ZOO
                </p>
                <p v-if="ethers.BigNumber.from(listing.price).gt(0)">
                    <strong>Buy Now: </strong>
                    <span class="gold wb">
                        {{ humanizeEther(listing.price) }}
                    </span>
                    $ZOO
                </p>
                <p>
                    <strong>Seller: </strong>
                    <span class="gold" v-if="listing.creator === account">
                        You
                    </span>
                    <span v-else>
                        {{ shortAddress(listing.creator) }}
                    </span>
                </p>
                <p v-if="!listing.buyNowOnly"><strong># Bids:</strong> {{ listing.bids.length }}</p>
                <p v-if="!listing.buyNowOnly"><strong># Bidders:</strong> {{ uniqueBidders }}</p>
                <p><strong>Listed:</strong> {{ dayjs.unix(Number(listing.createdAt)) }}</p>
                <p v-if="!listing.expired"><strong>Ends:</strong>&nbsp;
                    <span v-if="!listing.buyNowOnly">{{ dayjs.unix(Number(listing.expiresAt)) }}</span>
                    <span v-if="listing.buyNowOnly"><i class="bi bi-infinity"></i></span>
                </p>
            </div>

            <div v-if="!loggedIn" class="d-flex flex-column text-center gap-2 my-3">
                Connect Wallet to start Bidding!
                <WalletVue></WalletVue>
            </div>

            <BidVue :listing="listing" v-if="loggedIn && !listing.expired" :key="listing.id"></BidVue>
            
            <div class="my-5">
                <p class="h3">History</p>
                <p v-if="listing.bids.length < 1">No bids yet - be the first!</p>
                <table class="bids-table" v-if="listing.bids.length > 0">
                    <thead>
                        <th>Bid</th>
                        <th>Bidder</th>
                        <th>Time</th>
                    </thead>
                    <tbody>
                        <tr v-for="bid in listing.bids" :class="{ 'white': bid.bidder === account }">
                            <td>{{ humanizeEther(bid.amount) }} $ZOO</td>
                            <td>
                                <a :href="'https://bscscan.com/token/0x7ffc1243232da3ac001994208e2002816b57c669?a=' + bid.bidder" target="_blank">
                                    {{ (bid.bidder === account) ? 'You' : shortAddress(bid.bidder) }}
                                </a>
                            </td>
                            <td>{{ dayjs.unix(Number(bid.timestamp)).format('D MMM @ HH:mm:ss ') }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <div class="col-12 col-lg-7">
            <AssetExplorerVue :assets="listing.assets" :cols="1" :key="listing.id"></AssetExplorerVue>
        </div>
    </div>

</div>
</template>



<style lang="scss" scoped>
@import '../assets/style/abstracts/themes';

.listing-container {
    min-height: 85vh;
    margin-bottom: 15vh;
}

.listing-details {
    & p {
        margin-bottom: 0;
    }

    &__type {
        color: darken(#fff, 40%);
    }

    &__title {
        font-size: 2rem;
        font-weight: bold;
        margin-bottom: 0;
    }
}


.bids-table {
    width: 100%;
    text-align: center;

    td:nth-child(1) {
        word-break: break-all;
    }

    tr {
        color: darken($color: #fff, $amount: 60%);
        &.white {
            color: white;
        }
        &:nth-child(1) {
            td {
                &:nth-child(1) {
                    color: map-get($map: $custom-theme-colors, $key: "cz-gold2");
                }
            }
        }
    }

    a {
        color: inherit;
    }
}
</style>
