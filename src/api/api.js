const arweave = require('./arweave').default
const ArweaveUtil = require('arweave').default

const ArweaveNative = ArweaveUtil.init({
  host: process.env.VUE_APP_ARWEAVE_NODE,
  port: 443,
  protocol: 'https',
  timeout: 20000,
  logging: false
})

const API = {
  arweave: arweave,
  ArweaveNative: ArweaveNative,
  ArweaveUtil: ArweaveUtil
}

export default API
