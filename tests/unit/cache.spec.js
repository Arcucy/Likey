(function () {
  process.env.NODE_ENV = 'development'
  process.env.VUE_APP_I18N_LOCALE = 'en'
  process.env.VUE_APP_I18N_FALLBACK_LOCALE = 'en'
  process.env.VUE_APP_ARWEAVE_NODE = 'arweave.arcucy.io'
  process.env.VUE_APP_ARWEAVE_GATEWAY = 'arweave.arcucy.io'
  process.env.VUE_APP_ARWEAVE_GRAPHQL = 'https://arweave.arcucy.io'
  process.env.VUE_APP_BACKEND = 'http://localhost:7001'
  process.env.VUE_APP_APP_NAME = 'likey-app-dev'
  process.env.VUE_APP_SCHEMA_VERSION = '0.1.0'
  process.env.VUE_APP_SCHEMA_VERSION_SUPPORTED = '0.1.0'
})()

const cache = require('@/util/cache').cache
const decode = require('@/util/decode').default

const arweave = require('arweave')
const arweaveInstance = arweave.init({
  host: process.env.VUE_APP_ARWEAVE_NODE,
  port: 443,
  protocol: 'https',
  timeout: 20000,
  logging: false
})

const txid = 'gALBba4ifeK4NqcIu5iPw42pYDyeSSr9CX_ajuZlrJo'

describe('cache.js', () => {
  it('should get environment variables', () => {
    expect(process.env.VUE_APP_APP_NAME).toBe('likey-app-dev')
  })

  it('should get transaction', async () => {
    const transaction = await arweaveInstance.transactions.get(txid)
    expect(transaction).toBeDefined()
    expect(JSON.parse(decode.uint8ArrayToString(transaction.data)).title).toBe('这只是一个测试')
  }, 20000)

  it('should not be cached', async () => {
    const transaction = await arweaveInstance.transactions.get('4rGv64nxRuMUpXKN09KocuRUBIrliQAGVhofcPWLHEE')
    expect(transaction).toBeDefined()
    await cache.cacheTheTransaction(txid, transaction)
    const cachedTransaction = await cache.getCachedTransactionByTxid(txid)
    expect(cachedTransaction).toBeUndefined()
  }, 20000)

  it('should be cached correctly', async () => {
    const transaction = await arweaveInstance.transactions.get(txid)
    await cache.cacheTheTransaction(txid, transaction)
    const cachedTransaction = await cache.getCachedTransactionByTxid(txid)
    expect(cachedTransaction).toEqual(transaction)
    console.log(transaction)
  }, 20000)

  it('should be undefined', async () => {
    expect(await cache.getCachedTransactionByTxid('invalid txid')).toBeUndefined()
  }, 20000)
})
