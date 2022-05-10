import { Model } from 'objection'
import knexInstance from '..'

Model.knex(knexInstance)

export default class ListingAssets extends Model {
    static tableName: string = 'listings_assets'
    static idColumn: string | string[] = ['listing_id', 'asset_id', 'asset_contract']
}
