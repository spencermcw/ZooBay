<script setup lang="ts">
import { ref, computed, watchEffect } from 'vue'
import { useStore } from 'vuex'
import { useRoute } from 'vue-router'
import { GETTERS, ACTIONS, key } from '../store'
import SpinnerVue from '../components/Spinner.vue';

import baseAnimal from '../ethereum/contracts/baseAnimal';
import hybridAnimal from '../ethereum/contracts/hybridAnimal';

import AssetExplorerVue from './AssetExplorer.vue';
import { Asset } from '../types';

const route = useRoute();
const store = useStore(key);

const loading = ref(true);
const userAssets = computed(() => store.state.userAssets);
const account = computed(() => store.getters[GETTERS.ACTIVE_ACCOUNT_ADDRESS]);
const address = computed(() => route.query.address || account.value);
const oooAssets = computed(() => userAssets.value.filter(asset => {
    return asset.metadata.oneOfOne !== undefined && asset.metadata.oneOfOne
}))
const selectedTokens = ref<{
    [address: string]: Set<string>;
}>({})

const selectToken = (asset: { contract: string; id: string; }) => {
    if ([baseAnimal.address, hybridAnimal.address].includes(asset.contract)) {
        if (selectedTokens.value[asset.contract] === undefined) {
            selectedTokens.value[asset.contract] = new Set([asset.id]);
        } else {
            selectedTokens.value[asset.contract].has(asset.id) ? 
                selectedTokens.value[asset.contract].delete(asset.id) :
                selectedTokens.value[asset.contract].add(asset.id)
        }
    }
}

const isSelected = (contract: string, id: string) => {
    return selectedTokens.value[contract] === undefined ?
        false :
        selectedTokens.value[contract].has(id)
}

watchEffect(() => {
    // Fetch User Assets
    loading.value = true;
    Promise.all([
        store.dispatch(ACTIONS.FETCH_ASSETS, address.value),
    ])
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


