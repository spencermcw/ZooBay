<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { ethers } from 'ethers';

import { humanizeEther } from '../lib';
import { GETTERS, ACTIONS, key } from '../store'
import { Listing } from '../types'

import AllowanceModalVue from '../layouts/AllowanceModal.vue';
import SpinnerVue from './Spinner.vue';
import EtherInputVue from './EtherInput.vue';
import ListingManagementVue from './ListingManagement.vue';

const props = defineProps<{
    listing: Listing
}>();

const store = useStore(key);
const router = useRouter();

const allowanceModalRef = ref<typeof AllowanceModalVue | null>(null);
const bidAmount = ref('0');
const allowance = computed(() => store.state.allowance);
const account = computed(() => store.getters[GETTERS.ACTIVE_ACCOUNT_ADDRESS]);
const balance = computed(() => store.state.zooBalance);
const txnPending = computed(() => store.state.txnPending);

const requiredBid = computed(() => {
    if (props.listing.bids.length > 0) {
        const bid = ethers.BigNumber.from(props.listing.bids[0].amount);
        const outBid = bid.mul(11).div(10); // 105%
        const minOutBid = bid.add(ethers.utils.parseEther("1"));
        if (ethers.BigNumber.from(props.listing.price).gt(0) && outBid.gt(props.listing.price))
            return props.listing.price;
        if (minOutBid.gt(outBid))
            return minOutBid.toString();
        return outBid.toString();
    } else {
        return props.listing.minBid;
    }
});

const buttonDisabled = computed(() => (bidTooLow.value || bidExceedsBalance.value));

const buyingNow = computed(() => {
    try {
        return (
            ethers.BigNumber.from(props.listing.price).gt(0) &&
            ethers.utils.parseEther(bidAmount.value).gte(props.listing.price)
        );
    } catch(e) {
        return false;
    }
})

const bidTooLow = computed(() => {
    try {
        const bid = ethers.utils.parseEther(bidAmount.value);
        return bid.lt(requiredBid.value);
    } catch(e) {
        return true;
    }
})

const bidExceedsBalance = computed(() => {
    try {
        return (ethers.utils.parseEther(bidAmount.value)
            .gt(ethers.utils.parseEther(balance.value)));
    } catch (e) {
        return false;
    }
})

const bidExceedsAllowance = computed(() => {
    try {
        return (ethers.BigNumber.from(allowance.value)
            .lt(ethers.utils.parseEther(bidAmount.value)));
    } catch (e) {
        return true;
    }
});

const placeBid = () => {
    if (bidExceedsAllowance.value) {
        return allowanceModalRef.value!.show();
    }

    store.dispatch(ACTIONS.CREATE_BID, {
        listingId: props.listing.id,
        amount: ethers.utils.parseEther(bidAmount.value)
    })
        .then(() => {
            if (buyingNow.value) {
                router.push({ name: 'ManageComplete' });
            } else {
                router.go(0);
            }
        })
        .catch(console.error);
}

onMounted(() => {
    if (props.listing.buyNowOnly) {
        bidAmount.value = ethers.utils.formatEther(props.listing.price);
    }
})

</script>

<template>
<div class="container-fluid bids">
    <AllowanceModalVue ref="allowanceModalRef"></AllowanceModalVue>

    <form class="d-grid gap-3" @submit.prevent="placeBid" v-show="listing">
        <div>
            <p v-if="!listing.buyNowOnly">
                Minimum Bid:
                <span class="gold wb">{{ humanizeEther(requiredBid) }}</span> $ZOO
            </p>
            <p v-if="ethers.BigNumber.from(listing.price).gt(0)">
                Buy Now: <span class="gold wb">{{ humanizeEther(listing!.price) }}</span> $ZOO 
            </p>
        </div>
        <div>
            <EtherInputVue label="Bid Amount" @change="(uValue) => bidAmount = uValue" v-if="!listing.buyNowOnly"></EtherInputVue>
            <p v-if="bidTooLow">
                Bid too low
            </p>
            <p v-if="bidExceedsBalance">
                You don't have enough $ZOO
            </p>
            <p v-if="bidExceedsAllowance">
                Your $ZOO Allowance is too low
            </p>
        </div>
        <button class="btn cz-btn cz-btn--primary" type="submit" :disabled="txnPending || buttonDisabled">
            <SpinnerVue :spinning="txnPending"></SpinnerVue>
            <span v-if="bidExceedsAllowance">INCREASE ALLOWANCE</span>
            <div v-else>
                <span v-if="buyingNow">BUY NOW</span>
                <span v-else>PLACE BID</span>
            </div>
        </button>
        <p class="text-muted" @click="allowanceModalRef!.show">
            <i class="bi bi-info-circle cz-link"></i>
            Allowance: {{ humanizeEther(allowance) }}
        </p>
    </form>
</div>
</template>



<style lang="scss" scoped>
@import '../assets/style/abstracts/themes';
.listing-card {
    padding: 1rem;
    background-color: map-get($map: $custom-theme-colors, $key: "cz-dark2");
    border-radius: 10px;
    border: 3px solid;
    border-color: map-get($map: $custom-theme-colors, $key: "cz-gold2");

    &__title {
        display: block;
        text-align: center;
        font-size: 1.5rem;
    }

    &__value {
        display: block;
        text-align: center;
        font-size: 1.5rem;
        font-weight: bold;
        word-break: break-all;
    }
}
.bids {
    border: 3px solid map-get($map: $custom-theme-colors, $key: "cz-dark3");
    border-radius: 5px;
    background-color: map-get($map: $custom-theme-colors, $key: "cz-dark2");
    padding: 1rem 2rem;

    p {
        margin-bottom: 0;
        text-align: center;
    }
}
</style>
