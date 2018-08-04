'use strict'

/**
 * BlockService is a hybrid block datastore. It stores data in a local
 * datastore and may retrieve data from a remote Exchange.
 * It uses an internal `datastore.Datastore` instance to store values.
 */
class BlockService {
  /**
   * Create a new BlockService
   *
   * @param {IPFSRepo} ipfsRepo
   * @returns {BlockService}
   */
  constructor (ipfsRepo) {
    this._repo = ipfsRepo
    this._bitswap = null
  }

  /**
   * Add a bitswap instance that communicates with the
   * network to retreive blocks that are not in the local store.
   *
   * If the node is online all requests for blocks first
   * check locally and afterwards ask the network for the blocks.
   *
   * @param {Bitswap} bitswap
   * @returns {void}
   */
  setExchange (bitswap) {
    this._bitswap = bitswap
  }

  /**
   * Go offline, i.e. drop the reference to bitswap.
   *
   * @returns {void}
   */
  unsetExchange () {
    this._bitswap = null
  }

  /**
   * Is the blockservice online, i.e. is bitswap present.
   *
   * @returns {bool}
   */
  hasExchange () {
    return this._bitswap != null
  }

  /**
   * Put a block to the underlying datastore.
   *
   * @param {Block} block
   * @param {function(Error)} callback
   * @returns {void}
   */
  put (block, callback) {
    if (this.hasExchange()) {
      return this._bitswap.put(block, callback)
    }

    this._repo.blocks.put(block, callback)
  }

  /**
   * Put a multiple blocks to the underlying datastore.
   *
   * @param {Array<Block>} blocks
   * @param {function(Error)} callback
   * @returns {void}
   */
  putMany (blocks, callback) {
    if (this.hasExchange()) {
      return this._bitswap.putMany(blocks, callback)
    }

    this._repo.blocks.putMany(blocks, callback)
  }

  /**
   * Get a block by cid.
   *
   * @param {CID} cid
   * @param {function(Error, Block)} callback
   * @returns {void}
   */
  get (cid, callback) {
    if (this.hasExchange()) {
      return this._bitswap.get(cid, callback)
    }

    return this._repo.blocks.get(cid, callback)
  }

  /**
   * Delete a block from the blockstore.
   *
   * @param {CID} cid
   * @param {function(Error)} callback
   * @return {void}
   */
  delete (cid, callback) {
    this._repo.blocks.delete(cid, callback)
  }
}

module.exports = BlockService
