import Arweave from 'arweave'

const arweave = Arweave.init({
  host: process.env.VUE_APP_ARWEAVE_NODE,
  port: 443,
  protocol: 'https',
  timeout: 20000,
  logging: false
})

// Main p5A9xMQclnVNRNTQU6CHmYkHBjGKWDvZbxDmfjkwg_A
// ANT mGjKEbZnNXkxIXIJNkzMZi_jBADXC9QGlovd2fGmQas

export default {
  /**
   * createNewStatus 创建一条新的动态
   * 创建时，请传入合法的 status 对象，包含必要的字段，
   * 以及签名密钥，如果需要获取交易的创建动态，请传入回调函数
   * @param {*} status    - 动态对象
   * @param {*} key       - JWK 签名密钥
   * @param {*} callback  - 监听交易状态的回调参数
   */
  async createNewStatus (status, key, callback) {
    console.log(arweave)
    // setTimeout(() => {
    //   const status = { type: 'process', message: 'process.data', status: 'process.ok' }
    //   callback(status)
    // }, 5000)
  },

  async createNewImages (images = [], key, callback) {

  },
  async createNewAudios (audios = [], key, callback) {

  },
  async createNewFiles (files = [], key, callback) {

  }
}
