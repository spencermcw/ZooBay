<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

import { MUTATIONS, ACTIONS, GETTERS } from './store'
import { key } from './store'

import WalletVue from './components/Wallet.vue'
import SpinnerVue from "./components/Spinner.vue"

import { humanizeEther, sessionAccounts } from './lib'
import contracts from './ethereum/contracts'
import BannerImage from './assets/images/banner.png'
import Egg from './assets/images/czegg.png'
import { provider } from './ethereum'

const vueMode = import.meta.env.MODE;

const router = useRouter()
const store = useStore(key)

window.addEventListener('resize', () => { innerWidth.value = window.innerWidth });

if (window.ethereum) {
    window.ethereum.on('accountsChanged', (accounts: string[]) => {
        store.commit(MUTATIONS.SET_ACCOUNTS, accounts)
        if (accounts.length > 0) {
            store.dispatch(ACTIONS.FETCH_ALLOWANCE)
            store.dispatch(ACTIONS.FETCH_APPROVALS)
            store.dispatch(ACTIONS.FETCH_BALANCE)
            router.go(0);
        } else {
            router.push({ name: 'Login' })
        }
    })
}

const drawerOpen = ref(true);
const refreshingBalance = ref(false);
const innerWidth = ref(window.innerWidth);
const banner = ref<HTMLElement | null>(null);

const zooBalance = computed(() => store.state.zooBalance);
const burn = computed(() => store.state.burn);
const isMobile = computed(() => innerWidth.value < 992);
const toggleClass = computed(() => drawerOpen.value ? 'bi-arrow-left-short' : 'bi-list');
const loggedIn = computed(() => store.getters[GETTERS.LOGGED_IN]);

const onNav = () => { if (isMobile.value) drawerOpen.value = false }
const onToggle = () => { drawerOpen.value = !drawerOpen.value }

const doTapFaucet = () => store.dispatch(ACTIONS.GET_ZOO)
const doMint = (address: string) => store.dispatch(ACTIONS.MINT, address)

onMounted(() => {
    drawerOpen.value = !isMobile.value;
    store.dispatch(ACTIONS.FETCH_BURN);
    if (sessionAccounts().length > 0) {
        store.dispatch(ACTIONS.CONNECT)
            .catch(console.error)
    }
    if(provider !== null) {
        contracts.AuctionHouse.on("ListingClaimed", () => {
            store.dispatch(ACTIONS.FETCH_BURN);
        })
    }
});

const refreshBalance = () => {
    refreshingBalance.value = true
    store.dispatch(ACTIONS.FETCH_BALANCE)
        .catch(console.error)
        .finally(() => refreshingBalance.value = false)
}

const scrollToTop = () => {
    if (banner.value !== null) {
        banner.value.scrollIntoView({
            behavior: 'smooth'
        });
    }
}

const navs: {
    title: string;
    children: {
        title: string;
        icon: string;
        to?: string | { name: string; };
        href?: string;
    }[];
}[] = [{
    title: 'Explore',
    children: [{
        title: 'All Listings',
        icon: 'bi-mouse',
        to: '/listings'
    }, {
        title: 'My Zoo',
        icon: 'bi-binoculars',
        to: '/zoo'
    }, {
        title: 'Redeem 1/1s',
        icon: 'bi-award',
        to: '/redeem'
    }],
}, {
    title: 'Auctions',
    children: [{
        title: 'Create Listing',
        icon: 'bi-plus-square',
        to: '/listings/create'
    }, {
        title: 'My Listings',
        icon: 'bi-pencil',
        to: { name: 'ManageListings' }
    }, {
        title: 'My Bids',
        icon: 'bi-ticket-perforated',
        to: { name: 'ManageBids' }
    }, {
        title: 'Escrow',
        icon: 'bi-clock',
        to: { name: 'ManageComplete' }
    }],
}, {
    title: 'Resources',
    children: [{
        title: 'Terms & Privacy',
        icon: 'bi-shield-exclamation',
        to: { name: 'Terms' }
    }, {
        title: 'Guides',
        icon: 'bi-life-preserver',
        href: 'https://cryptozoo.zendesk.com/hc/en-us/sections/5056896522644-General'
    }, {
        title: 'Whitepaper',
        icon: 'bi-book',
        href: 'https://whitepaper.zoobay.io'
    }],
}]
</script>


