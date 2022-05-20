import { createRouter, createWebHashHistory, NavigationGuard, stringifyQuery, parseQuery  } from 'vue-router';
import { store, GETTERS, ACTIONS } from '../store';
import qs from 'qs';

import { sessionAccounts } from '../lib';

import ViewListingsVue from '../layouts/ViewListings.vue';
import CreateListingVue from '../layouts/CreateListing.vue';

const requireLogin: NavigationGuard = async (to, from, next) => {
    if (sessionAccounts().length > 0) {
        await (store.dispatch(ACTIONS.CONNECT))
    }
    if(!store.getters[GETTERS.LOGGED_IN] && to.name !== 'Login') {
        return next({ name: 'Login' })
    } else {
        return next()
    }
}

const routes = [{
        path: '/',
        redirect: {
            name: 'ViewListings'
        }
    },
    {
        path: '/login',
        name: 'Login',
        component: () => import('../layouts/Login.vue')
    },
    {
        path: '/listings',
        name: 'ViewListings',
        component: ViewListingsVue,
    },
    {
        path: '/zoo',
        name: 'ViewZoo',
        component: () => import('../layouts/ViewZoo.vue'),
        beforeEnter: requireLogin
    },
    // {
    //     path: '/redeem',
    //     name: 'Redeem',
    //     component: () => import('../layouts/Redeem.vue'),
    //     beforeEnter: requireLogin
    // },
    {
        path: '/listings/:id',
        name: 'Listing',
        component: () => import('../layouts/Listing.vue')
    },
    {
        path: '/listings/create',
        name: 'CreateListing',
        component: CreateListingVue,
        beforeEnter: requireLogin
    },
    {
        path: '/manage/listings',
        name: 'ManageListings',
        component: () => import('../layouts/ManageListings.vue'),
        beforeEnter: requireLogin
    },
    {
        path: '/manage/bids',
        name: 'ManageBids',
        component: () => import('../layouts/ManageBids.vue'),
        beforeEnter: requireLogin
    },
    {
        path: '/manage/complete',
        name: 'ManageComplete',
        component: () => import('../layouts/ManageComplete.vue'),
        beforeEnter: requireLogin
    },
    {
        path: '/terms',
        name: 'Terms',
        component: () => import('../layouts/Terms.vue'),
    },
    {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        component: () => import('../layouts/NotFound.vue')
    },
]

const router = createRouter({
    history: createWebHashHistory(),
    routes,
    parseQuery: qs.parse as typeof parseQuery,
    stringifyQuery: qs.stringify as typeof stringifyQuery,
})

export default router
