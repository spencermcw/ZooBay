FROM node:16.14.2

WORKDIR /ganache

COPY . .

RUN npm i

CMD ["node", "scripts/server.js"]
