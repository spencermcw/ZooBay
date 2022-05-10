<script setup lang="ts">
import { useStore } from "vuex";
import { ref, computed } from "vue";

import { ACTIONS, key } from '../store'

import WalletVue from "./Wallet.vue";
import SpinnerVue from "./Spinner.vue";

const store = useStore(key)

const approvals = computed(() => store.state.approvals)

const txnPending = computed(() => store.state.txnPending)

const requestApproval = (contract: string) => store.dispatch(ACTIONS.SET_APPROVAL, { contract, approval: true })
const revokeApproval = (contract: string) => store.dispatch(ACTIONS.SET_APPROVAL, { contract, approval: false })
</script>



<template>
<div class="approvals">
    <p class="h1">Asset Approvals</p>
    <p class="text-muted">
        These approvals give ZooBay permission to
        manage your CryptoZoo Assets.
    </p>
    <p>
        You only need to approve assets you're listing.
    </p>
    <div class="d-grid gap-3">
        <div v-for="approval in approvals" :class="['d-flex align-items-center approval', { 'approved': approval.approval }]">
            <span class="approval__title me-auto">
                {{ approval.title.toUpperCase() }}
                <i class="bi bi-check-lg" v-if="approval.approval"></i>
            </span>
            <button class="btn cz-btn cz-btn--primary px-5" v-if="!approval.approval" @click="requestApproval(approval.contract)" :disabled="txnPending">
                <SpinnerVue :spinning="txnPending"></SpinnerVue>
                Approve
            </button>
            <span class="text-muted" v-if="approval.approval" @click="revokeApproval(approval.contract)" :disabled="txnPending">
                <SpinnerVue :spinning="txnPending"></SpinnerVue>
                Revoke
            </span>
        </div>
        <WalletVue :disabled="true"></WalletVue>
    </div>
</div>
</template>



<style lang="scss" scoped>
@import  '../assets/style/abstracts/themes';
.approval {
    border: 3px solid map-get($map: $custom-theme-colors, $key: 'cz-gold2');
    border-radius: 5px;
    padding: 1rem;

    &__title {
        font-size: 1.5rem;
        text-align: left;
        word-break: normal;
    }

    &.approved {
        border-color: map-get($map: $custom-theme-colors, $key: 'dark-green');;
    }
}
</style>
