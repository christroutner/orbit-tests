/*
  This is the master node that creates the initial database. It is configured to
  use the Circuit Relay feature to help nodes communicate with one another.
*/

"use strict";

// CUSTOMIZE THESE VARIABLES
const DB_NAME = "example878";

const IPFS = require("ipfs");
const OrbitDB = require("orbit-db");

const creatures = ["🐙", "🐷", "🐬", "🐞", "🐈", "🙉", "🐸", "🐓"];

console.log("Starting...");

const ipfs = new IPFS({
  repo: "./orbitdb/examples/ipfs",
  start: true,
  EXPERIMENTAL: {
    pubsub: true
  },
  relay: {
    enabled: true, // enable circuit relay dialer and listener
    hop: {
      enabled: true // enable circuit relay HOP (make this node a relay)
    }
  }
});

ipfs.on("error", err => console.error(err));

ipfs.on("replicated", () => {
  console.log(`replication event fired`);
});

ipfs.on("ready", async () => {
  let db;

  try {
    const orbitdb = await OrbitDB.createInstance(ipfs, {
      directory: "./orbitdb/examples/eventlog"
    });

    const options = {
      accessController: {
        write: ["*"]
      }
    }

    db = await orbitdb.eventlog(DB_NAME, options);
    await db.load();

    console.log(`db id: ${db.id}`);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }

  const query = async () => {
    const index = Math.floor(Math.random() * creatures.length);
    const userId = Math.floor(Math.random() * 900 + 100);

    try {
      const entry = { avatar: creatures[index], userId: userId };
      console.log(`Adding ${entry.avatar} ${entry.userId} to DB.`);
      await db.add(entry);
      const latest = db.iterator({ limit: 5 }).collect();
      let output = ``;
      output += `[Latest Visitors]\n`;
      output += `--------------------\n`;
      output += `ID  | Visitor\n`;
      output += `--------------------\n`;
      output +=
        latest
          .reverse()
          .map(
            e => e.payload.value.userId + " | " + e.payload.value.avatar + ")"
          )
          .join("\n") + `\n`;
      console.log(output);
    } catch (e) {
      console.error(e);
      process.exit(1);
    }
  };

  setInterval(query, 1000 * 30);
});
