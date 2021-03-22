/* eslint-disable no-useless-catch */
/* eslint-disable no-unused-vars */
import Arweave from 'arweave'
import Bignumber from 'bignumber.js'

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

  async createNewImage (image, key, callback) {
    const address = await API.ArweaveNative.wallets.getAddress(key)
    let tx = null
    try {
      tx = await arweave.createTransaction({ data: image.data }, key)
    } catch (err) {
      throw new Error(err)
    }

    // // Add tag 添加标签
    tx.addTag('Content-Type', image.type)
    tx.addTag('App-Name', 'likey-app-dev')
    tx.addTag('Unix-Time', Date.now())
    tx.addTag('Type', 'image')
    tx.addTag('Author-Address', address)

    try {
      await arweave.transactions.sign(tx, key)
    } catch (err) {
      throw new Error(err)
    }
    let imgUploader = null
    try {
      imgUploader = await arweave.transactions.getUploader(tx)
    } catch (err) {
      throw new Error(err)
    }

    while (!imgUploader.isComplete) {
      try {
        await imgUploader.uploadChunk()
      } catch (err) {
        throw new Error(err)
      }
      callback(imgUploader.pctComplete)
    }

    const result = await arweave.transactions.getStatus(tx.id)
    return { id: tx.id, status: result.status, confirmed: result.confirmed, error: null }
  },
  async createNewAudios (audios = [], key, callback) {

  },
  async createNewFiles (files = [], key, callback) {

  },
  postImageQueue (queue = [], key, callback) {
    return new Promise((resolve, reject) => {
      let current = 0
      const imageTx = []
      const total = queue.length * 100

      queue.forEach(i => {
        // 调用单次上传方法
        this.createNewImage(i, key, (pct) => {
          // 更新上传进度（所有文件一起计算）
          current += pct
          const currentBn = new Bignumber(current)
          const pctCurrent = currentBn.div(total).multipliedBy(100)
          // 返回计算好的百分比
          callback(parseInt(pctCurrent.toString()))
        }).then(res => {
          // 如果成功的话往 imageTx 加一条
          imageTx.push(res)
          // 长度一致的话就返回
          if (imageTx.length === queue.length) {
            resolve(imageTx)
          }
        }).catch(err => {
          // 不行就报错
          console.error(err)
          reject(err)
        })
      })
    })
  }
}
