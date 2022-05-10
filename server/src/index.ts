const {
    PORT,
    HOST,
    ZOO_BAY_URL,
    NODE_ENV
} = process.env;

console.log(NODE_ENV);

import express from 'express'
import cors from 'cors'
import bearerToken from 'express-bearer-token';

import router from './router'

import './watchers'

const app = express();

app.use(bearerToken());
app.use(express.json());

app.use(cors({ origin: ZOO_BAY_URL! }));

app.use(router);

app.listen(Number(PORT!), HOST!, () => {
    console.log(`Listening @ ${HOST}:${PORT}`);
});

export default app
