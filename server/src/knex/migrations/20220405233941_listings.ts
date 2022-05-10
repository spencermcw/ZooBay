import { Knex } from "knex";


export async function up(knex: Knex): Promise<void[]> {
    return Promise.all([
        knex.schema.createTable('listings', table => {
            table.specificType('id', 'uint_256').unique().primary();
            table.string('creator', 42).notNullable();
            table.specificType('created_at', 'uint_256').notNullable();
            table.specificType('expires_at', 'uint_256').notNullable();
            table.specificType('price', 'uint_256').notNullable();
            table.specificType('min_bid', 'uint_256').notNullable();
            table.boolean('creator_claimed').notNullable();
            table.boolean('bidder_claimed').notNullable();
            table.index(['id', 'creator'])
        }),
        knex.schema.createTable('listings_assets', table => {
            table.specificType('listing_id', 'uint_256').index().notNullable();
            table.specificType('asset_id', 'uint_256').index().notNullable();
            table.string('asset_contract', 42).notNullable();
            table.primary(['listing_id', 'asset_id', 'asset_contract']);
            table.foreign(['listing_id', 'asset_id', 'asset_contract']).references(['listings.id', 'assets.id', 'assets.contract']);
            table.index(['listing_id', 'asset_id', 'asset_contract']);
        }),
    ])
}


export async function down(knex: Knex): Promise<void[]> {
    return Promise.all([
        knex.schema.dropTableIfExists('listings_assets'),
        knex.schema.dropTableIfExists('listings'),
    ])
}

