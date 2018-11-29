/*
  This is the master node that creates the initial database. It is configured to
  use the Circuit Relay feature to help nodes communicate with one another.
*/

'use strict'

// CUSTOMIZE THESE VARIABLES
const DB_NAME = "example5343234"

const IPFS = require('ipfs')
const OrbitDB = require('orbit-db')

const creatures = ['🐙', '🐷', '🐬', '🐞', '🐈', '🙉', '🐸', '🐓']

console.log("Starting...")

const ipfs = new IPFS({
  repo: './orbitdb/examples/ipfs',
  start: true,
  EXPERIMENTAL: {
    pubsub: true,
    relay: {
      enabled: true, // enable circuit relay dialer and listener
      hop: {
        enabled: true // enable circuit relay HOP (make this node a relay)
      }
    }
  },
})

ipfs.on('error', (err) => console.error(err))

ipfs.on("replicated", () => {
      console.log(`replication event fired`);
})

ipfs.on('ready', async () => {
  let db

  try {
    const access = {
        // Give write access to everyone
        write: ["*"]
      };

    const orbitdb = new OrbitDB(ipfs, './orbitdb/examples/eventlog')
    db = await orbitdb.eventlog(DB_NAME, access)
    await db.load()

    console.log(`db id: ${db.id}`)

  } catch (e) {
    console.error(e)
    process.exit(1)
  }

  const query = async () => {
    const index = Math.floor(Math.random() * creatures.length)
    const userId = Math.floor(Math.random() * 900 + 100)

    try {
      await db.add({ avatar: creatures[index], userId: userId })
      const latest = db.iterator({ limit: 5 }).collect()
      let output = ``
      output += `[Latest Visitors]\n`
      output += `--------------------\n`
      output += `ID  | Visitor\n`
      output += `--------------------\n`
      output += latest.reverse().map((e) => e.payload.value.userId + ' | ' + e.payload.value.avatar + ')').join('\n') + `\n`
      console.log(output)
    } catch (e) {
      console.error(e)
      process.exit(1)
    }
  }

  setInterval(query, 1000*30)
})
