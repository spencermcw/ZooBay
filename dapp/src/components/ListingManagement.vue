<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import ConfettiGenerator from 'confetti-js';

import { key, ACTIONS, GETTERS, MUTATIONS } from '../store';
import { humanizeEther, shortAddress } from '../lib';
import { Listing } from '../types';

import AssetExplorerVue from '../layouts/AssetExplorer.vue';
import SpinnerVue from './Spinner.vue';
import CountdownVue from './Countdown.vue';

const router = useRouter()
const store = useStore(key)

const props = defineProps<{
    listings: Listing[]
}>()

const account = computed(() => store.getters[GETTERS.ACTIVE_ACCOUNT_ADDRESS])
const txnPending = computed(() => store.state.txnPending)
const confettiCanvas = ref<HTMLElement|null>(null);
const confetti = ref<any|null>(null);

const uniqueBidders = (listing: Listing) => {
    const bidders = new Set<string>();
    listing.bids.forEach(bid => bidders.add(bid.bidder));
    return bidders.size;
};

const canClaimAssets = (listing: Listing): boolean => {
    return (
        (listing.bids.length == 0 && !listing.creatorClaimed) ||
        ((listing.bids.length > 0) && (listing.bids[0].bidder === account.value) && !listing.bidderClaimed)
    );
}

const canClaimCurrency = (listing: Listing): boolean => {
    return (
        (listing.creator === account.value) && !listing.creatorClaimed && listing.bids.length > 0
    );
}

const claimableString = (listing: Listing): string => {
    return [{
        str: 'Assets',
        valid: canClaimAssets(listing)
    }, {
        str: 'ZOO',
        valid: canClaimCurrency(listing)
    }]
        .filter(v => v.valid)
        .map(v => v.str)
        .join(' & ')
}

const claimReady = (listing: Listing): boolean => {
    return (
        listing.expired && (
            canClaimAssets(listing) ||
            canClaimCurrency(listing)
        )
    )
}

const cancelReady = (listing: Listing): boolean => {
    return (
        !listing.expired &&
        listing.bids.length === 0
    )
}

const claim = (listingId: string) => {
    confetti.value.clear();
    store.dispatch(ACTIONS.CLAIM_LISTING, listingId)
        .then(() => {
            store.commit(MUTATIONS.CLAIM_LISTING, listingId)
            confetti.value.render();
        })
        .catch(e => {
            console.error(e);
            confetti.value.clear();
        })
}

const cancel = (listingId: string) => {
    store.dispatch(ACTIONS.CANCEL_LISTING, listingId)
        .then(() => router.go(0))
        .catch(console.error)
}

onMounted(() => {
    const confettiSettings = {
        target: confettiCanvas.value,
        props: ['square', 'circle'],
        start_from_edge: true,
        max: 220,
        respawn: false,
        colors: [
            [240, 187, 51],
            [228, 159, 31],
            [170, 111, 0],
        ]
    };
    confetti.value = new ConfettiGenerator(confettiSettings);
})
</script>


