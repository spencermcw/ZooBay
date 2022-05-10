import { Knex } from "knex";


export async function up(knex: Knex): Promise<void[]> {
    return Promise.all<void>([
        knex.schema.createTable('bids', table => {
            table.specificType('id', 'uint_256').unique().primary();
            table.string('bidder', 42);
            table.specificType('amount', 'uint_256').notNullable();
            table.specificType('timestamp', 'uint_256').notNullable();
            table.specificType('listing_id', 'uint_256').notNullable();
            table.foreign('listing_id').references('listings.id');
            table.index(['id', 'bidder', 'listing_id']);
        }),
    ]);
}


export async function down(knex: Knex): Promise<void[]> {
    return Promise.all<void>([
        knex.schema.dropTableIfExists('bids'),
    ])
}

