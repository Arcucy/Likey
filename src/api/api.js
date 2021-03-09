const arweave = require('./arweave').default
const ArweaveNative = require('arweave').default

const Arweave = ArweaveNative.init({
  host: process.env.VUE_APP_ARWEAVE_NODE,
  port: 443,
  protocol: 'https',
  timeout: 20000,
  logging: false
})

const API = {
  weave: arweave,
  Arweave: Arweave,
  ArweaveNative: ArweaveNative
}

export default API
