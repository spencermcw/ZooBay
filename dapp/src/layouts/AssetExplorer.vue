<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { Carousel, Collapse } from 'bootstrap';
import { ethers } from 'ethers';

import contracts from '../ethereum/contracts';
import type { Asset, AssetCollection } from '../types'
import CountdownVue from '../components/Countdown.vue';
import ModalVue from '../components/Modal.vue';

const getAddress = ethers.utils.getAddress;


interface Emits {
    (e: 'asset-selected', token: { contract: string; id: string }): void
}

const emit = defineEmits<Emits>()
const props = withDefaults(defineProps<{
    assets: Asset[];
    cols?: number;
    showFeature?: boolean;
    showAccordion?: boolean;
    showTitle?: boolean;
    interactive?: boolean;
    highlight?: (contract: string, id: string) => boolean;
}>(), {
    highlight: () => false,
    cols: 2,
    showFeature: true,
    showAccordion: true,
    showTitle: true,
    interactive: false,
});

interface LightboxImage {
    src: string;
    oneOfOne: boolean;
}

const lightboxImage = ref<LightboxImage>({
    src: 'https://via.placeholder.com/170x300',
    oneOfOne: true
});
const lightbox = ref<(typeof ModalVue)|null>(null);

const showLightbox = (image: LightboxImage) => {
    lightboxImage.value = { ...image };
    lightbox.value!.show();
}

const accordionRef = ref<HTMLElement | null>(null);
const assetExplorerIndex = ref(0);
const featuredAssetCarouselRef = ref<HTMLElement | null>(null);
const featuredAssetCarousel = ref<Carousel | null>(null);
const assetCollection = computed((): AssetCollection => {
    const collection: AssetCollection = { };
    [
        getAddress(contracts.BaseEgg.address),
        getAddress(contracts.BaseAnimal.address),
        getAddress(contracts.HybridEgg.address),
        getAddress(contracts.HybridAnimal.address),
    ].forEach(address => {
        collection[address] = {
            contract: address,
            title: (props.assets.find((asset: Asset) => getAddress(asset.contract) === address)?.metadata.type) || 'NA',
            tokens: (props.assets.filter((asset: Asset) => getAddress(asset.contract) === address))
        }
    })

    return collection;
})

const collapsed = ref(new Set<number>());
const collapsibleRefs = ref<HTMLElement[]>([]);
const collapsibles = ref<Collapse[]>([]);
const setCollapse = (el: HTMLElement, index: number) => {
    if (collapsibles.value[index] !== undefined) {
        return;
    }
    collapsibleRefs.value[index] = el;
}

const toggleCollapse = (index: number) => {
    collapsibles.value[index].toggle();
}

const assetSelected = (token: { contract: string; id: string; }) => {
    if (props.showFeature) {
        const index = props.assets.findIndex(
            (asset: Asset) => (getAddress(asset.contract) === getAddress(token.contract) && asset.id === token.id)
        )
        featuredAssetCarousel.value!.to(index);
    }
    emit('asset-selected', token);
}


const initializeCarousel = () => {
    if (!featuredAssetCarouselRef.value) {
        return;
    }
    featuredAssetCarousel.value = new Carousel(featuredAssetCarouselRef.value, {
        interval: false,
        wrap: true,
        touch: true
    });
    featuredAssetCarouselRef.value.addEventListener('slide.bs.carousel', (payload: any) => {
        assetExplorerIndex.value = payload.to;
    });
}


watch(featuredAssetCarouselRef, (newVal, _) => {
    if (newVal !== null)
        initializeCarousel();
});


watch(accordionRef, (newVal, _) => {
    if (newVal === null || collapsibleRefs.value === undefined) {
        return;
    }
    for(let index = 0; index < collapsibleRefs.value.length; index++) {
        const el = collapsibleRefs.value[index];
        collapsibles.value[index] = new Collapse(el, { toggle: true })
        el.addEventListener('show.bs.collapse', () => {
            collapsed.value.delete(index);
        });
        el.addEventListener('hide.bs.collapse', () => {
            collapsed.value.add(index);
        });
    }
});
</script>


