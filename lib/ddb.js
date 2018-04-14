/**
 * @module
 *
 * An utility module that handles DynamoDB writes.
 */

const AWS = require('aws-sdk')
const crypto = require('crypto')
const hi = require('highland')

const ddb = new AWS.DynamoDB.DocumentClient()
let config
let log

/**
 * Write a batch of items to DynamoDB. Handles errors and retries until
 * all items have been persisted to DynamoDB.
 *
 * @param {AWS.DynamoDB.BatchWriteItemRequestMap} batch - the batch to write.
 *
 * @return {Promise<void>} a promise that resolves once the items have been written
 *  to DynamoDB or rejects if a persistent error occurs
 */
async function putBatch (batch) {
  let batchId = crypto.randomBytes(4).toString('hex')
  let attempt = 0
  let unprocessed = batch
  do {
    log.debug({ attempt, batchId }, 'Writing batch to DynamoDB')

    const res = await ddb.batchWrite({ RequestItems: unprocessed }).promise()
    unprocessed = res.UnprocessedItems

    if (Object.keys(unprocessed).length > 0) {
      const backoff = 100 * 2 ** attempt + Math.round(Math.random() * 100)
      const numUnprocessed = Object.keys(unprocessed).reduce((total, table) => {
        return total + unprocessed[table].length
      }, 0)

      log.warn({ batchId, attempt, backoff, numUnprocessed }, 'DynamoDB failed to process items. Backing off and retrying')

      attempt++
      await new Promise(resolve => setTimeout(resolve, backoff))
    } else {
      log.debug({ attempt, batchId }, 'Full batch written to DynamoDB')
    }
  } while (Object.keys(unprocessed).length > 0)
}

module.exports = {
  /**
   * Initialize the module.
   *
   * @param {Object} _context
   * @param {Object} _context.config
   * @param {Object} _context.log
   */
  init: _context => {
    config = _context.config
    log = _context.log

    log.debug({ config }, 'Module initialized')
  },

  /**
   * Put the given items to the given table.
   *
   * @param {String} table - the name of the table to write the items to
   * @param {Object[]} items - the items to write to the table
   *
   * @return promise that resolves if successful, rejects if there's an error
   */
  put: (table, items) => {
    if (typeof table !== 'string' || !table) {
      throw new TypeError('table must be defined')
    }

    if (!Array.isArray(items)) {
      throw new TypeError('items must be an array')
    }

    log.debug({ table, items: items.length }, 'Putting items to DynamoDB')
    return hi(items)
      .batch(25)
      .map(batch => {
        return {
          [table]: batch.map(Item => ({
            PutRequest: {
              Item
            }
          }))
        }
      })
      .map(hi.wrapCallback((batch, callback) => putBatch(batch).then(callback, callback)))
      .parallel(config.parallelism || 1)
      .collect()
      .toPromise(Promise)
  }
}
