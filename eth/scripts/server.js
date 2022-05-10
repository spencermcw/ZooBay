require('dotenv').config()
const ganache = require("ganache-cli");

const PORT = 8545

const server = ganache.server({
    mnemonic: process.env.GANACHE_MNEMONIC
})

console.log(process.env.GANACHE_MNEMONIC)

server.listen(PORT, function(err, blockchain) {
    if(err)
        console.error(err)
    console.log(`Local Network Started @ http://localhost:${PORT}`)
})
