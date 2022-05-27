<script setup lang="ts">
import { ref, computed, watchEffect } from 'vue'
import { useStore } from 'vuex'
import { useRoute } from 'vue-router'
import { GETTERS, MUTATIONS, ACTIONS, key } from '../store'
import SpinnerVue from '../components/Spinner.vue';

import baseAnimal from '../ethereum/contracts/baseAnimal';
import hybridAnimal from '../ethereum/contracts/hybridAnimal';

import AssetExplorerVue from './AssetExplorer.vue';
import { ethers } from 'ethers';
import router from '../router';

const getAddress = ethers.utils.getAddress;

const route = useRoute();
const store = useStore(key);

const loading = ref(true);
const userAssets = computed(() => store.state.userAssets);
const txnPending = computed(() => store.state.txnPending);
const account = computed(() => store.getters[GETTERS.ACTIVE_ACCOUNT_ADDRESS]);
const address = computed(() => route.query.address || account.value);
const oooAssets = computed(() => userAssets.value.filter(asset => {
    return asset.metadata.claimable !== undefined && asset.metadata.claimable
}))
const selectedTokens = ref<{
    [address: string]: Set<string>;
}>({
    [getAddress(baseAnimal.address)]: new Set(),
    [getAddress(hybridAnimal.address)]: new Set(),
})
const sumSelected = computed(() => {
    return (
        selectedTokens.value[getAddress(baseAnimal.address)].size +
        selectedTokens.value[getAddress(hybridAnimal.address)].size
    )
})

const selectToken = (asset: { contract: string; id: string; }) => {
    selectedTokens.value[asset.contract].has(asset.id) ? 
        selectedTokens.value[asset.contract].delete(asset.id) :
        selectedTokens.value[asset.contract].add(asset.id)
}

const isSelected = (contract: string, id: string) => {
    return selectedTokens.value[contract] === undefined ?
        false :
        selectedTokens.value[contract].has(id)
}

const redeem = async () => {
    if (selectedTokens.value[getAddress(baseAnimal.address)].size > 0) {
        store.commit(MUTATIONS.SET_TXN_PENDING, true);
        const ids = Array.from(selectedTokens.value[getAddress(baseAnimal.address)].values());
        await store.dispatch(ACTIONS.CLAIM, { ids, contractAddress: getAddress(baseAnimal.address) })
    }
    if (selectedTokens.value[getAddress(hybridAnimal.address)].size > 0) {
        store.commit(MUTATIONS.SET_TXN_PENDING, true);
        const ids = Array.from(selectedTokens.value[getAddress(hybridAnimal.address)].values());
        await store.dispatch(ACTIONS.CLAIM, { ids, contractAddress: getAddress(hybridAnimal.address) })
    }
    alert("One of Ones claimed, redirecting to My Zoo");
    store.commit(MUTATIONS.SET_TXN_PENDING, false);
    router.push({ name: 'ViewZoo' })
}

watchEffect(() => {
    // Fetch User Assets
    loading.value = true;
    store.dispatch(ACTIONS.FETCH_ASSETS, address.value)
        .then(() => { loading.value = false })
        .catch(console.error);
})

</script>


<template>
<div class="view-collection">
    <div class="container my-3" v-if="loading">
        <h1>Loading Zoo...</h1>
        <p>The more assets in the Zoo, the longer this will take...</p>
        <SpinnerVue/>
    </div>

    <div class="container my-3" v-if="!loading && address.length > 0">
        <h1><span class="gold">Your</span> 1 of 1s</h1>
        <button class="btn cz-btn cz-btn--primary float-end my-3" :disabled="sumSelected < 1 || txnPending" @click="redeem">
            <SpinnerVue :spinning="txnPending"></SpinnerVue>
            <i class="bi bi-award"></i>
            Redeem {{ sumSelected }}
        </button>
        <AssetExplorerVue
            :assets="oooAssets"
            :show-title="false"
            :show-feature="false"
            :show-lightbox="false"
            :interactive="true"
            :highlight="isSelected"
            @asset-selected="selectToken"
        />
    </div>
</div>
</template>


