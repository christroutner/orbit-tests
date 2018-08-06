/*
  This library is concerned with DOM management and display of the order book
  database.
*/

"use strict"

// This function resets the order book table to the way it was when the DOM
// was first loaded.
function resetTable() {
  //console.log('resetting the table.');

  const orderTable = $('#orderTable');
  const allRows = orderTable.find('tr');

  // Loop through each row in the table.
  for(var i=0; i < allRows.length; i++) {
    const thisRow = $(allRows[i]);
    const thisRowsId = thisRow.prop('id');

    if(thisRowsId === "trHeader") continue;
    if(thisRowsId === "trScaffold") continue;

    thisRow.remove();
  }
}


// Display orders from the orderbook in the table.
async function showOrders() {
  try {
    //console.log('showing orders');

    // Exit if the DB can not be validated.
    const dbIsValid = await validateDb();
    if(!dbIsValid) return;

    // Get the list of peers.
    let peers = db.get('peers')
    if(!peers) return; // Exit if DB has not peers.

    const myHandle = $('#peerId').val();

    // Get orders for each peer.
    for(var i = 0; i < peers.length; i++) {
      const thisPeer = peers[i]

      let orders = db.get(thisPeer)
      if(!orders) orders = [];

      //console.log(`Order belonging to ${thisPeer}: ${JSON.stringify(orders)}`)

      // Loop through each order.
      for(var j=0; j < orders.length; j++) {
        const thisOrder = orders[j];
        const thisRow = $('#trScaffold').clone();
        thisRow.prop('id', ''); // Remove the ID from the clone.

        thisRow.find('.tdPeer').text(thisPeer);

        if(thisOrder.buysell)
          thisRow.find('.tdOrder').text('Buy')
        else
          thisRow.find('.tdOrder').text('Sell')

        thisRow.find('.tdPrice').text(thisOrder.price)

        thisRow.find('.tdQty').text(thisOrder.qty)

        const cancelButton = thisRow.find('.tdCancel').find('button')
        if(thisPeer === myHandle) {
          cancelButton.show()
          cancelButton.prop('data-handle', myHandle);
          cancelButton.prop('data-price', thisOrder.price);
          cancelButton.prop('data-buysell', thisOrder.buysell);
          cancelButton.click(cancelOrder);
        }

        $('#orderTable').append(thisRow)
      }
    }

  } catch(err) {
    console.error(`Error in showOrders(): `, err);
    throw err;
  }
}

// Called when the user clicks on the Cancel Button next to an order.
async function cancelOrder(event) {
  const thisBtn = $(this);
  const handle = thisBtn.prop('data-handle');
  const buysell = thisBtn.prop('data-buysell');
  const price = thisBtn.prop('data-price');

  // Get all orders associated with this user.
  const orders = db.get(handle);

  // Filter out the current order.
  const newOrders = orders.filter(order => order.buysell !== buysell || order.price !== price);

  // Update the database.
  await db.put(handle, newOrders);

  resetTable();
  showOrders();
}

// Called when the user clicks the 'Add Order' button. Adds an order
// to the database, then refreshes the order table.
async function addOrder() {
  try {
    //console.log(`addOrder button clicked!`)

    const buysell = $('#orderType').val() === "buy";
    let price = $('#price').val();
    let qty = $('#qty').val();

    // Input Validation
    if(price === "") return;
    if(qty === "") return;

    // Convert qty and price to numbers.
    price = Number(price);
    if(isNaN(price)) return;
    qty = Number(qty);
    if(isNaN(qty)) return;

    // Exit if the DB can not be validated.
    const dbIsValid = await validateDb();
    if(!dbIsValid) return;

    // Retrieve data from the web forms.
    const myHandle = $('#peerId').val();
    const myOrder = {
      buysell: buysell,
      price: price,
      qty: qty,
      peer: myHandle
    }

    // Get the list of peers
    let peers = db.get('peers')

    // Get existing orders for this peer.
    let myOrders = db.get(myHandle);

    myOrders.push(myOrder);

    // Save the new order to the DB.
    await db.put(myHandle, myOrders);

    console.log(`Order added to DB!`)

    resetTable();
    showOrders();

    // Try to match orders.
    matchOrders();

  } catch(err) {
    console.error(`Error in addOrder(): `,err);
    throw err;
  }
}

