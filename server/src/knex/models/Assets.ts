import { Model } from 'objection'
import knexInstance from '..'
import { ethers } from 'ethers'

Model.knex(knexInstance)

import Listings from './Listings'

import baseAnimal from '../../ethereum/contracts/baseAnimal'
import hybridAnimal from '../../ethereum/contracts/hybridAnimal'

import hybridOOOIds from '../../1of1s/hybrid_1of1';
import baseOOOIds from '../../1of1s/base_1of1';

const getAddress = ethers.utils.getAddress;


export default class Assets extends Model {
    static tableName: string = 'assets'

    $formatJson = (json: object) => {
        const _json = super.$formatJson(json);
        if (getAddress(_json.contract) === getAddress(hybridAnimal.address)) {
            _json.metadata.oneOfOne = hybridOOOIds.has(_json.id);
        } else if (getAddress(_json.contract) === getAddress(baseAnimal.address)) {
            _json.metadata.oneOfOne = baseOOOIds.has(_json.id);
        } else {
            _json.metadata.oneOfOne = false;
        }
        return _json;
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
