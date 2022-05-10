<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { countdown } from '../lib';

defineProps<{
    expiration: string;
}>();

const secondsTrigger = ref(0);

onMounted(() => {
    setInterval(() => secondsTrigger.value++, 1000);
})
</script>

<template>
    <span :key="secondsTrigger" v-if="countdown(expiration) !== null">
        {{ countdown(expiration) }}
    </span>
    <slot v-else>
        Expired
    </slot>
</template>
