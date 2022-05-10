<script setup lang="ts">
interface Props {
    spinning?: boolean;
    classes?: string;
}

withDefaults(defineProps<Props>(), {
    spinning: true,
})
</script>


<template>
    <div :class="['spinner-border spinner-border-sm me-2 my-0', classes]" role="status" v-if="spinning">
        <span class="visually-hidden">Loading...</span>
    </div>
</template>