// Navigates the database and attempts to match buy-sell orders.
async function matchOrders() {
  try {
    // Exit if the DB can not be validated.
    const dbIsValid = await validateDb();
    if(!dbIsValid) return;

    // Retrieve data from the web forms.
    const myHandle = $('#peerId').val();

    // Get order data from the DB.
    const peers = db.get('peers');
    const userOrders = db.get(myHandle);

    // handling a bug.
    if(!userOrders) {
      //debugger;
      return;
    }

    // Loop through each order associated with this user.
    for(var k=0; k < userOrders.length; k++) {
      const userOrder = userOrders[k];

      // BUY ORDERS
      if(userOrder.buysell) {

        // Loop through each peer in the db.
        for(var i=0; i < peers.length; i++) {
          const thisPeer = peers[i];

          // if the current peer is the current user, then skip.
          if(thisPeer === myHandle) continue;

          // Loop through each order associated with this peer.
          const orders = db.get(thisPeer);
          for(var j=0; j < orders.length; j++) {
            const thisOrder = orders[j];

            // If this is a buy order, skip
            if(thisOrder.buysell) continue;

            // Match if buy price is greater than sell price.
            if(userOrder.price >= thisOrder.price) {
              //console.log(`userOrder: ${JSON.stringify(userOrder,null,2)}`);
              //console.log(`thisOrder: ${JSON.stringify(thisOrder,null,2)}`);

              console.log(`Match with ${thisPeer} as seller at ${thisOrder.price} and ${myHandle} as buyer at ${userOrder.price}`);

              alert(`You've been matched!
              Seller: ${thisPeer}
              Buyer: You (${myHandle})`);

              // Update DB with results of trade.
              tradeDb(thisOrder, userOrder);
            }
          }
        }

      // SELL ORDERS
      } else {

        // Loop through each peer in the db.
        for(var i=0; i < peers.length; i++) {
          const thisPeer = peers[i];

          // if the current peer is the current user, then skip.
          if(thisPeer === myHandle) continue;

          // Loop through each order associated with this peer.
          const orders = db.get(thisPeer);
          for(var j=0; j < orders.length; j++) {
            const thisOrder = orders[j];

            // If this is a sell order, skip
            if(!thisOrder.buysell) continue;

            // Match if buy price is greater than sell price.
            if(thisOrder.price >= userOrder.price) {
              //console.log(`userOrder: ${JSON.stringify(userOrder,null,2)}`);
              //console.log(`thisOrder: ${JSON.stringify(thisOrder,null,2)}`);

              console.log(`Match with ${thisPeer} as buyer at ${thisOrder.price} and ${myHandle} as seller at ${userOrder.price}`);

              alert(`You've been matched!
              Seller: You (${myHandle})
              Buyer: ${thisPeer}`);

              // Update DB with results of trade.
              tradeDb(userOrder, thisOrder);
            }
          }
        }
      }

    }
  } catch(err) {
    console.error(`Error in matchOrders(): `, err);
    debugger;
    throw err;
  }
}

// Updated the DB with the results of a matched trade.
async function tradeDb(sellOrder, buyOrder) {
  try {
    console.log(`Resolving trade in DB.`);

    // Guards/Validation
    if(sellOrder.buysell) return;
    if(!buyOrder.buysell) return;

    const buyer = buyOrder.peer;
    const seller = sellOrder.peer;
    const buyerOrders = db.get(buyer);
    const sellerOrders = db.get(seller);

    // Special case where they are equal, remove both entries from the DB.
    if(sellOrder.qty === buyOrder.qty) {
      const newBuyerOrders = buyerOrders.filter(order => (order.price !== buyOrder.price && order.qty !== buyOrder.qty));
      await db.put(buyer, newBuyerOrders);

      const newSellerOrders = sellerOrders.filter(order => (order.price !== sellOrder.price && order.qty !== sellOrder.qty));
      await db.put(seller, newSellerOrders);

    // If sell qty < buy qty, sell all.
    } else if(sellOrder.qty < buyOrder.qty) {
      // Remove the sell order since this has been fulfilled.
      const newSellerOrders = sellerOrders.filter(order => (order.price !== sellOrder.price && order.qty !== sellOrder.qty));
      await db.put(seller, newSellerOrders);

      // Reduce the buy order by the amount sold.
      const newBuyerOrders = buyerOrders.map(order => {
        if(order.price === buyOrder.price && order.qty === buyOrder.qty) {
          order.qty = buyOrder.qty - sellOrder.qty;
        }
        return order;
      });
      await db.put(buyer, newBuyerOrders);

    // else sell partial, buy all.
    } else {
      // Remove the buy order since this has been fulfilled.
      const newBuyerOrders = buyerOrders.filter(order => (order.price !== buyOrder.price && order.qty !== buyOrder.qty));
      await db.put(buyer, newBuyerOrders);

      // Reduce the sell order by the amount bought.
      const newSellerOrders = sellerOrders.map(order => {
        if(order.price === sellOrder.price && order.qty === sellOrder.qty) {
          order.qty = sellOrder.qty - buyOrder.qty;
        }
        return order;
      });
      await db.put(seller, newSellerOrders);
    }

    // Refresh the DOM.
    resetTable();
    showOrders();

  } catch(err) {
    console.error(`Error in tradeDb(): `, err);
    throw err;
  }
}

// This is a 'guard' that is used ensure the DB exists and the current users exists
// in it. It returns true on success or false if there is a problem that can not
// be automatically handled.
async function validateDb() {
  // Exit if DB is not ready.
  if(!dbReady) return false;

  // Retrieve data from the web forms.
  const myHandle = $('#peerId').val();
  if(myHandle === "") return false;

  // Get the list of peers
  let peers = db.get('peers')

  // Handle a new DB.
  if(!peers) {
    peers = [myHandle]
    await db.put('peers', peers);

  // Add user to peers list if they aren't already there.
  } else {
    if(peers.indexOf(myHandle) === -1) {

      // Add current user to the list of peer.
      peers.push(myHandle);
      await db.put('peers', peers);
    }
  }

  // Get orders associated with this peer
  const myOrders = db.get(myHandle);
  if(!myOrders) {
    // Create an empty array to store this users orders.
    await db.put(myHandle, []);
  }

  return true;
}
