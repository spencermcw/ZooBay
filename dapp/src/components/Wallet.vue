<script setup lang="ts">
import { useStore } from "vuex";
import { computed } from "vue";

import { shortAddress } from "../lib";
import { ACTIONS, GETTERS, key } from "../store";

import SpinnerVue from "./Spinner.vue";

withDefaults(defineProps<{
    disabled?: boolean;
}>(), {
    disabled: false
});

const store = useStore(key);

const loggedIn = computed(() => store.getters[GETTERS.LOGGED_IN]);
const txnPending = computed(() => store.state.txnPending);
const address = computed(() => shortAddress(store.getters[GETTERS.ACTIVE_ACCOUNT_ADDRESS]));

const connect = () => {
    if(!loggedIn.value) {
        store.dispatch(ACTIONS.CONNECT)
    }
}
</script>

<template>
    <button class="btn cz-btn cz-btn--sm cz-btn--primary" @click="connect" :disabled="disabled || txnPending">
        <SpinnerVue :spinning="txnPending"></SpinnerVue>
        <span v-if="loggedIn">
            <i class="bi bi-wallet"></i>
            {{ address }}
        </span>
        <span v-else>Connect</span>
    </button>
</template>
