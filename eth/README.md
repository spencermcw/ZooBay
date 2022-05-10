# ZooBay Ethereum Deployment

## Quickstart

Spin up a local EVM and Postgresql database.

Requirements
- Docker
- Docker Compose


## Quickstart

1. Configure `.env`
2. Install Dependencies
3. Run Containers
4. Deploy Contracts

```
$ cp env_vars .env
$ npm i
$ docker compose up -d
$ npm run deploy
```

## Ethereum Network
A local EVM Can be independently spun up using the `eth.Dockerfile`.

## PostgreSQL
A local Postgres database can be independently spun up using the `pg.Dockerfile`.
