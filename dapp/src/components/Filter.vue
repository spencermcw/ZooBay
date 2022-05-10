<script setup lang="ts">
import { onBeforeMount, ref, watch, reactive } from 'vue';
import { useRoute } from 'vue-router';

import contracts from '../ethereum/contracts';
import type { AssetFilters } from '../types';

const emit = defineEmits<{
    (e: 'apply', filters: object): void,
    (e: 'close'): void,
}>();

const route = useRoute()

const baseAnimals = [
    'Turtle', 'Kitten', 'Pug', 'Butterfly',
    'Orca', 'Penguin', 'Duckling', 'Elk',
    'Panda', 'Lion', 'Elephant', 'Gorilla',
    'Bear', 'Shark', 'NakedMoleRat', 'BlobFish'
] as const;

const rarities = ['Common', 'Uncommon', 'Rare', 'SuperRare', 'Epic'];

const orderByValues = [
    ['createdAt', 'List Date'],
    ['expiresAt', 'Expiration Date'],
    ['price', 'Buy Now Price'],
    ['highBid', 'Current Bid Price'],
    ['numAssets', '# Assets'],
] as const;

const showQuickFilters = ref<boolean>(false);

const orderBy = ref<string>(orderByValues[0][0]);

const orderDirection = ref<string>('desc');

const searchTerms = ref('');

const listingFilterValues = ['Singles', 'Bundles', 'Buy Now', 'Has Bids', 'No Bids', 'Ended'] as const;
type ListingFilterValue = typeof listingFilterValues[number];
const listingFilters = ref(new Set<ListingFilterValue>());

const assetContract = ref<string | null>(null);

const assetFilters = reactive<AssetFilters>({
    [contracts.BaseEgg.address]: {
        address: contracts.BaseEgg.address,
        title: 'Base Egg',
        fieldNames: [],
    },
    [contracts.HybridEgg.address]: {
        address: contracts.HybridEgg.address,
        title: 'Hybrid Egg',
        fieldNames: [],
    },
    [contracts.BaseAnimal.address]: {
        address: contracts.BaseAnimal.address,
        title: 'Base Animal',
        fieldNames: ['name', 'rarity', 'breeds'],
        fields: {
            'breeds': {
                title: 'Breed Count',
                selected: new Set<string>(),
                values: ['0', '1', '2', '3', '4', '5', '6']
            },
            'rarity': {
                title: 'Rarity',
                selected: new Set<string>(), 
                values: [...rarities]
            },
            'name': {
                title: 'Species',
                selected: new Set<string>(), 
                values: [...baseAnimals]
            },
        }
    },
    [contracts.HybridAnimal.address]: {
        address: contracts.HybridAnimal.address,
        title: 'Hybrid Animal',
        fieldNames: ['rarity'],
        fields: {
            'rarity': {
                title: 'Rarity',
                selected: new Set<string>(),
                values: [...rarities, "Legendary", "Mythical"]
            }
        }
    }
});

const setQuickFilter = (
    sort: 'ENDING_SOON'|'RECENTLY_LISTED'|'RECENTLY_SOLD'|'HIGHEST_SALE'|'RECENTLY_EXPIRED'
) => {
    reset();
    switch (sort) {
        case 'ENDING_SOON':
            orderBy.value = 'expiresAt'
            orderDirection.value = 'asc'
            break;
        case 'RECENTLY_LISTED':
            orderBy.value = 'createdAt'
            orderDirection.value = 'desc'
            break;
        case 'RECENTLY_SOLD':
            listingFilters.value.add('Has Bids');
            listingFilters.value.add('Ended');
            orderBy.value = 'expiresAt'
            orderDirection.value = 'desc'
            break;
        case 'HIGHEST_SALE':
            listingFilters.value.add('Has Bids');
            listingFilters.value.add('Ended');
            orderBy.value = 'highBid'
            orderDirection.value = 'desc'
            break;
        case 'RECENTLY_EXPIRED':
            listingFilters.value.add('No Bids');
            listingFilters.value.add('Ended');
            orderBy.value = 'expiresAt'
            orderDirection.value = 'desc'
            break;
    }
    applyFilters(); // Auto-apply
}

