<script setup>
import { onMounted } from 'vue'

onMounted(() => {
    const script_ = document.getElementById('termly-embed');
    if (script_ !== null) {
        script_.remove();
    }

    var js, tjs = document.getElementsByTagName('script')[0];
    if (document.getElementById('termly-embed')) return;
    js = document.createElement('script'); js.id = 'termly-embed';
    js.src = "https://app.termly.io/embed-policy.min.js";
    tjs.parentNode.insertBefore(js, tjs);
})
</script>

<template>
    <div id="terms">
        <div id="termly" name="termly-embed" data-id="5695bc79-adb0-4391-b1e0-4ec387b650d0" data-type="iframe"></div>
        <div id="termly" name="termly-embed" data-id="0b250cc5-548f-484b-80c4-4169021917ea" data-type="iframe"></div> 
    </div>
</template>

<style lang="scss" scoped>
#termly {
    background-color: #ddd;
}
</style>