<template>
<div class="asset-explorer" ref="assetExplorerRef">
    <p v-if="assets.length < 1">No assets found...</p>

    <div v-if="assets.length > 0">
        <p class="h3" v-if="showTitle">Asset Explorer</p>

        <div class="featured-asset" id="featured-asset" v-if="showFeature">
            <button class="btn cz-btn featured-asset__prev" @click="featuredAssetCarousel!.prev" v-if="assets.length > 1">
                <i class="bi bi-chevron-left"></i>
            </button>
            <div class="carousel slide" ref="featuredAssetCarouselRef">
                <div class="carousel-inner">
                    <div :class="`carousel-item ${key===0?'active':''}`" v-for="(asset, key) in assets" :key="key">
                        <div class="thumbnail" @click="showLightbox({ src: asset.metadata.image, oneOfOne: asset.metadata.oneOfOne === undefined ? false : asset.metadata.oneOfOne })">
                            <img :src="asset.metadata.image">
                            <span class="one-of-one" v-if="asset.metadata.oneOfOne">
                                <i class="bi bi-patch-check-fill"></i>
                                1 of 1
                            </span>
                        </div>
                        <p class="text-center">
                            {{ asset.metadata.name }} #{{ asset.id }}
                        </p>
                    </div>
                </div>
            </div>
            <button class="btn cz-btn featured-asset__next" @click="featuredAssetCarousel!.next" v-if="assets.length > 1 && featuredAssetCarousel">
                <i class="bi bi-chevron-right"></i>
            </button>
            <span class="featured-asset__index text-muted" v-if="assets.length > 1">
                {{ assetExplorerIndex + 1 }} / {{ assets.length }}
            </span>
        </div>

        <ModalVue ref="lightbox" class="lightbox">
            <div class="thumbnail--lightbox">
                <span class="one-of-one" v-if="lightboxImage.oneOfOne">
                    <i class="bi bi-patch-check-fill"></i>
                    1 of 1
                </span>
                <img :src="lightboxImage.src" alt="">
            </div>
        </ModalVue>

        <div class="accordion mt-3" v-show="showAccordion" ref="accordionRef">
            <div class="accordion-item" v-for="(collection, contract, index) in assetCollection" :key="index">
                <div v-show="collection.tokens.length > 0">
                    <h2 class="accordion-header" @click="toggleCollapse(index)" >
                        <button :class="['accordion-button', { 'collapsed' : (collapsed.has(index)) }]" type="button">
                            <slot name="collection-title" :collection="collection">
                                {{ collection.title }}s: {{ collection.tokens.length }}
                            </slot>
                        </button>
                    </h2>

                    <div class="accordion-collapse collapse my-2" :ref="(el: any) => setCollapse(el, index)">
                        <div :class="['row g-4 row-cols-1', `row-cols-md-${cols}`]">
                            <div class="col" v-for="token in collection.tokens" :key="Number(token.id)">
                                <div :class="['d-flex gap-3 align-items-center asset', { interactive,  highlight: highlight(collection.contract, token.id) }]"
                                    @click="assetSelected({ contract: collection.contract, id: token.id })"
                                >
                                    <div class="thumbnail" @click="showLightbox({ src: token.metadata.image, oneOfOne: token.metadata.oneOfOne === undefined ? false : token.metadata.oneOfOne })">
                                        <img :src="token.metadata.image">
                                        <span class="one-of-one" v-if="token.metadata.oneOfOne">
                                            <i class="bi bi-patch-check-fill"></i>
                                            1 of 1
                                        </span>
                                    </div>
                                    <div class="d-grid flex-grow-1 asset__details">
                                        <p class="h3">
                                            {{ token.metadata.name }} #{{ token.id }}
                                        </p>
                                        <p>
                                            <strong>ID: </strong>
                                            {{ token.id }}
                                        </p>
                                        <p>
                                            <strong>Name: </strong> {{ token.metadata.name }}</p>
                                        <p>
                                            <strong>Type: </strong> {{ token.metadata.type }}</p>
                                        <p v-if="token.metadata.breeds !== undefined">
                                            <strong>Breeds: </strong> {{ token.metadata.breeds }}</p>
                                        <p v-if="token.metadata.rarity">
                                            <strong>Rarity: </strong> {{ token.metadata.rarity }}</p>
                                        <p v-if="token.metadata.dailyYield">
                                            <strong>Daily Yield: </strong>
                                            <span class="gold bw">
                                                {{ ethers.utils.commify(token.metadata.dailyYield) }}
                                            </span>
                                            $ZOO
                                        </p>
                                        <p v-if="token.metadata.parents">
                                            <strong>Parents: </strong>
                                            <span>
                                                {{ token.metadata.parents[0] }}
                                            </span>
                                            &amp;
                                            <span>
                                                {{ token.metadata.parents[1] }}
                                            </span>
                                        </p>
                                        <p v-if="token.metadata.cooldown">
                                            <strong>Cooldown: </strong>
                                            <CountdownVue :expiration="token.metadata.cooldown">
                                                <i class="bi bi-check gold"></i>
                                                Breed Ready
                                            </CountdownVue>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