<template>
<div class="manage-listings mb-5">
    <canvas id="confetti-canvas" ref="confettiCanvas"></canvas>
    <div class="container">
        <div class="row row-cols-1 row-cols-xl-2 g-4">
            <div class="col" v-for="listing in listings" :key="listing.id">
                <div class="listing">
                    <div class="row g-3">
                        <div class="col-12 col-md-5">
                            <AssetExplorerVue :assets="listing.assets" :show-accordion="false" :show-title="false"></AssetExplorerVue>
                        </div>
                        <div class="col-12 col-md-7">
                            <div class="d-flex flex-column justify-content-between h-100">
                                <div>
                                    <p class="fs-2">Listing {{ listing.id }}</p>
                                    <p v-if="!listing.expired">
                                        <i class="bi bi-clock me-1"></i>:
                                        <CountdownVue :expiration="listing.expiresAt" v-if="!listing.buyNowOnly"></CountdownVue>
                                        <i class="bi bi-infinity" v-if="listing.buyNowOnly"></i>
                                    </p>
                                    <p><strong>Creator: </strong>
                                        <span class="gold" v-if="listing.creator === account">You</span>
                                        <span v-else>
                                            {{  shortAddress(listing.creator)}}
                                        </span>
                                    </p>
                                    <p><strong># Assets Included:</strong> {{ listing.assets.length }}</p>
                                    <p><strong># Bids:</strong> {{ listing.bids.length }}</p>
                                    <p><strong># Bidders:</strong> {{ uniqueBidders(listing) }}</p>
                                    <p v-if="listing.bids.length">
                                        <strong>{{ listing.expired ? 'Winning' : 'Current' }} Bid: </strong>
                                        <span :class="{ 'gold': (listing.bids[0].bidder === account) }">
                                            {{ humanizeEther(listing.bids[0].amount) }}
                                        </span>
                                        $ZOO
                                    </p>
                                    <p><strong>Minimum Bid:</strong> {{ humanizeEther(listing.minBid) }} $ZOO</p>
                                    <p><strong>Buy Now Price:</strong> {{ humanizeEther(listing.price) }} $ZOO</p>

                                    <div v-if="listing.expired">
                                        <div v-if="
                                            (listing.bids.length > 0 && listing.bids[0].bidder === account) ||
                                            (listing.bids.length === 0 && listing.creator === account)"
                                        >
                                            <p>
                                                <strong>Assets Claimed:</strong>
                                                <i
                                                    :class="['bi mx-1', listing.bidderClaimed ? 'bi-check-lg' : 'bi-x-lg' ]"></i>
                                            </p>
                                        </div>

                                        <div v-if="listing.creator === account && listing.bids.length > 0">
                                            <p>
                                                <strong>ZOO Claimed: </strong>
                                                <i
                                                    :class="['bi mx-1', listing.creatorClaimed ? 'bi-check-lg' : 'bi-x-lg' ]"></i>
                                            </p>
                                        </div>
                                    </div>

                                    <p v-if="(listing.bids.length > 0) && (listing.bids[0].bidder === account)" class="gold">
                                        <i class="bi bi-check-lg"></i>
                                        {{ listing.expired ? 'You Won!' : 'You are the highest bidder!' }}
                                    </p>

                                    <p v-if="
                                        (listing.bids.length > 0) &&
                                        (listing.bids[0].bidder !== account) &&
                                        (listing.bids.findIndex(bid => bid.bidder === account) !== -1)
                                    ">
                                        <span v-if="listing.expired" class="text-danger">
                                            <i class="bi bi-x-lg"></i>
                                            You Lost
                                        </span>

                                        <span v-else class="text-danger">
                                            <i class="bi bi-exclamation-diamond-fill"></i>
                                            You've been out-bid. Place a new bid now!
                                        </span>
                                    </p>

                                </div>

                                <div class="d-grid gap-2 my-2">
                                    <button class="btn btn-success" v-if="claimReady(listing)"
                                        @click="claim(listing.id)" :disabled="txnPending">
                                        <SpinnerVue :spinning="txnPending"></SpinnerVue>
                                        Claim
                                        <span>{{ claimableString(listing) }}</span>
                                    </button>
                                    <button class="btn btn-danger" v-if="cancelReady(listing)"
                                        @click="cancel(listing.id)" :disabled="txnPending">
                                        <SpinnerVue :spinning="txnPending"></SpinnerVue>
                                        Cancel Listing
                                    </button>
                                    <button class="btn cz-btn cz-btn--secondary"
                                        @click="router.push({ name: 'Listing', params: { id: listing.id } })">
                                        View Listing
                                    </button>
                                </div>


                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    </div>
</div>
</template>


<style lang="scss" scoped>
@import '../assets/style/abstracts/themes';

.listing {
    padding: 1rem;
    background-color: map-get($map: $custom-theme-colors, $key: "cz-dark2");
    border: 3px solid lighten(map-get($map: $custom-theme-colors, $key: "cz-dark2"), 20%);
    border-radius: 10px;
    height: 100%;
    // display: flex;

    p {
        margin-bottom: 0;
        word-break: break-all;
    }

    img {
        display: block;
        height: 30vh;
        max-width: 90%;
        margin: 0 auto;
        // margin-right: 2rem;
        object-fit: cover;
        border-radius: 5px;
    }
}

#confetti-canvas {
    position: fixed;
    width: 100vw;
    height: 100vh;
    top: 0;
    left: 0;
    z-index: 100;
    pointer-events: none;
}
</style>
