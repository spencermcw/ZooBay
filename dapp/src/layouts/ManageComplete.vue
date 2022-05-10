<script setup lang="ts">
import { ref, computed, onBeforeMount } from 'vue';
import { useStore } from 'vuex';

import { key, ACTIONS } from '../store';
import type { Listing } from '../types';

import ListingManagementVue from '../components/ListingManagement.vue';
import SpinnerVue from '../components/Spinner.vue';

const store = useStore(key);

const loading = ref(true);

const listings = computed(() => (
    store.state.listings
        .filter((listing: Listing) => (listing.expired))
));

onBeforeMount(() => {
    store.dispatch(ACTIONS.FETCH_USER_LISTINGS)
        .then(() => { loading.value = false })
        .catch(console.error)
})
</script>


<template>
<div class="container">
    <h1>Your Completed Listings</h1>
    <div v-if="loading">
        <h2>Loading Listings...</h2>
        <SpinnerVue></SpinnerVue>
    </div>
    <ListingManagementVue v-if="!loading" :listings="listings"></ListingManagementVue>
    <p v-if="!loading && listings.length === 0">
        No Listings Found...
        <br>
        You may have gotten here too quickly... Try refreshing 😅
    </p>
</div>
</template>