</template>


<style lang="scss" scoped>
@import '../assets/style/abstracts/themes';

.asset {
    position: relative;
    border-radius: 10px;
    border: 3px solid map-get($map: $custom-theme-colors, $key: "cz-dark3");
    background-color: map-get($map: $custom-theme-colors, $key: "cz-dark2");
    padding: 1rem;
    &.interactive {
        cursor: pointer;
    }

    &.highlight {
        border-color: map-get($map: $custom-theme-colors, $key: "cz-gold2");
        box-shadow: 0 0 16px map-get($map: $custom-theme-colors, $key: "cz-gold2");
    }

    &__details {
        p {
            margin-bottom: 0;
        }
    }
}

.accordion-button:not(.collapsed) {
    background-color: transparent;
    background: $btn-gradient;
}

.accordion-collapse {
    padding: 1rem 0;
}

.featured-asset {
    position: relative;
    padding: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border: 3px solid map-get($map: $custom-theme-colors, $key: "cz-dark3");
    border-radius: 10px;
    background: linear-gradient(
        to bottom,
        map-get($map: $custom-theme-colors, $key: "cz-dark2"),
        #000 90%
    );

    p {
        word-break: break-all;
    }

    &__index {
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        font-size: 0.8rem;
    }

    @mixin nav-button {
        position: absolute;
        height: 100%;
        z-index: 1;
        text-shadow: 0 0 4px #000;
        font-size: 1.5rem;

        &:focus {
            box-shadow: none;
        }
    }

    &__prev {
        @include nav-button();
        left: -5px;
    }

    &__next {
        @include nav-button();
        right: -5px;
    }

    .carousel, p {
        margin: 0 auto;
    }

    .thumbnail img {
        max-height: 45vh;
    }
}

.one-of-one {
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    width: fit-content;
    border-radius: 10rem;
    padding: 5px 10px;
    color: map-get($map: $custom-theme-colors, $key: "cz-gold2");
    border: 2px solid map-get($map: $custom-theme-colors, $key: "cz-gold1");
    z-index: 100;
    bottom: 5px;
    left: 50%;
    transform: translateX(-50%);
    box-shadow: 0 0 12px rgba(#000, 0.8);
    background-color: rgba(map-get($map: $custom-theme-colors, $key: "cz-dark2"), 0.7);
    
    & > i {
        margin-right: 5px;
    }
}


.thumbnail {
    position: relative;

    & > img {
        border-radius: 4px;
        position: relative;
        display: block;
        margin: 0 auto;
        height: 500px;
        max-height: 30vh;
        max-width: 100%;
        border-radius: 5px;
        object-fit: cover;
    }

    &--lightbox {
        position: relative;

        img {
            height: 100%;
            width: 100%;
            max-width: 100%;
            max-height: 70vh;
            object-fit: cover;
            border-radius: 10px;
            border: 4px solid map-get($custom-theme-colors, "cz-gold2");
            box-shadow: 0 4px 8px #000;
        }

        .one-of-one {
            margin-bottom: 15px;
        }
    }
}


</style>
