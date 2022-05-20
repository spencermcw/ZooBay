<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { ethers } from 'ethers'
import * as Bootstrap from 'bootstrap'

import type { Asset } from '../types'
import contracts from '../ethereum/contracts'
import { GETTERS, ACTIONS, key } from '../store'

import AssetExplorerVue from './AssetExplorer.vue'
import ApprovalsModalVue from './ApprovalsModal.vue'
import SpinnerVue from '../components/Spinner.vue'
import EtherInputVue from '../components/EtherInput.vue'
import LoginNoticeVue from '../components/LoginNotice.vue'

const router = useRouter()
const store = useStore(key)

const getAddress = ethers.utils.getAddress;

const durationOptions = [1, 3, 7, 14];

const loading = ref(true);
const enableBuyNow = ref(false);
const carouselRef = ref<HTMLElement | null>(null);
const carousel = ref<Bootstrap.Carousel | null>(null);
const approvalsModal = ref<any | null>(null);
const listingDetails = ref({
    minBid: "1",
    price: "1000000",
    duration: durationOptions[1],
});
const selectedAssets = ref({
    [contracts.EasterEgg.address]: new Set<string>(),
    [contracts.BaseEgg.address]: new Set<string>(),
    [contracts.BaseAnimal.address]: new Set<string>(),
    [contracts.HybridEgg.address]: new Set<string>(),
    [contracts.HybridAnimal.address]: new Set<string>(),
});

const userAssets = computed(() => store.state.userAssets);
const txnPending = computed(() => store.state.txnPending);
const loggedIn = computed(() => store.getters[GETTERS.LOGGED_IN]);
const account = computed(() => store.getters[GETTERS.ACTIVE_ACCOUNT_ADDRESS]);
const listingAssets = computed(() => {
    return userAssets.value.filter((asset: Asset) =>
        selectedAssets.value[getAddress(asset.contract)].has(asset.id))
})

const assetCount = computed(() => {
    return [
        selectedAssets.value[contracts.BaseEgg.address].size,
        selectedAssets.value[contracts.BaseAnimal.address].size,
        selectedAssets.value[contracts.HybridEgg.address].size,
        selectedAssets.value[contracts.HybridAnimal.address].size,
        selectedAssets.value[contracts.EasterEgg.address].size,
    ].reduce((p, c) => p + c, 0)
})

const assetSelected = (e: { contract: string, id: string }) => {
    const c = getAddress(e.contract);
    if (selectedAssets.value[c].has(e.id))
        selectedAssets.value[c].delete(e.id)
    else
        selectedAssets.value[e.contract].add(e.id)
}

const highlight = (contract: string, id: string): boolean => {
    return selectedAssets.value[getAddress(contract)].has(id);
}

const submitListing = () => {
    const contracts: string[] = []
    const tokenIds: string[][] = []
    Object.keys(selectedAssets.value)
        .map((contract: string) => ({
            contract: contract,
            tokenIds: [...selectedAssets.value[contract]]
        }))
        .filter(record => record.tokenIds.length > 0)
        .forEach(record => {
            contracts.push(record.contract)
            tokenIds.push(record.tokenIds)
        })
    
    for (let i = 0; i < contracts.length; i++) {
        if (!store.state.approvals[contracts[i]].approval) {
            return approvalsModal.value!.show();
        }
    }

    store.dispatch(ACTIONS.CREATE_LISTING, {
        contracts: contracts,
        tokenIds: tokenIds,
        duration: listingDetails.value.duration,
        price: (enableBuyNow.value ? ethers.utils.parseEther(listingDetails.value.price) : 0),
        minBid: ethers.utils.parseEther(listingDetails.value.minBid),
    })
        .then(() => router.push({ name: 'ManageListings' }));
}

onMounted(() => {
    carousel.value = new Bootstrap.Carousel(carouselRef.value as Element, {
        interval: false,
        keyboard: false,
        pause: false,
        wrap: false,
        touch: false,
    });
    if(!loggedIn.value) {
        return;
    }
    // Fetch Assets and Approvals
    Promise.all([
        store.dispatch(ACTIONS.FETCH_ASSETS, account.value),
        store.dispatch(ACTIONS.FETCH_APPROVALS),
    ])
        .then(() => { loading.value = false })
        .catch(console.error);
});

</script>


