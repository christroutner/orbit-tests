/*
  orbitDB test

  Creates a publically writable DB.
  Adds a series of test key-value pairs.
*/

"use strict"

const IPFS = require('ipfs')
const OrbitDB = require('orbit-db')

// OrbitDB uses Pubsub which is an experimental feature
// and need to be turned on manually.
// Note that these options need to be passed to IPFS in
// all examples in this document even if not specfied so.
const ipfsOptions = {
  EXPERIMENTAL: {
    pubsub: true
  }
}

// Create IPFS instance
const ipfs = new IPFS(ipfsOptions)

ipfs.on('ready', async () => {
  // Create OrbitDB instance
  const orbitdb = new OrbitDB(ipfs)

  const access = {
    // Give write access to everyone
    write: ['*'],
  }

  const db = await orbitdb.keyvalue('orderbook', access)
  await db.load()

  console.log(`database string: ${db.address.toString()}`)
  console.log(`db public key: ${db.key.getPublic('hex')}`)

  // Add key-value pairs to the db.
  await db.put('peerId1', value1)
  await db.put('peerId2', value2)
  await db.put('peerId3', value3)

  // Get the key value pairs
  const gotVal = db.get('peerId1')
  console.log(`peerId1 value: ${JSON.stringify(gotVal,null,2)}`)

  // When the second database replicated new heads, query the database
  db.events.on('replicated', () => {
    console.log(`Databse replicated. Check for new prices.`)
  })
})


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