const applyFilters = () => {
    const _filters: {
        [term: string]: string[] | string;
    } = { };

    _filters['orderBy'] = orderBy.value;
    _filters['orderDirection'] = orderDirection.value;
    _filters['page'] = "0";

    if (listingFilters.value.size > 0) {
        _filters['listings'] = [...listingFilters.value];
    }

    if (searchTerms.value.length > 0) {
        _filters['searchTerms'] = searchTerms.value.split(',').map(v => v.replaceAll(' ', ''));
    }

    if (assetContract.value !== null) {
        _filters['assetContract'] = assetContract.value;
        const fieldNames = assetFilters[assetContract.value].fieldNames;
        for (let i = 0; i < fieldNames.length; i++) {
            const fieldName = fieldNames[i];
            const field = assetFilters[assetContract.value].fields![fieldName];
            const values = field.selected.size ? [...field.selected] : [];
            if (values.length > 0) {
                _filters['assetField_' + fieldName] = values;
            }
        }
    }
    // Emit event
    emit('apply', _filters);
}

const flipOrderDirection = () => {
    orderDirection.value = orderDirection.value === 'asc' ? 'desc' : 'asc';
}

watch([assetFilters, assetContract, listingFilters, orderBy, orderDirection], applyFilters);

const reset = () => {
    orderBy.value = orderByValues[0][0];
    orderDirection.value = 'asc';
    searchTerms.value = '';
    assetContract.value = null;
    listingFilters.value.clear();
    assetFilters[contracts.BaseAnimal.address].fieldNames.forEach(field => {
        assetFilters[contracts.BaseAnimal.address].fields![field].selected.clear();
    });
    assetFilters[contracts.HybridAnimal.address].fieldNames.forEach(field => {
        assetFilters[contracts.HybridAnimal.address].fields![field].selected.clear();
    });
    applyFilters(); // Auto-apply
}

onBeforeMount(() => {
    if (route.query.searchTerms) {
        searchTerms.value = (route.query.searchTerms as string[]).join(', ');
    }

    if (route.query.listings) {
        (route.query.listings as ListingFilterValue[]).forEach(filter => {
            if (listingFilterValues.includes(filter))
                listingFilters.value.add(filter)
        });
    }

    if (route.query.assetContract) {
        assetContract.value = route.query.assetContract as string;
    }

    if (route.query.assetField_name) {
        (route.query.assetField_name as string[]).forEach(name => {
            if (assetFilters[assetContract.value!].fields!['name'].values.includes(name))
                assetFilters[assetContract.value!].fields!['name'].selected.add(name);
        })
    }

    if (route.query.assetField_rarity) {
        (route.query.assetField_rarity as string[]).forEach(rarity => {
            if (assetFilters[assetContract.value!].fields!['rarity'].values.includes(rarity))
                assetFilters[assetContract.value!].fields!['rarity'].selected.add(rarity);
        })
    }

    if (route.query.assetField_breeds) {
        (route.query.assetField_breeds as string[]).forEach(breeds => {
            if (assetFilters[assetContract.value!].fields!['breeds'].values.includes(breeds))
                assetFilters[assetContract.value!].fields!['breeds'].selected.add(breeds);
        })
    }

})
    
</script>



