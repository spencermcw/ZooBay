import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('assets', table => {
        table.specificType('id', 'uint_256').notNullable();
        table.string('contract', 42).notNullable();
        table.json('metadata').notNullable().defaultTo(JSON.stringify({}));
        table.primary(['id', 'contract']);
        table.index(['id', 'contract']);
    });
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTableIfExists('assets');
}

