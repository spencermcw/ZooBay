<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { ethers } from 'ethers';
import { log } from 'console';

const props = withDefaults(defineProps<{
    label: string;
    value?: string;
    help?: string;
}>(), {
    value: '0'
});

const emit = defineEmits<{
    (e: 'change', uValue: string): void
}>();

const fValue = ref(props.value);
const uValue = ref(props.value);
const invalid = ref(false);

defineExpose({
    fValue,
    uValue
})

const cleanValue = (v: string) => {
    return v.replaceAll('.','').replaceAll(',','')
}

const parseValue = () => {
    const tv = cleanValue(fValue.value);
    uValue.value = tv;
    if (uValue.value.length === 0)
        uValue.value = '0'
    try {
        if (ethers.utils.parseEther(uValue.value).gt(ethers.constants.MaxUint256)) {
            throw new Error();
        }
        fValue.value = ethers.utils.commify(tv)
        invalid.value = false;
    } catch (e) {
        uValue.value = '0';
        invalid.value = true;
    }
    emit("change", uValue.value);
}

onMounted(() => {
    parseValue();
})
</script>


<template>
<div class="ether-input mb-3">
    <label for="" class="form-label">
        {{ label }}
    </label>
    <div class="input-group">
        <input type="text" name="" id="" class="form-control" v-model="fValue" @input="parseValue">
        <span class="input-group-text">$ZOO</span>
    </div>
    <span class="text-muted" v-if="invalid">Invalid</span>
    <span class="text-muted" v-if="help">{{ help }}</span>
</div>
</template>
