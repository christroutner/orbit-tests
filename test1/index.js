/*
  orbitDB test

  Creates a publically writable DB.
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

  const db = await orbitdb.keyvalue('first-database', access)

  console.log(`database string: ${db.address.toString()}`)
  console.log(`db public key: ${db.key.getPublic('hex')}`)
})
