import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.raw("CREATE DOMAIN uint_256\
        AS NUMERIC NOT NULL\
        CHECK (VALUE >= 0 AND VALUE < 2^256)\
        CHECK (SCALE(VALUE) = 0);"
    );

}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.raw("DROP DOMAIN IF EXISTS uint_256")
}

