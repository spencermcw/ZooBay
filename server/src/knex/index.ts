import knex  from 'knex'
import { knexSnakeCaseMappers } from 'objection'
import kf from './knexfile'

const {
    NODE_ENV
} = process.env;

console.log(NODE_ENV)
console.log(kf[NODE_ENV!]);

const instance = knex({
    ...kf[NODE_ENV!],
    ...knexSnakeCaseMappers()
})

export default instance
