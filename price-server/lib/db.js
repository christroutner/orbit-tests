/*
  orbitDB test

  Creates a publically writable DB.
  Adds a series of test key-value pairs.
*/

"use strict"

const IPFS = require('ipfs')
const OrbitDB = require('orbit-db')
let ipfs // handle for IPFS instance.
let db // handle for orbit DB.

const util = require("util");
util.inspect.defaultOptions = {
  showHidden: true,
  colors: true,
};


module.exports = {
  openDb
}


// OrbitDB uses Pubsub which is an experimental feature
// and need to be turned on manually.
// Note that these options need to be passed to IPFS in
// all examples in this document even if not specfied so.
const ipfsOptions = {
  EXPERIMENTAL: {
    pubsub: true
  }
}

// Returns a promise that resolves to a handle of the DB.
function openDb() {
  return new Promise(function(resolve, reject) {
    try {
      // Create IPFS instance
      ipfs = new IPFS(ipfsOptions)

      ipfs.on('ready', async () => {
        //ipfs.swarm.connect('/dns4/ws-star.discovery.libp2p.io/tcp/443/wss/p2p-websocket-star');
        ipfs.swarm.connect('/ip4/198.46.197.197/tcp/4001/ipfs/QmdXiwDtfKsfnZ6RwEcovoWsdpyEybmmRpVDXmpm5cpk2s'); // Connect to ipfs.p2pvps.net

        // Create OrbitDB instance
        const orbitdb = new OrbitDB(ipfs)

        const access = {
          // Give write access to everyone
          write: ['*'],
        }

        // Load the DB.
        db = await orbitdb.keyvalue('orderbook01', access)
        await db.load()

        console.log(`database string: ${db.address.toString()}`)
        console.log(`db public key: ${db.key.getPublic('hex')}`)

        // React when the database is updated.
        db.events.on('replicated', () => {
          console.log(`Databse replicated. Check for new prices.`)
        })

        return resolve(db);
      })

    } catch(err) {
      return reject(err);
    }
  })
}


// Example key-value pairs:
const value1 = {
  qty: 10,
  price: 99,
  buysell: true // true = buy, false = sell
}

const value2 = {
  qty: 9,
  price: 90,
  buysell: true
}

const value3 = {
  qty: 10,
  price: 110,
  buysell: false
}
