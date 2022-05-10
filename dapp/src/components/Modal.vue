<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Modal } from 'bootstrap';

const modalRef = ref<HTMLElement|null>(null);
const modal = ref<Modal | null>(null);

const show = () => {
    modal.value!.show();
}

const hide = () => {
    modal.value!.hide();
}

defineExpose({ show, hide })

onMounted(() => {
    modal.value = new Modal(modalRef.value!);
})
</script>



<template>
<div class="modal fade" ref="modalRef">
    <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content">
            <div class="modal-body">
                <slot>Modal Body</slot>
                <div class="d-grid mt-3">
                    <button class="cz-btn cz-btn--secondary" @click="hide">
                        <i class="bi bi-x-lg"></i>
                        CLOSE
                    </button>
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

