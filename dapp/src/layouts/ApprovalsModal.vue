<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { Modal } from 'bootstrap';

import ApprovalsVue from '../components/Approvals.vue';

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
                    <ApprovalsVue></ApprovalsVue>
                    <div class="d-grid my-3">
                        <button class="btn cz-btn cz-btn--primary" @click="modal!.hide()">
                            CONTINUE
                        </button>
                    </div>
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
