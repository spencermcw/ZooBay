<script setup lang="ts">
import { ref, computed, watchEffect } from 'vue'
import { useStore } from 'vuex';
import { useRoute, useRouter } from 'vue-router';
import { ethers } from 'ethers';

import { ACTIONS, key } from '../store';
import { Listing } from '../types';
import { humanizeEther } from '../lib';

import AssetExplorerVue from './AssetExplorer.vue';
import CountdownVue from '../components/Countdown.vue';
import SpinnerVue from '../components/Spinner.vue';
import FilterVue from '../components/Filter.vue';

const store = useStore(key);
const router = useRouter();
const route = useRoute();

const loading = ref(true);
const filtersRef = ref<HTMLElement | null>(null);
const showFiltersMobile = ref(false);

const listings = computed(() => store.state.listings);
const listingsFound = computed(() => store.state.listingsTotal);

const LISTINGS_PER_PAGE = 24;

const currentPage = computed(() => route.query.page ? Number(route.query.page) : 0);


const pagesFound = computed(() => (
    Math.floor(listingsFound.value / LISTINGS_PER_PAGE) +
    (listingsFound.value % LISTINGS_PER_PAGE === 0 ? 0 : 1)
));

const listingValue = (listing: Listing) => {
    return (listing.bids.length === 0 ?
        humanizeEther(listing.minBid) :
        humanizeEther(listing.bids[0].amount));
}

const toListing = (id: string) => {
    router.push({
        name: 'Listing',
        params: { id }
    });
}

const toPage = (page: number) => {
    if (page !== currentPage.value) {
        router.replace({ query: { ...route.query, page } })
    }
}

const hideFilters = () => {
    if (filtersRef.value) {
        filtersRef.value.classList.remove('show');
    }
}

const applyFilters = (filters: any) => {
    router.replace({ query: filters });
}

const toggleFilters = () => {
    if (filtersRef.value === null) {
        return;
    }
    if (filtersRef.value.classList.contains('show')) {
        filtersRef.value.classList.remove('show')
        showFiltersMobile.value = false;
    } else {
        filtersRef.value.classList.add('show');
        showFiltersMobile.value = true;
    }
}

watchEffect(() => {
    if (route.name === 'ViewListings') {
        loading.value = true;
        store.dispatch(ACTIONS.FIND_LISTINGS, route.query)
            .catch(console.error)
            .finally(() => { loading.value = false; });
    }
})
</script>



<template>
<div>
    <div class="container-fluid mb-5">
        <div class="listings">
            <div class="listings__filters container-fluid" ref="filtersRef">
                <FilterVue @apply="applyFilters" @close="hideFilters"></FilterVue>
            </div>

            <button class="cz-btn cz-btn--primary listings__filters-button" @click="toggleFilters" :disabled="loading">
                <span v-if="showFiltersMobile">
                    <i class="bi bi-search me-2"></i>
                    <SpinnerVue v-show="loading"></SpinnerVue>
                    <span v-show="!loading">
                        {{ listingsFound }}
                        Found
                    </span>
                </span>
                <span v-else>
                    <i class="bi bi-funnel"></i>
                    Filters
                </span>
            </button>

            <div class="container-fluid">
                <div class="row" v-if="loading">
                    <div v-if="loading">
                        <h1>Loading Listings...</h1>
                        <SpinnerVue></SpinnerVue>
                    </div>
                </div>

                <div v-else>

                    <div class="row">
                        <p class="h2" v-if="listings.length === 0">
                            No Listings Found... 😢
                        </p>
                    </div>

                    <div class="row" v-if="listings.length > 0">
                        <div class="col">
                            <p class="h3"><span class="gold">{{ listingsFound }}</span> Results</p>
                        </div>
                    </div>

                    <div class="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-4" v-if="listings.length > 0">
                        <div class="col" v-for="listing in listings" :key="listing.id">
                            <div class="listing">
                                <span :class="['listing__expiration', { 'expired': listing.expired }]">
                                    <span v-if="!listing.expired">
                                        <CountdownVue :expiration="listing.expiresAt" v-if="!listing.buyNowOnly">
                                            Ended
                                        </CountdownVue>
                                        <i class="bi bi-infinity" v-if="listing.buyNowOnly"></i>
                                    </span>
                                    <span v-if="listing.expired">
                                        {{ listing.bids.length > 0 ? 'Sold' : 'Cancelled' }}
                                    </span>
                                </span>

                                <AssetExplorerVue :assets="listing.assets" :show-title="false" :show-accordion="false"></AssetExplorerVue>

                                <div @click="toListing(listing.id)" class="pointer listing__details">
                                    <span class="listing__type">
                                        {{ listing.assets.length > 1 ? 'Bundle' : listing.assets[0].metadata.type }}
                                    </span>
                                    <span class="listing__name">
                                        <span v-if="listing.assets.length > 1">
                                            {{ listing.assets.length }} CryptoZoo Assets
                                        </span>
                                        <span v-else>
                                            {{ listing.assets[0].metadata.name }} - {{ listing.assets[0].id }}
                                        </span>
                                    </span>
                                    <span class="listing__rarity-yield" v-if="
                                        listing.assets.length === 1 &&
                                        listing.assets[0].metadata.rarity &&
                                        listing.assets[0].metadata.dailyYield
                                    ">
                                        <strong>
                                            {{ listing.assets[0].metadata.rarity }} | Daily Yield:
                                        </strong>
                                        {{ listing.assets[0].metadata.dailyYield }} $ZOO
                                    </span>
                                    <span class="listing__bid" v-if="!listing.buyNowOnly">
                                        <strong>Bid:</strong>&nbsp;
                                        <span class="gold wb">
                                            {{ listingValue(listing) }}
                                        </span>
                                        $ZOO
                                    </span>
                                    <span class="listing__bid" v-if="ethers.BigNumber.from(listing.price).gt(0)">
                                        <strong>Buy:</strong>&nbsp;
                                        <span class="gold wb">
                                            {{ humanizeEther(listing.price) }}
                                        </span>
                                        $ZOO
                                    </span>
                                </div>

                                <span class="listing__bid-button" @click="toListing(listing.id)">
                                    <span v-if="listing.buyNowOnly">BUY</span>
                                    <span v-if="!listing.buyNowOnly">BID</span>
                                </span>
                            </div>
                        </div>
                    </div>

                    <div class="row pagination" v-if="listings.length > 0">
                        <div class="col">
                            <p class="h3 text-center">
                                Page
                                <span class="gold">{{ currentPage + 1 }}</span>
                                of
                                {{ pagesFound }}
                            </p>
                            <div class="d-flex flex-wrap gap-1 align-items-center justify-content-center">
                                <button
                                    v-for="i in pagesFound"
                                    :class="['cz-btn', { 'cz-btn--primary': (i - 1 === currentPage), 'cz-btn--secondary': (i - 1 !== currentPage) }]"
                                    @click="toPage(i-1)"
                                >
                                    {{ i }}
                                </button>
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
@import '../assets/style/bootstrap/bootstrap';

