import {
    InjectionKey
} from 'vue'
import {
    createStore,
    Store
} from 'vuex'
import {
    ethers
} from 'ethers'
import axios from 'axios'

import {
    provider
} from '../ethereum'
import contracts, {
    ContractByAddress
} from '../ethereum/contracts'
import type {
    State,
    Asset,
    Listing
} from '../types'

const {
    localStorage
} = window;

export const GETTERS = {
    LOGGED_IN: 'LOGGED_IN',
    ACTIVE_ACCOUNT_ADDRESS: 'ACTIVE_ACCOUNT_ADDRESS',
}

export const MUTATIONS = {
    SET_BALANCE: 'SET_BALANCE',
    SET_ALLOWANCE: 'SET_ALLOWANCE',
    SET_ACCOUNTS: 'SET_ACCOUNTS',
    SET_TXN_PENDING: 'SET_TXN_PENDING',
    SET_CONTRACT_APPROVAL: 'SET_CONTRACT_APPROVAL',
    SET_ASSETS: 'SET_ASSETS',
    SET_USER_ASSETS: 'SET_USER_ASSETS',
    SET_LISTINGS: 'SET_LISTINGS',
    SET_LISTINGS_TOTAL: 'SET_LISTINGS_TOTAL',
    SET_LISTING_ASSETS: 'SET_LISTING_ASSETS',
    SET_BURN: 'SET_BURN',
    CLAIM_LISTING: 'CLAIM_LISTING',
}

export const ACTIONS = {
    // General
    CONNECT: 'CONNECT',
    FETCH_BALANCE: 'FETCH_BALANCE',
    GET_ZOO: 'GET_ZOO',
    MINT: 'MINT',
    FETCH_BURN: 'FETCH_BURN',
    // Allowance
    FETCH_ALLOWANCE: 'FETCH_ALLOWANCE',
    INCREASE_ALLOWANCE: 'INCREASE_ALLOWANCE',
    // Approvals
    FETCH_APPROVALS: 'FETCH_APPROVALS',
    SET_APPROVAL: 'REQUEST_APPROVAL',
    // Assets
    FETCH_ASSETS: 'FETCH_ASSETS',
    FIND_ASSETS: 'FIND_ASSETS',
    // Listings
    FETCH_LISTINGS: 'FETCH_LISTINGS',
    FETCH_USER_LISTINGS: 'FETCH_USER_LISTINGS',
    FIND_LISTINGS: 'FIND_LISTINGS',
    CREATE_LISTING: 'CREATE_LISTING',
    CLAIM_LISTING: 'CLAIM_LISTING',
    CANCEL_LISTING: 'CANCEL_LISTING',
    // Bids
    CREATE_BID: 'CREATE_BID',
}

export const key: InjectionKey < Store < State >> = Symbol()

