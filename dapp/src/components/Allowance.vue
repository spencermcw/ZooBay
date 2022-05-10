<script setup lang="ts">
import { useStore } from "vuex";
import { ref, computed } from "vue";
import { ethers } from "ethers";

import { ACTIONS, key } from '../store'
import { humanizeEther, tryParseEther } from "../lib";

import WalletVue from "./Wallet.vue";
import SpinnerVue from "./Spinner.vue";
import EtherInputVue from "./EtherInput.vue";

const store = useStore(key)

const allowance = computed(() => store.state.allowance)
const txnPending = computed(() => store.state.txnPending)

const allowanceAmount = ref('0')

const increaseAllowance = () => {
    if (tryParseEther(allowanceAmount.value) !== 'Invalid') {
        store.dispatch(ACTIONS.INCREASE_ALLOWANCE, ethers.utils.parseEther(allowanceAmount.value));
    }
}

const buttonDisabled = computed(() => (tryParseEther(allowanceAmount.value) === 'Invalid'))
</script>

<template>
<div class="allowance">
    <form class="d-grid gap-2" @submit.prevent="increaseAllowance">
        <p class="h1">$ZOO Allowance</p>
        <p>
            <i class="bi bi-exclamation-triangle gold me-1"></i>
            We strongly suggest making this large enough to place multiple bids
            so you don't have to do this every time!
        </p>

        <p>Current Allowance:
            <span class="gold wb">{{ humanizeEther(allowance) }}</span>
            $ZOO
        </p>

        <EtherInputVue label="Increase Allowance By" @change="uValue => allowanceAmount = uValue"></EtherInputVue>

        <button class="btn cz-btn cz-btn--primary" type="submit" :disabled="txnPending || buttonDisabled">
            <SpinnerVue :spinning="txnPending"></SpinnerVue>
            INCREASE ALLOWANCE
        </button>
        <WalletVue :disabled="true"></WalletVue>
        <a href="https://ethereum.org/en/developers/tutorials/understand-the-erc-20-token-smart-contract/" target="_blank" class="text-muted">more info</a>
    </form>
</div>
</template>



<style lang="scss" scoped>
@import  '../assets/style/abstracts/themes';
.allowance {
    border-radius: 5px;
    text-align: center;

    p {
        margin-bottom: 0;
    }

    &.approved {
        border-color: map-get($map: $custom-theme-colors, $key: 'dark-green');;
    }
}
</style>
