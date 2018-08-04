/*
  A random walk price server based on Express.js.
*/

"use strict"

const express = require("express");
const dbLib = require("./lib/db.js"); // handle all db stuff.

const util = require("util");
util.inspect.defaultOptions = {
  showHidden: true,
  colors: true,
};

// Global Variables
const app = express();
const port = 6543;
let db;

async function start() {
  try {

    // Open the Database
    db = await dbLib.openDb();

    // Start up the Express web server
    app.listen(port).on("error", expressErrorHandler);
    console.log('Express started on port ' + port);

    // Handle generic errors thrown by the express application.
    function expressErrorHandler(err) {
      if (err.code === "EADDRINUSE")
        console.error(`Port ${port} is already in use. Is this program already running?`);
      else console.error(JSON.stringify(err, null, 2));

      console.error("Express could not start!");
      process.exit(0);
    }

    // Allow any computer to access this API.
    app.use(function(req, res, next) {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
      next();
    });

    // Initial price
    let price = 1000.00;

    // Periodically adjust the price, randomly.
    setInterval(function() {
      // Generate a random number between -1% an 1%.
      const rndNum = (2*Math.random() - 1)/100;

      // Calculate a new price.
      price = price * (1 - rndNum);

      //console.log(`price: ${price}`);
    }, 1000);

    // Price API endpoint.
    app.get("/price", function(request, response, next) {
      response.send(`${price}`);
    });

    app.get("/orderbook", function(request, response, next) {
      response.send(`${db.address.toString()}`)
    })

  } catch(err) {
    console.error(`Error in price-server.js: `,err);
  }
}
start();

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
