<script setup lang="ts">
    import { computed } from "vue";
    import { useStore } from "vuex";
    import { GETTERS, key } from "../store";
    import WalletVue from "../components/Wallet.vue";

    const store = useStore(key)
    const loggedIn = computed(() => store.getters[GETTERS.LOGGED_IN])
</script>

<template>
    <section id="login" class="container my-4">
        <!-- <h1 class="text-center">Login</h1> -->
        <div class="d-flex flex-column align-items-center gap-2 my-3">
            <h1>Please Connect</h1>
            <WalletVue class="mb-3"></WalletVue>
        </div>
    </section>
</template>
