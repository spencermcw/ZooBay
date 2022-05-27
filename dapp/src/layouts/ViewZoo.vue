<script setup lang="ts">
import { ref, computed, onMounted, watchEffect, onUpdated } from 'vue'
import { useStore } from 'vuex'
import { useRouter, useRoute } from 'vue-router'
import { GETTERS, ACTIONS, key } from '../store'
import { shortAddress } from '../lib';
import SpinnerVue from '../components/Spinner.vue';

import AssetExplorerVue from './AssetExplorer.vue';

const router = useRouter();
const route = useRoute();
const store = useStore(key);

const loading = ref(true);
const userAssets = computed(() => store.state.userAssets);
const account = computed(() => store.getters[GETTERS.ACTIVE_ACCOUNT_ADDRESS]);
const loggedIn = computed(() => store.getters[GETTERS.LOGGED_IN]);
const address = computed(() => route.query.address || account.value);
const inputAddress = ref('')

const search = () => {
    return router.replace({ name: 'ViewZoo', query: { address: inputAddress.value } })
}

onMounted(() => {
    if (!loggedIn.value) {
        return;
    }
    if (!route.query.address) {
        inputAddress.value = account.value;
        return router.replace({ name: 'ViewZoo', query: { address: account.value } })
    }
    inputAddress.value = route.query.address.toString();
})

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
    <div class="container my-3">
        <form @submit.prevent="search">
            <label for="addressInput">Search</label>
            <div class="input-group">
                <input type="text" class="form-control" name="addressInput" id="addressInput" v-model="inputAddress">
                <button class="cz-btn cz-btn--primary px-4" type="submit">
                    <i class="bi bi-search"></i>
                </button>
            </div>
        </form>
    </div>

    <div class="container my-3" v-if="loading">
        <h1>Loading Zoo...</h1>
        <p>The more assets in the Zoo, the longer this will take...</p>
        <SpinnerVue></SpinnerVue>
    </div>

    <div class="container my-3" v-if="!loading && address.length > 0">
        <h1><span class="gold">{{ shortAddress(address) }}</span>'s ZOO</h1>
        <AssetExplorerVue :assets="userAssets" :show-title="false" :show-feature="false"></AssetExplorerVue>
    </div>
</div>
</template>


