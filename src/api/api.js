const arweave = require('./arweave').default
const Ar = require('arweave').default

const Arweave = Ar.init({
  host: process.env.VUE_APP_ARWEAVE_NODE,
  port: 443,
  protocol: 'https',
  timeout: 20000,
  logging: false
})

const API = {
  arweave: arweave,
  Arweave: Arweave
}

export default API
