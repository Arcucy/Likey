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

const API = require('@/api/api').default

const address = 'X7i1iYzIkA5gamqHGG7SLzBZJ7OyG2fmRfdlV5cVeUM'

describe('Home>Sponsored', () => {
  it('should get all my sponsored status txid', async () => {
    const purchases = await API.gql.getAllPurchases(address, 'donations', 1000)
    const sponsoredStatusList = []
    purchases.transactions.edges.forEach((edge) => {
      sponsoredStatusList.push(edge.node.tags.find((it) => it.name === 'Donate-Status').value)
    })
    expect(sponsoredStatusList).toEqual(['K6aVDfNDQ_GAS2q2y6CXiskuP8twqSMzJPvlYD5wkdE'])
  })
  it('should get all my sponsored status content', async () => {
    const purchases = await API.gql.getAllPurchases(address, 'donations', 1000)
    const sponsoredStatusList = []
    purchases.transactions.edges.forEach((edge) => {
      sponsoredStatusList.push(edge.node.tags.find((it) => it.name === 'Donate-Status').value)
    })
    const res = await API.gql.getStatusByTxid(sponsoredStatusList)
    expect(res.transactions.edges).toBeDefined()
  })
})
