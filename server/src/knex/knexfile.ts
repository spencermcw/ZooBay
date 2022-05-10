import type { Knex } from "knex";


// These keys are forcefully derived from NODE_ENV
const config: { [key: string]: Knex.Config } = {
  "development": {
    client: "pg",
    connection: {
      connectionString: process.env.PG_CONNECTION!,
    },
    migrations: {
      tableName: "knex_migrations"
    }
  },
  "staging": {
    client: "pg",
    connection: {
      connectionString: process.env.PG_CONNECTION!,
      ssl: { rejectUnauthorized: false, capath: './ca-certificate.crt' },
    },
    migrations: {
      tableName: "knex_migrations"
    }
  },
  "production": {
    client: "pg",
    connection: {
      connectionString: process.env.PG_CONNECTION!,
      ssl: { rejectUnauthorized: false, capath: './ca-certificate.crt' },
    },
    migrations: {
      tableName: "knex_migrations"
    }
  }
};

// module.exports = config;

export default config;
