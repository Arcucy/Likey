/* eslint-disable no-unused-vars */
import Arweave from 'arweave'

import API from './api'

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
  },

  async createNewImages (images = [], key, callback) {
    console.log(images)
    // const address = await API.ArweaveNative.wallets.getAddress(key)
    // const imageTxs = []
    // for (let i = 0; i < images.length; i++) {
    //   const image = images[i]
    //   const tx = await arweave.createTransaction({ data: image }, key).catch(err => console.error('Image Transaction Created Failed: ', err))

    //   // // Add tag 添加标签
    //   tx.addTag('Content-Type', 'image/png')
    //   tx.addTag('App-Name', 'likey-app-dev')
    //   tx.addTag('Unix-Time', Date.now())
    //   tx.addTag('Type', 'image')
    //   tx.addTag('Author-Address', address)

    //   await arweave.transactions.sign(tx, key)
    //   const imgUploader = await arweave.transactions.getUploader(tx)

    //   while (!imgUploader.isComplete) {
    //     // await imgUploader.uploadChunk()
    //     callback(imgUploader.pctComplete)
    //   }

    //   await arweave.transactions.post(tx)
    // }
  },
  async createNewAudios (audios = [], key, callback) {

  },
  async createNewFiles (files = [], key, callback) {

  }
}
