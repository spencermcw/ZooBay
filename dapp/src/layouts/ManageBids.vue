<script setup lang="ts">
import { ref, computed, onBeforeMount } from 'vue';
import { useStore } from 'vuex';

import { key, ACTIONS, GETTERS } from '../store';
import type { Bid, Listing } from '../types';

import ListingManagementVue from '../components/ListingManagement.vue';
import SpinnerVue from '../components/Spinner.vue';

const store = useStore(key);

const account = computed(() => store.getters[GETTERS.ACTIVE_ACCOUNT_ADDRESS])

const loading = ref(true);

const listings = computed(() => (
    store.state.listings
        .filter((listing: Listing) => (!listing.expired && listing.bids.findIndex((bid: Bid) => bid.bidder === account.value) !== -1))
))

onBeforeMount(() => {
    store.dispatch(ACTIONS.FETCH_USER_LISTINGS)
        .then(() => { loading.value = false })
        .catch(console.error)
})
</script>


<template>
<div class="container">
    <h1>Your Bids</h1>
    <div v-if="loading">
        <h2>Loading Listings...</h2>
        <SpinnerVue></SpinnerVue>
    </div>
    <ListingManagementVue v-if="!loading" :listings="listings"></ListingManagementVue>
    <p v-if="!loading && listings.length === 0">
        No Bids Found...
        <br>
        You may have gotten here too quickly... Try refreshing 😅
    </p>
</div>
</template>