<template>
    <div id="dapp" class="app">
        <nav class="app-nav">
            <i class="bi nav-toggle" :class="toggleClass" @click="onToggle"></i>
            <div class="d-flex align-items-center">
                <WalletVue></WalletVue>
            </div>
        </nav>

        <div class="app-nav__drawer" :class="{ 'open': drawerOpen }">
            <div class="d-flex app-nav__title align-items-center">
                <img :src="Egg" alt="" class="logo">
                <span>ZooBay</span>
            </div>

            <div class="app-nav__links">
                <div class="app-nav__section" v-for="section in navs">
                    <span class="app-nav__section-title">{{ section.title }}</span>
                    <ul class="app-nav__section-links">
                        <li v-for="child in section.children">
                            <router-link v-if="child.to" :to="child.to" class="app-nav__section-link" @click="onNav">
                                <i class="bi me-2" :class="child.icon"></i>
                                {{ child.title }}
                            </router-link>
                            <a v-if="child.href" :href="child.href" class="app-nav__section-link" @click="onNav" target="_blank">
                                <i class="bi me-2" :class="child.icon"></i>
                                {{ child.title }}
                                <i class="bi bi-box-arrow-up-right"></i>
                            </a>
                        </li>
                    </ul>
                </div>
            </div>

            <div class="d-grid gap-2 mt-3">
                <button class="btn cz-btn--primary" v-if="loggedIn" @click="refreshBalance">
                    <SpinnerVue :spinning="refreshingBalance"></SpinnerVue>
                    Balance: <strong>{{ humanizeEther(zooBalance.toString()) }} $ZOO</strong>
                </button>

                <a href="https://twitter.com/zoobayofficial" target="_blank">
                    <button class="btn cz-btn--twitter">
                        <i class="bi bi-twitter fs-4"></i>
                        <span class="h4 mb-0 mx-2">Twitter</span>
                    </button>
                </a>

                <a href="https://discord.gg/Eh7SuMSKdK" target="_blank">
                    <button class="btn cz-btn--discord">
                        <i class="bi bi-discord fs-4"></i>
                        <span class="h4 mb-0 mx-2">Discord</span>
                    </button>
                </a>

                <p>
                    🔥
                    <span class="gold wb">
                        {{ humanizeEther(burn) }}
                    </span>
                    $ZOO Burned
                </p>

                <div class="d-grid gap-2" v-if="vueMode !== 'production'">
                    <button class="btn cz-btn--primary" @click="doTapFaucet">Tap $ZOO Faucet</button>
                    <button class="btn cz-btn--primary" @click="doMint(contracts.BaseEgg.address)">Mint 5 Base Eggs</button>
                    <button class="btn cz-btn--primary" @click="doMint(contracts.HybridEgg.address)">Mint 5 Hybrid Eggs</button>
                    <button class="btn cz-btn--primary" @click="doMint(contracts.BaseAnimal.address)">Mint 5 Base Animals</button>
                    <button class="btn cz-btn--primary" @click="doMint(contracts.HybridAnimal.address)">Mint 5 Hybrid Animals</button>
                </div>
            </div>
        </div>

        <div class="app-content" :class="{ 'nav-open': drawerOpen }">
            <div class="banner" ref="banner">
                <img :src="BannerImage" alt="" class="banner__image">
            </div>
            <router-view></router-view>
        </div>

        <button class="cz-btn cz-btn--primary back" @click="router.go(-1)">
            <i class="bi bi-chevron-left"></i>
        </button>

        <button class="cz-btn cz-btn--primary to-top" @click="scrollToTop">
            <i class="bi bi-chevron-up"></i>
        </button>
    </div>
</template>



<style lang="scss" scoped>
@import './assets/style/bootstrap/bootstrap-utilities.scss';
@import './assets/style/abstracts/overrides';
@import './assets/style/abstracts/themes';
@import './assets/style/components/buttons';

$navbar-height: 3rem;
$navbar-width-lg: 300px;
$nav-drawer-padding: 20px;