.listing {
    position: relative;
    background-color: map-get($map: $custom-theme-colors, $key: "cz-dark2");
    border-radius: 10px;
    padding: 1rem;
    overflow: hidden;
    height: 100%;

    // border: 3px solid map-get($map: $custom-theme-colors, $key: "cz-dark3");
    // // border: 3px solid transparent;
    // cursor: pointer;
    // transition: all 0.2s;

    // &:hover {
    //     box-shadow: 0 0 24px map-get($map: $custom-theme-colors, $key: "cz-gold2");
    //     border-color: map-get($map: $custom-theme-colors, $key: "cz-gold2");
    //     // border: 3px solid map-get($map: $custom-theme-colors, $key: "cz-gold2");
    // }

    &__expiration {
        position: absolute;
        top: 0;
        right: 0;
        background: linear-gradient(
            to bottom,
            map-get($custom-theme-colors, "light-green"),
            darken(map-get($custom-theme-colors, "light-green"), 30%)
        );
        border-radius: 0 0 0 10px;
        padding: 3px 10px;
        z-index: 100;

        &.expired {
            background: linear-gradient(
                to bottom,
                darken(red, 20%),
                darken(red, 40%)
            );
        }
    }

    &__details {
        padding-top: 1rem;
        padding-right: 3rem;
    }

    &__image {
        display: block;
        width: 100%;
        max-height: 15rem;
        margin: 0 auto;
        object-fit: cover;
        border-radius: 5px;
    }

    &__type {
        display: block;
        color: lighten($color: map-get($custom-theme-colors, "cz-dark3"), $amount: 30%);
    }

    &__name {
        display: block;
        font-weight: bold;
        font-size: 1.2rem;
    }

    &__rarity-yield {
        display: block;
        margin-bottom: 5px;
    }

    &__bid {
        display: block;
        font-size: 0.8rem;
        & img {
            display: inline-block;
            height: 1rem;
        }
    }

    &__bid-button {
        position: absolute;
        bottom: 0;
        right: 0;
        background: linear-gradient(
            to bottom,
            map-get($custom-theme-colors, "cz-gold1"),
            map-get($custom-theme-colors, "cz-gold3")
        );
        border-radius: 10px 0 0 0;
        padding: 3px 10px;
        z-index: 100;
        font-size: 1.5rem;
        cursor: pointer;
    }
}

.pointer {
    cursor: pointer;
}

.listings {
    display: flex;

    &__filters {
        width: 22rem;
        transition: top 0.8s ease-in-out;

        @include media-breakpoint-down(md) {
            position: fixed;
            top: 101vh;
            width: 100vw;
            height: calc(100vh - 3rem);
            left: 0;
            z-index: 500;

            &::after {
                content: "";
                display: block;
                position: fixed;
                top: 3rem;
                left: 0;
                width: 100vw;
                height: 100vh;
                background-color: rgba(#000, 0.7);
                z-index: -1;
                opacity: 0;
                transition: opacity 0.8s;
                pointer-events: none;
            }

            &.show {
                top: 3rem;
                &::after {
                    opacity: 1;
                }
            }
        }

        &-close {
            position: absolute;
            top: 10px;
            right: 10px;
        }

        &-button {
            position: fixed;
            bottom: 1rem;
            width: 50vw;
            left: 50%;
            transform: translateX(-50%);
            z-index: 600;
            border-radius: 50rem;
            font-size: 1.5rem;
            box-shadow: 0 4px 12px #111;
            text-transform: uppercase;
            color: $light;
            font-weight: bold;
            @include media-breakpoint-up(md) {
                display: none;
            }
        }
    }
}

.pagination {
    margin-top: 2rem;

    .cz-btn {
        min-width: 2rem;
    }
}

</style>