export const store = createStore < State > ({
    state: () => ({
        accounts: [],
        txnPending: false,
        zooBalance: '0',
        allowance: '0',
        burn: '0',
        approvals: {
            [contracts.BaseEgg.address]: {
                title: "Base Eggs",
                approval: false,
                contract: contracts.BaseEgg.address,
            },
            [contracts.BaseAnimal.address]: {
                title: "Base Animals",
                approval: false,
                contract: contracts.BaseAnimal.address,
            },
            [contracts.HybridEgg.address]: {
                title: "Hybrid Eggs",
                approval: false,
                contract: contracts.HybridEgg.address,
            },
            [contracts.HybridAnimal.address]: {
                title: "Hybrid Animals",
                approval: false,
                contract: contracts.HybridAnimal.address,
            },
            [contracts.EasterEgg.address]: {
                title: "Easter Egg 2022",
                approval: false,
                contract: contracts.EasterEgg.address,
            }
        },
        userAssets: [],
        listings: [],
        listingsTotal: 0,
    }),

    getters: {
        [GETTERS.LOGGED_IN]: (state) => {
            return state.accounts.length > 0
        },

        [GETTERS.ACTIVE_ACCOUNT_ADDRESS]: (state, getters) => {
            return (getters[GETTERS.LOGGED_IN] ? ethers.utils.getAddress(state.accounts[0]) : null)
        },
    },

    mutations: {
        [MUTATIONS.SET_BURN]: (state, burn: string) => {
            state.burn = burn;
        },

        [MUTATIONS.SET_BALANCE]: (state, balance: string) => {
            state.zooBalance = balance
        },

        [MUTATIONS.SET_ALLOWANCE]: (state, allowance: string) => {
            state.allowance = allowance
        },

        [MUTATIONS.SET_ACCOUNTS]: (state, accounts: string[]) => {
            const _accounts = accounts.map(account => ethers.utils.getAddress(account));
            state.accounts = _accounts;
            localStorage.setItem('ACCOUNTS', JSON.stringify(_accounts));
        },

        [MUTATIONS.SET_TXN_PENDING]: (state, txnPending: boolean) => {
            state.txnPending = txnPending
        },

        [MUTATIONS.SET_USER_ASSETS]: (state, assets: Asset[]) => {
            state.userAssets = assets;
        },

        [MUTATIONS.SET_CONTRACT_APPROVAL]: (state, payload: {
            contract: string;approval: boolean;
        }) => {
            const {
                contract,
                approval
            } = payload
            state.approvals[contract].approval = approval
        },

        [MUTATIONS.SET_LISTINGS]: (state, listings: Listing[]) => {
            state.listings = [...listings];
        },

        [MUTATIONS.SET_LISTINGS_TOTAL]: (state, total: number) => {
            state.listingsTotal = total;
        },

        [MUTATIONS.CLAIM_LISTING]: (state, listingId: string) => {
            const index = state.listings.findIndex(l => l.id === listingId);
            // This isn't true but it does the job since it's really just for UI
            state.listings[index].creatorClaimed = true;
            state.listings[index].bidderClaimed = true;
        },
    },

    actions: {
        [ACTIONS.FETCH_BALANCE]: ({
            commit,
            getters
        }) => {
            const account = getters[GETTERS.ACTIVE_ACCOUNT_ADDRESS]
            return contracts.Zoo.balanceOf(account)
                .then((balance: ethers.BigNumber) => commit(MUTATIONS.SET_BALANCE, balance.toString()))
                .catch(() => console.error("Could not FETCH_BALANCE"));
        },

        [ACTIONS.CONNECT]: ({
            commit,
            dispatch
        }) => {
            if (provider === null) {
                return alert("Please install the MetaMask browser plugin or use the Browser within the MetaMask app.")
            } else {
                // https://docs.metamask.io/guide/rpc-api.html#unrestricted-methods
                return provider.send('wallet_switchEthereumChain', [{ chainId: import.meta.env.VITE_MM_CHAIN_ID }])
                    .catch((e: any) => {
                        console.error(e)
                        if (e.code === 4902) {
                            return provider!.send('wallet_addEthereumChain', [{
                                chainId: import.meta.env.VITE_MM_CHAIN_ID,
                                chainName: import.meta.env.VITE_MM_CHAIN_NAME,
                                rpcUrls: [import.meta.env.VITE_MM_RPC_URL],
                            }])
                        }
                    })
                    .then(() => provider!.send('eth_requestAccounts', []))
                    .then(accounts => commit(MUTATIONS.SET_ACCOUNTS, accounts))
                    .then(() => dispatch(ACTIONS.FETCH_BALANCE))
                    .then(() => dispatch(ACTIONS.FETCH_ALLOWANCE))
                    .then(() => dispatch(ACTIONS.FETCH_APPROVALS))
                    .catch((e) => {
                        if (e.code === 4001) {
                            commit(MUTATIONS.SET_ACCOUNTS, []);
                            console.warn('User Rejected Login');
                        }
                    })
            }
        },

        [ACTIONS.FETCH_BURN]: ({ commit }) => {
            if (provider === null) {
                return;
            }
            return contracts.AuctionHouse.burned()
                .then((burn: ethers.BigNumber) => commit(MUTATIONS.SET_BURN, burn.toString()))
                .catch(console.error)
        },

        [ACTIONS.GET_ZOO]: ({
            commit,
            dispatch
        }) => {
            if (provider === null) {
                return alert("Please install the MetaMask browser plugin or use the Browser within the MetaMask app.")
            } else {
                commit(MUTATIONS.SET_TXN_PENDING, true);
                return contracts.Zoo.connect(provider.getSigner())
                    .mint(ethers.utils.parseEther('5000000000'))
                    .then((txn_: any) => txn_.wait())
                    .then(() => dispatch(ACTIONS.FETCH_BALANCE))
                    .then(() => alert('Faucet Tapped!'))
                    .catch(console.error)
                    .finally(() => commit(MUTATIONS.SET_TXN_PENDING, false));
            }
        },

        [ACTIONS.MINT]: ({
            commit,
            dispatch
        }, address) => {
            if (provider === null) {
                return alert("Please install the MetaMask browser plugin or use the Browser within the MetaMask app.")
            } else {
                commit(MUTATIONS.SET_TXN_PENDING, true);
                return ContractByAddress[address].connect(provider.getSigner())
                    .mint('5')
                    .then((txn_: any) => txn_.wait())
                    .then(() => dispatch(ACTIONS.FETCH_BALANCE))
                    .then(() => alert('Minted!'))
                    .catch(console.error)
                    .finally(() => commit(MUTATIONS.SET_TXN_PENDING, false));
            }
        },

        [ACTIONS.FETCH_ASSETS]: async ({
            commit,
            // getters
        }, account) => {
            // const account = getters[GETTERS.ACTIVE_ACCOUNT_ADDRESS]
            return axios.get(`${import.meta.env.VITE_API_URL}/assets/${account}`)
                .then(({
                    data: assets
                }) => commit(MUTATIONS.SET_USER_ASSETS, assets))
                .catch(console.error)
        },

        [ACTIONS.FETCH_ALLOWANCE]: ({
            commit,
            getters
        }) => {
            if (provider === null) {
                return alert("Please install the MetaMask browser plugin or use the Browser within the MetaMask app.")
            } else {
                const account = getters[GETTERS.ACTIVE_ACCOUNT_ADDRESS]
                return contracts.Zoo.connect(provider.getSigner())
                    .allowance(account, contracts.AuctionHouse.address)
                    .then((allowance: ethers.BigNumber) => commit(MUTATIONS.SET_ALLOWANCE, allowance.toString()))
                    .catch(console.error)
            }
        },

        [ACTIONS.INCREASE_ALLOWANCE]: ({
            commit,
            dispatch
        }, allowance: string) => {
            if (provider === null) {
                return alert("Please install the MetaMask browser plugin or use the Browser within the MetaMask app.")
            } else {
                commit(MUTATIONS.SET_TXN_PENDING, true)
                return contracts.Zoo.connect(provider.getSigner())
                    .increaseAllowance(contracts.AuctionHouse.address, allowance)
                    .then((txn_: any) => txn_.wait())
                    .then(() => dispatch(ACTIONS.FETCH_ALLOWANCE))
                    .then(() => alert('Auction House Allowance Increased!'))
                    .catch(console.error)
                    .finally(() => commit(MUTATIONS.SET_TXN_PENDING, false))
            }
        },

        [ACTIONS.FETCH_APPROVALS]: ({
            commit,
            state,
            getters
        }) => {
            const account = getters[GETTERS.ACTIVE_ACCOUNT_ADDRESS];
            return Promise.all(
                Object.keys(state.approvals).map((address: string) =>
                    ContractByAddress[address].isApprovedForAll(account, contracts.AuctionHouse.address)
                    .then((approval: boolean) => commit(MUTATIONS.SET_CONTRACT_APPROVAL, {
                        contract: address,
                        approval
                    }))
                    .catch(console.error)
                )
            );
        },

        [ACTIONS.CREATE_LISTING]: ({
            commit
        }, payload) => {
            if (provider === null) {
                return alert("Please install the MetaMask browser plugin or use the Browser within the MetaMask app.")
            } else {
                return new Promise < void > ((resolve, reject) => {
                    const {
                        contracts: _contracts,
                        tokenIds,
                        duration,
                        price,
                        minBid
                    } = payload
                    commit(MUTATIONS.SET_TXN_PENDING, true)
                    contracts.AuctionHouse.connect(provider!.getSigner())
                        .createListing(_contracts, tokenIds, duration, price, minBid)
                        .then((txn_: any) => txn_.wait())
                        .then(() => alert('Listing Created!'))
                        .then(() => resolve())
                        .catch(reject)
                        .finally(() => commit(MUTATIONS.SET_TXN_PENDING, false))
                })
            }
        },

        [ACTIONS.CLAIM_LISTING]: ({
            commit
        }, listingId: string) => {
            if (provider === null) {
                return alert("Please install the MetaMask browser plugin or use the Browser within the MetaMask app.")
            } else {
                commit(MUTATIONS.SET_TXN_PENDING, true)
                return new Promise<void>((resolve, reject) => {
                    contracts.AuctionHouse.connect(provider!.getSigner())
                        .claimListing(listingId)
                        .then((txn_: any) => txn_.wait())
                        .then(() => alert('Listing Claimed!'))
                        .then(() => resolve())
                        .catch(reject)
                        .finally(() => commit(MUTATIONS.SET_TXN_PENDING, false))
                });
            }
        },

        [ACTIONS.CANCEL_LISTING]: ({
            commit
        }, listingId: string) => {
            if (provider === null) {
                return alert("Please install the MetaMask browser plugin or use the Browser within the MetaMask app.")
            } else {
                commit(MUTATIONS.SET_TXN_PENDING, true)
                return contracts.AuctionHouse.connect(provider.getSigner())
                    .cancelListing(listingId)
                    .then((txn_: any) => txn_.wait())
                    .then(() => alert('Listing Cancelled!'))
                    .catch(console.error)
                    .finally(() => commit(MUTATIONS.SET_TXN_PENDING, false))
            }
        },

        [ACTIONS.FETCH_LISTINGS]: async ({
            commit
        }, query) => {
            return axios.get(`${import.meta.env.VITE_API_URL}/listings`, {
                    params: query
                })
                .then((response: any) => {
                    commit(MUTATIONS.SET_LISTINGS, response.data);
                })
                .catch(console.error)
        },

        [ACTIONS.FIND_ASSETS]: async ({
            commit
        }, query) => {
            return axios.get(`${import.meta.env.VITE_API_URL}/assets`, {
                    params: query
                })
                .then((response: any) => {
                    commit(MUTATIONS.SET_ASSETS, response.data.results);
                    commit(MUTATIONS.SET_LISTINGS_TOTAL, response.data.total);
                })
                .catch(console.error)
        },

        [ACTIONS.FIND_LISTINGS]: async ({
            commit
        }, query) => {
            return axios.get(`${import.meta.env.VITE_API_URL}/listings/search`, {
                    params: query
                })
                .then((response: any) => {
                    commit(MUTATIONS.SET_LISTINGS, response.data.results);
                    commit(MUTATIONS.SET_LISTINGS_TOTAL, response.data.total);
                })
                .catch(console.error)
        },

        [ACTIONS.FETCH_USER_LISTINGS]: async ({
            commit,
            getters
        }) => {
            const account = getters[GETTERS.ACTIVE_ACCOUNT_ADDRESS];
            return axios.get(`${import.meta.env.VITE_API_URL}/listings/account/${account}`)
                .then((response: any) => {
                    commit(MUTATIONS.SET_LISTINGS, response.data);
                })
                .catch(console.error)
        },

        [ACTIONS.SET_APPROVAL]: ({
            commit,
            dispatch
        }, payload: {
            contract: string;approval: boolean
        }) => {
            if (provider === null) {
                return alert("Please install the MetaMask browser plugin or use the Browser within the MetaMask app.")
            } else {
                const {
                    contract,
                    approval
                } = payload;
                commit(MUTATIONS.SET_TXN_PENDING, true);
                return ContractByAddress[contract].connect(provider.getSigner())
                    .setApprovalForAll(contracts.AuctionHouse.address, approval)
                    .then((txn_: any) => txn_.wait())
                    .then(() => alert('Approval Requested!'))
                    .then(() => dispatch(ACTIONS.FETCH_APPROVALS))
                    .catch(console.error)
                    .finally(() => commit(MUTATIONS.SET_TXN_PENDING, false));
            }
        },

        [ACTIONS.CREATE_BID]: ({
            commit,
            dispatch
        }, payload: {
            listingId: string;amount: string;
        }) => {
            if (provider === null) {
                return alert("Please install the MetaMask browser plugin or use the Browser within the MetaMask app.")
            } else {
                const {
                    listingId,
                    amount
                } = payload;
                commit(MUTATIONS.SET_TXN_PENDING, true);
                return contracts.AuctionHouse.connect(provider.getSigner())
                    .createBid(listingId, amount)
                    .then((txn_: any) => txn_.wait())
                    .then(() => alert('Bid Created!'))
                    .then(() => dispatch(ACTIONS.FETCH_LISTINGS, {
                        id: listingId
                    }))
                    .catch(console.error)
                    .finally(() => commit(MUTATIONS.SET_TXN_PENDING, false));
            }
        },
    },
})

export default store