<template>
<div class="filters d-flex flex-column gap-3">
    <div class="d-flex flex-wrap gap-2 justify-content-between">
        <h1 class="mb-0 flex-grow-1 flex-shrink-0">
            <i class="bi bi-funnel"></i>
            Filters
        </h1>

        <button class="btn cz-btn cz-btn--secondary flex-grow-1" @click="reset">
            <i class="bi bi-arrow-counterclockwise"></i>
            Reset
        </button>
    </div>

    <div class="d-flex flex-column gap-2">
        <form @submit.prevent="applyFilters">
            <p>Search By Name</p>
            <div class="d-grid gap-2">
                <div class="input-group">
                    <span class="input-group-text">
                        <i class="bi bi-search"></i>
                    </span>
                    <input type="text" name="search" id="search" class="form-control" placeholder="elk, ele, pan..." v-model="searchTerms" required>
                </div>
                <button class="cz-btn cz-btn--primary" type="submit">SEARCH</button>
            </div>
        </form>

        <div>
            <p>Sort By</p>
            <div class="input-group">
                <select name="orderBy" id="orderBy" class="form-select" v-model="orderBy">
                    <option :value="opt[0]" v-for="opt in orderByValues">
                        {{ opt[1] }}
                    </option>
                </select>
                <button class="cz-btn cz-btn--primary px-3" @click="flipOrderDirection">
                    <i :class="['bi', { 'bi-sort-down': orderDirection === 'desc', 'bi-sort-up': orderDirection === 'asc' }]"></i>
                </button>
            </div>
        </div>
        <span class="cz-link" @click="showQuickFilters = !showQuickFilters">
            Quick Filters
            <i class="bi bi-eye-fill" v-if="showQuickFilters"></i>
            <i class="bi bi-eye-slash-fill" v-if="!showQuickFilters"></i>
        </span>
        <div class="d-grid gap-2" v-if="showQuickFilters">
            <button class="cz-btn cz-btn--secondary" @click="setQuickFilter('ENDING_SOON')">
                Ending Soon
            </button>
            <button class="cz-btn cz-btn--secondary" @click="setQuickFilter('RECENTLY_LISTED')">
                Recently Listed
            </button>
            <button class="cz-btn cz-btn--secondary" @click="setQuickFilter('HIGHEST_SALE')">
                Highest Sale
            </button>
            <button class="cz-btn cz-btn--secondary" @click="setQuickFilter('RECENTLY_SOLD')">
                Recently Sold
            </button>
            <button class="cz-btn cz-btn--secondary" @click="setQuickFilter('RECENTLY_EXPIRED')">
                Recently Expired / Cancelled
            </button>
        </div>
    </div>

    <div>
        <p>Listing</p>
        <div class="d-flex flex-column gap-2">
            <div v-for="value in listingFilterValues" :key="value">
                <label :for="value" class="checkbox-container">
                    <input type="checkbox" :name="value" :id="value" :value="value" v-model="listingFilters">
                    <span class="checkbox">
                        <i class="bi bi-check"></i>
                    </span>
                    <span>{{ value }}</span>
                </label>
            </div>
        </div>
    </div>


    <div>
        <p>Asset Types</p>

        <div class="d-flex flex-column gap-2">
            <div>
                <label for="any-asset" class="checkbox-container">
                    <input type="radio" name="any-asset" id="any-asset" :value="null" v-model="assetContract">
                    <span class="checkbox">
                        <i class="bi bi-check"></i>
                    </span>
                    <span>Any</span>
                </label>
            </div>

            <div v-for="contract in assetFilters" :key="contract.address">
                <label :for="contract.address" class="checkbox-container">
                    <input type="radio" :name="contract.address" :id="contract.address" :value="contract.address" v-model="assetContract">
                    <span class="checkbox">
                        <i class="bi bi-check"></i>
                    </span>
                    <span>{{ contract.title }}</span>
                </label>
            </div>
        </div>
    </div>

        <div v-if="assetContract != null" v-for="field in assetFilters[assetContract].fields" :key="field.title">
            <p>{{ field.title }}</p>

            <div class="d-flex flex-column gap-2">
                <div v-for="value in field.values" v-if="field">
                    <label :for="value" class="checkbox-container">
                        <input type="checkbox" :name="value" :id="value" :value="value" v-model="field.selected">
                        <span class="checkbox">
                            <i class="bi bi-check"></i>
                        </span>
                        <span>{{ value }}</span>
                    </label>
                </div>
            </div>
        </div>
</div>
</template>



<style lang="scss" scoped>
@import '../assets/style/index.scss';

.filters {
    position: relative;
    top: 0;
    left: 0;
    padding: 1rem;
    max-height: 100%;
    width: 100%;
    background-color: map-get($map: $custom-theme-colors, $key: "cz-dark3");

    border-radius: 10px;

    @include media-breakpoint-down(md) {
        position: absolute;
        overflow-y: scroll;
        padding-bottom: 5rem;
        border-radius: 0;
    }

    p {
        margin-bottom: 0;
        text-transform: uppercase;
        font-size: 1.5rem;
        font-weight: bold;
    }
}
</style>
