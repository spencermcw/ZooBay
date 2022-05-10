<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { Modal } from 'bootstrap';

import { Listing } from '../types';

import BidVue from '../components/Bid.vue'

const props = defineProps<{
    listing: Listing
}>()

const modalRef = ref<HTMLElement | null>(null);
const modal = ref<Modal | null>(null);

onMounted(() => {
    modal.value = new Modal(modalRef.value!);
})

const show = () => {
    modal.value!.show();
}

const hide = () => {
    modal.value!.hide();
}

defineExpose({ show, hide })

</script>


<template>
<div class="approvals-modal">
    <div class="modal fade" ref="modalRef">
        <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
            <div class="modal-content">
                <div class="modal-body">
                    <BidVue :listing="listing"></BidVue>
                    <button class="btn cz-btn" @click="hide">Close</button>
                </div>
            </div>
        </div>
    </div>

</div>
</template>


<style lang="scss" scoped>
.modal {
    z-index: 10000;
    text-align: center;

    &-body {
        padding: 2rem;
    }
}
</style>
