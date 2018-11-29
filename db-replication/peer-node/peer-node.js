'use strict'

// CUSTOMIZE THESE VARIABLES
const MASTER_MULTIADDR = "/ip4/162.243.158.213/tcp/4002/ipfs/QmeiNB8wUbS61976FBr22hRrGyRdq4jA3Pm3P2Rjz1G1oq"
const DB_ADDRESS = "/orbitdb/QmcGyFSjcMu9qtQwhc53ccuAquB6QoQ1DqcK1SEVsCSed6/example565656"

const IPFS = require('ipfs')
const OrbitDB = require('orbit-db')

const creatures = ['🐙', '🐷', '🐬', '🐞', '🐈', '🙉', '🐸', '🐓']

console.log("Starting...")

const ipfs = new IPFS({
  repo: './orbitdb/examples/ipfs',
  start: true,
  EXPERIMENTAL: {
    pubsub: true,
  },
})

ipfs.on('error', (err) => console.error(err))

ipfs.on("replicated", () => {
      console.log(`replication event fired`);
})

ipfs.on('ready', async () => {
  let db

  await ipfs.swarm.connect(MASTER_MULTIADDR)

  try {
    const orbitdb = new OrbitDB(ipfs, './orbitdb/examples/eventlog')
    db = await orbitdb.eventlog(DB_ADDRESS)
    await db.load()
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
