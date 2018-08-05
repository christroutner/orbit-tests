/*
  This library is concerned with DOM management and display of the order book
  database.
*/

"use strict"

// This function resets the order book table to the way it was when the DOM
// was first loaded.
function resetTable() {
  const orderTable = $('#orderTable');
  const allRows = orderTable.find('tr');

  // Loop through each row in the table.
  for(var i=0; i < allRows; i++) {
    const thisRow = allRos[i];
    const thisRowsId = thisRow.prop('id');

    if(thisRowsId === "trHeader") continue;
    if(thisRowsId === "trScaffold") continue;

    thisRow.remove();
  }
}


  // Display orders from the orderbook in the table.
  async function showOrders() {
    try {
      // Exit if DB is not ready.
      if(!dbReady) return;

      // Get the list of peers.
      let peers = db.get('peers')

      const myHandle = $('#peerId').val();

      // Handle a new DB.
      if(!peers) {
        peers = [myHandle]
      }

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

          thisRow.find('.tdCancel').find('button').show()

          $('#orderTable').append(thisRow)
        }
      }

    } catch(err) {
      console.error(`Error in showOrders(): `, err);
      throw err;
    }
  }