.app {
    height: 100vh;
    &-viewport {
        display: flex;
        overflow-x: hidden;
        width: 100vw;
        height: 100vh;
    }
    &-content {
        position: absolute;
        margin-top: 3rem;
        height: calc(100vh - 3rem);
        width: 100vw;
        overflow-y: scroll;
        overflow-x: hidden;
        transition: all .4s;
        padding-bottom: 5vh;
        &.nav-open {
            overflow: hidden;
            &::before{
                content: " ";
                display: block;
                position: fixed;
                top: $navbar-height;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba($black, 0.8);
                z-index: 1900;
            }
            @include media-breakpoint-up(lg) {
                width: calc(100vw - $navbar-width-lg);
                overflow-y: scroll;
                margin-left: $navbar-width-lg;
                &::before{
                    display: none;
                }
            }
        }
    }
    &-nav {
        display: flex;
        position: fixed;
        top: 0;
        left: 0;
        align-items: center;
        justify-content: space-between;
        background-color: map-get($map: $custom-theme-colors, $key: "cz-dark1");
        // border-right: 2px solid map-get($map: $custom-theme-colors, $key: "cz-gold-2");
        color: $light;
        width: 100vw;
        height: $navbar-height;
        padding: 0.5rem;
        box-shadow: 0 4px 8px rgba($dark, 0.5);
        z-index: 2000;
        border-bottom: 1px solid black;

        .nav-toggle {
            font-size: 2rem;
            cursor: pointer;
        }

        &__title {
            margin: 1rem;
            img.logo {
                max-height: 2rem;
                margin-right: 1rem;
            }
            span {
                text-transform: uppercase;
                font-weight: 500;
                font-size: 1.2rem;
            }
        }

        &__section {
            &-title {
                display: block;
                text-transform: uppercase;
                margin-top: 1.5rem;
                margin-left: 1rem;
                color: darken($color: $light, $amount: 25%);
                font-weight: 500;
            }
            &-links {
                list-style: none;
                padding: 0;
                margin: 0; 
            }
            &-link {
                display: block;
                padding: 5px 0;
                padding-left: 2rem;
                width: 100%;
                text-decoration: none;
                color: $light;
                &.router-link-active {
                    background: $btn-gradient;
                }
                & > .bi-box-arrow-up-right {
                    font-size: 0.5rem;
                }
            }
        }

        &__drawer {
            position: fixed;
            margin-top: 3rem;
            height: calc(100vh - 3rem);
            width: 85vw;
            top: 0;
            left: -85vw;
            background-color: map-get($custom-theme-colors, "cz-dark2");
            // background-color: map-get($map: $custom-theme-colors, $key: "cz-dark1");
            // border-right: 2px solid map-get($map: $custom-theme-colors, $key: "cz-gold2");
            padding: 0 0 3rem 0;
            transition: all .4s;
            z-index: 2000;
            overflow-y: auto;
            overflow-x: hidden;
            @include media-breakpoint-up(lg) {
                width: $navbar-width-lg;
                left: -$navbar-width-lg;
            }
            &.open {
                left: 0;
            }
            .btn, p {
                margin: 0 $nav-drawer-padding;
                width: calc(100% - ($nav-drawer-padding * 2));
            }
            & > ul {
                list-style: none;
                padding: 0;

                & > li {
                    margin-bottom: 1rem;
                }
                
                .nav-link {
                    color: $light;
                    text-decoration: none;
                }
            }
        }
    }
}

.banner {
    position: relative;
    height: fit-content;
    // border-width: 0 0 3px 0;
    // border-style: solid;
    // border-bottom: 3px solid map-get($map: $custom-theme-colors, $key: "cz-gold1");
    // box-shadow: 0 4px 12px rgba($black, 0.8);

    &__image {
        width: 100%;
    }
}


@mixin floating-button {
    display: block;
    position: fixed;
    border-radius: 100rem;
    width: 3rem;
    height: 2rem;
    z-index: 100;
    box-shadow: 0 4px 8px rgba(#000, 0.8);
}

button.to-top {
    @include floating-button();
    bottom: 1rem;
    right: 1rem;
    @include media-breakpoint-up(md) {
        right: 2rem;
    }
}

button.back {
    @include floating-button();
    bottom: 1rem;
    left: 1rem;
    @include media-breakpoint-up(md) {
        display: none;
    }
}

</style>
