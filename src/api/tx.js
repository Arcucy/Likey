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
  async createNewStatus (status, extra, key, callback) {
    const obj = {
      title: String(status.title),
      content: String(status.content),
      isTop: Boolean(status.isTop),
      isLock: Boolean(status.isLock),
      extra: {
        media: extra.media || [],
        audio: extra.audio || [],
        file: extra.file || []
      }
    }

    let tx = null
    try {
      tx = await arweave.createTransaction({ data: obj }, key)
    } catch (err) {
      throw new Error(err)
    }

    // Add tag 添加标签
    tx.addTag('Content-Type', 'application/json')
    tx.addTag('App-Name', 'likey-app-dev')
    tx.addTag('Schema-Version', '0.1.0')
    tx.addTag('Unix-Time', Date.now())
    tx.addTag('Type', 'status')
    tx.addTag('Title', String(status.title))
    tx.addTag('Summary', String(status.title).substring(0, 100))
    tx.addTag('Extra', JSON.stringify({ media: extra.media.length || 0, audio: extra.audio.length || 0, file: extra.file.length || 0 }))

    try {
      await arweave.transactions.sign(tx, key)
    } catch (err) {
      throw new Error(err)
    }
    let uploader = null
    try {
      uploader = await arweave.transactions.getUploader(tx)
    } catch (err) {
      throw new Error(err)
    }

    callback(uploader.pctComplete, uploader)
    while (!uploader.isComplete) {
      try {
        await uploader.uploadChunk()
      } catch (err) {
        throw new Error(err)
      }
      callback(uploader.pctComplete, uploader)
    }

    const result = await arweave.transactions.getStatus(tx.id)
    return { id: tx.id, status: result }
  },
  /**
   * createNewFile 创建一个文件上传交易
   * @param {*} file        - 要上传的文件，必须包含字段 data，type，可以参考 Uploader 组件
   * @param {*} fileType    - 上传类型，image，audio，file 三选一
   * @param {*} key         - 用户 JWK 钱包，如果是钱包插件可以传入空对象
   * @param {*} callback    - 回调函数，返回当前上传百分比，以及一个 uplodaer（可以断点续传的上传对象）
   * @returns               - 返回一个对象，包含 id 和 status 字段，id 字段是交易 id，status 字段是交易上传状态
   */
  async createNewFile (file, fileType, key, tags = [], callback) {
    const types = {
      image: 'Likey-Images',
      audio: 'Likey-Audio',
      file: 'Likey-File'
    }

    const type = types[fileType] || 'Likey-File'

    let tx = null
    try {
      tx = await arweave.createTransaction({ data: file.data }, key)
    } catch (err) {
      throw new Error(err)
    }

    // Add tag 添加标签
    tx.addTag('Content-Type', file.type)
    tx.addTag('App-Name', 'likey-app-dev')
    tx.addTag('Schema-Version', '0.1.0')
    tx.addTag('Unix-Time', Date.now())
    tx.addTag('Type', type)

    if (tags.length > 0) {
      tags.forEach(tag => {
        if (!(Object.prototype.hasOwnProperty.call(tag, 'name') || Object.prototype.hasOwnProperty.call(tag, 'value'))) return
        if (!(tag.name || tag.value)) return
        tx.addTag(tag.name, tag.value)
      })
    }

    try {
      await arweave.transactions.sign(tx, key)
    } catch (err) {
      throw new Error(err)
    }
    let uploader = null
    try {
      uploader = await arweave.transactions.getUploader(tx)
    } catch (err) {
      throw new Error(err)
    }

    callback(uploader.pctComplete, uploader)
    while (!uploader.isComplete) {
      try {
        await uploader.uploadChunk()
      } catch (err) {
        throw new Error(err)
      }
      callback(uploader.pctComplete, uploader)
    }

    const result = await arweave.transactions.getStatus(tx.id)
    return { id: tx.id, status: result }
  }
}
