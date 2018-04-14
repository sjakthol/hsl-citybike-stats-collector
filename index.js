const bunyan = require('bunyan')

const api = require('./lib/api')
const timeit = require('./lib/timeit')

const ddb = require('./lib/ddb')
const logger = bunyan.createLogger({ level: process.env.LOG_LEVEL || 'info', name: 'index' })

const table = process.env.STATS_TABLE_NAME
if (!table) {
  throw new Error('STATS_TABLE_NAME is not defined')
}

module.exports = {
  handler: async (event, context) => {
    timeit.start('total')

    const log = logger.child({ req: context.awsRequestId })
    log.debug({ event }, 'Event payload')

    ddb.init({ log: log.child({ module: 'ddb' }), config: { parallelism: 5 } })

    timeit.start('fetch')
    const data = await api.fetchStats()
    timeit.end('fetch')

    timeit.start('save')
    await ddb.put(table, data)
    timeit.end('save')

    timeit.end('total')
    const metrics = timeit.report()
    log.info({ metrics }, 'Wrote data for %s stations to DynamoDB', data.length)

    return null
  }
}
