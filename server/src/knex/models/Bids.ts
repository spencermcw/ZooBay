import { Model, QueryBuilder } from 'objection'
import knexInstance from '..'

Model.knex(knexInstance)

export default class Bids extends Model {
    static tableName: string = 'bids'

    static get modifiers() {
        return {
            ordered(builder: QueryBuilder<Bids>) {
                builder.orderBy('id', 'DESC');
            }
        }
    }
}
