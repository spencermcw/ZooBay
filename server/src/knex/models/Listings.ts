import { Model } from 'objection'
import dayjs from 'dayjs'
import knexInstance from '..'

Model.knex(knexInstance)

import Bids from './Bids'
import Assets from './Assets'

export default class Listings extends Model {
    static tableName: string = 'listings'

    $formatJson = (json: object) => {
        const _json = super.$formatJson(json);
        _json.expired = dayjs.unix(Number(_json.expiresAt)).isBefore(dayjs())
        _json.buyNowOnly = _json.price === _json.minBid;
        return _json;
    }

    static get relationMappings() {
        return {
            bids: {
                relation: Model.HasManyRelation,
                modelClass: Bids,
                join: {
                    from: 'listings.id',
                    to: 'bids.listingId'
                },
            },
            assets: {
                relation: Model.ManyToManyRelation,
                modelClass: Assets,
                join: {
                    from: 'listings.id',
                    through: {
                        from: 'listings_assets.listingId',
                        to: ['listings_assets.assetId', 'listings_assets.assetContract']
                    },
                    to: ['assets.id', 'assets.contract']
                }
            },
        }
    }
}

