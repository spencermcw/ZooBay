import { Model, QueryContext } from 'objection'
import knexInstance from '..'
import { ethers } from 'ethers'

Model.knex(knexInstance)

import Listings from './Listings'

import baseAnimal from '../../ethereum/contracts/baseAnimal'
import hybridAnimal from '../../ethereum/contracts/hybridAnimal'
import oneOfOne from '../../ethereum/contracts/oneOfOne'

import { AssetContractsByAddress } from '../../ethereum/contracts'

const getAddress = ethers.utils.getAddress;


export default class Assets extends Model {
    metadata!: object;
    contract!: string;
    id!: string;

    static tableName: string = 'assets'

    async $afterFind(context: QueryContext) {
        this.metadata = await AssetContractsByAddress[this.contract].generateMetaData(this.id);
    }

    static get relationMappings() {
        return {
            listings: {
                relation: Model.ManyToManyRelation,
                modelClass: Listings,
                join: {
                    from: ['assets.id', 'assets.contract'],
                    through: {
                        from: ['listings_assets.assetId', 'listings_assets.assetContract'],
                        to: 'listings_assets.listingId',
                    },
                    to: 'listings.id'
                }
            },
        }
    }
}
