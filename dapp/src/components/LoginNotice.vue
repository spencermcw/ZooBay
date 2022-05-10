<script setup lang="ts">
import WalletVue from './Wallet.vue';
withDefaults(defineProps<{
    action?: string;
}>(), {
    action: 'View Content'
})
</script>

<template>
<div class="login-notice">
    <div class="d-flex flex-column gap-3 text-center">
        <p>
            Please Connect MetaMask to<br>
            {{ action }}
        </p>
        <WalletVue></WalletVue>
    </div>
</div>
</template>