<template>
<div class="create-listing">
    <LoginNoticeVue v-if="!loggedIn"></LoginNoticeVue>

    <div v-else>

        <div class="container" v-if="loading">
            <h1>Loading Your Assets...</h1>
            <p>The more assets you own, the longer this will take...</p>
            <SpinnerVue></SpinnerVue>
        </div>

        <div class="container my-5" id="create-listing" v-show="!loading">
            <h1>Create Listing</h1>
            <ApprovalsModalVue ref="approvalsModal"></ApprovalsModalVue>

            <div ref="carouselRef" class="carousel slide">
                <div class="carousel-inner">
                    <div class="carousel-item active">
                        <div class="row row-cols-1 row-cols-md-2 justify-content-between my-3">
                            <div class="col">
                                <span class="fs-2">
                                    <strong>Step 1:</strong> Select Assets
                                </span>
                            </div>
                            <div class="col">
                                <div class="d-flex align-items-center justify-content-end">
                                    <span class="me-3">{{ assetCount }} Total Assets Selected</span>
                                    <button class="btn cz-btn cz-btn--primary px-3" :disabled="assetCount < 1" @click="carousel!.next()">
                                        CONTINUE
                                        <i class="bi bi-chevron-right"></i>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <AssetExplorerVue :assets="userAssets" :highlight="highlight" :interactive="true" :cols="2" @asset-selected="assetSelected" :show-feature="false">
                            <template v-slot:collection-title="slotProps">
                                <span>{{ slotProps.collection.title }}s: {{ selectedAssets[slotProps.collection.contract].size }}/{{ slotProps.collection.tokens.length }} Selected</span>
                            </template>
                        </AssetExplorerVue>
                    </div>


                    <div class="carousel-item">
                        <div class="row justify-content-between my-3">
                            <div class="col-12 col-lg-5">
                                <div class="d-grid">
                                    <span class="fs-2">
                                        <strong>Step 2:</strong> Listing Settings
                                    </span>

                                    <form @submit.prevent="submitListing" class="d-grid gap-3">
                                        <EtherInputVue label="Starting Bid" :value="listingDetails.minBid" @change="value => listingDetails.minBid = value"></EtherInputVue>

                                        <label for="buy-now" class="checkbox-container">
                                            <input type="checkbox" name="buy-now" id="buy-now" v-model="enableBuyNow">
                                            <span class="checkbox">
                                                <i class="bi bi-check"></i>
                                            </span>
                                            <span>Enable "Buy Now"</span>
                                        </label>

                                        <EtherInputVue label="Buy Now Price" :value="listingDetails.price" @change="value => listingDetails.price = value" v-if="enableBuyNow">
                                        </EtherInputVue>

                                        <div v-if="!enableBuyNow || (enableBuyNow && ethers.BigNumber.from(listingDetails.price).gt(listingDetails.minBid))">
                                            <label for="duration" class="form-label">Auction Duration</label>
                                            <div class="input-group">
                                                <select name="" id="" class="form-select" v-model="listingDetails.duration">
                                                    <option v-for="duration in durationOptions" :value="duration">{{ duration }}</option>
                                                </select>
                                                <span class="input-group-text">Days</span>
                                            </div>
                                        </div>
                                        <div v-if="enableBuyNow && ethers.BigNumber.from(listingDetails.price).lte(listingDetails.minBid)">
                                            <span>Listing will remain active <i class="bi bi-infinity"></i> until sold or cancelled.</span>
                                        </div>

                                        <button class="btn cz-btn cz-btn--primary" type="submit" :disabled="txnPending || ethers.BigNumber.from(listingDetails.minBid).lt(1)">
                                            <SpinnerVue :spinning="txnPending"></SpinnerVue>
                                            CREATE LISTING
                                        </button>

                                        <p class="text-muted" @click="approvalsModal.show()">
                                            <i class="bi bi-info-circle cz-link"></i>
                                            Asset Approvals
                                        </p>

                                        <p class="text-muted">
                                            Upon creating this listing, all selected assets will be transferred to the
                                            Auction House Smart Contract. In the event you cancel this listing before a bid is placed on it,
                                            all assets will be returned directly to you. Once a bid is placed on this listing,
                                            you will no longer be given the option to cancel it.
                                        </p>
                                    </form>
                                </div>
                            </div>

                            <div class="col-12 col-lg-7">
                                <div class="d-flex align-items-center justify-content-end mb-4">
                                    <span class="me-3">{{ assetCount }} Assets Selected</span>
                                    <button class="btn cz-btn cz-btn--primary px-3" :disabled="assetCount < 1" @click="carousel!.prev()">
                                        <i class="bi bi-pencil"></i>
                                        EDIT
                                    </button>
                                </div>
                                <AssetExplorerVue :assets="listingAssets" :cols="1" :key="assetCount"></AssetExplorerVue>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
</template>


