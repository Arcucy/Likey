import Arweave from 'arweave'

const TEST_MODE = false
console.log('Is it TX test mode? :', TEST_MODE)

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
    console.log('进入 createNewStatus 方法，入参：', status, extra, key, callback)
    const obj = this.createStatusData(status, extra)

    let tx = null
    try {
      tx = await arweave.createTransaction({ data: JSON.stringify(obj) }, key)
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
    tx.addTag('Summary', String(status.summary || status.content).substring(0, 100))
    tx.addTag('Extra', JSON.stringify({ media: extra.medias.length || 0, audio: extra.audios.length || 0, file: extra.files.length || 0 }))
    if (status.lock) tx.addTag('Lock', JSON.stringify(status.lock))

    try {
      await arweave.transactions.sign(tx, key)
    } catch (err) {
      throw new Error(err)
    }

    if (TEST_MODE) return { id: tx.id, status: { status: 200 } }

    let uploader = null
    try {
      uploader = await arweave.transactions.getUploader(tx)
    } catch (err) {
      throw new Error(err)
    }

    callback(uploader.pctComplete, uploader, tx.id)
    while (!uploader.isComplete) {
      try {
        await uploader.uploadChunk()
      } catch (err) {
        throw new Error(err)
      }
      callback(uploader.pctComplete, uploader, tx.id)
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
    console.log('进入 createNewFile 方法，入参：', file, fileType, key, tags, callback)
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

    if (tags && tags.length) {
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

    if (TEST_MODE) return { id: tx.id, status: { status: 200 } }

    let uploader = null
    try {
      uploader = await arweave.transactions.getUploader(tx)
    } catch (err) {
      throw new Error(err)
    }

    callback(uploader.pctComplete, uploader, tx.id)
    while (!uploader.isComplete) {
      try {
        await uploader.uploadChunk()
      } catch (err) {
        throw new Error(err)
      }
      callback(uploader.pctComplete, uploader, tx.id)
    }

    const result = await arweave.transactions.getStatus(tx.id)
    return { id: tx.id, status: result }
  },

  /**
   * resumeUpload 重新连接并继续之前中断的上传
   * @param {*} oldUploader - 需要重新开始上传的上传对象
   * @param {*} txId        - 交易 ID
   * @param {*} data        - 之前没传完的数据
   * @param {*} callback    - 回调函数，返回当前上传百分比，以及一个 uplodaer（可以断点续传的上传对象）
   * @returns               - 返回一个对象，包含 id 和 status 字段，id 字段是交易 id，status 字段是交易上传状态
   */
  async resumeUpload (oldUploader, txId, data, callback) {
    if (TEST_MODE) return { id: txId, status: { status: 200 } }

    let uploader = null
    try {
      uploader = await arweave.transactions.getUploader(oldUploader, data)
    } catch (err) {
      throw new Error(err)
    }

    callback(uploader.pctComplete, uploader, txId)
    while (!uploader.isComplete) {
      try {
        await uploader.uploadChunk()
      } catch (err) {
        throw new Error(err)
      }
      callback(uploader.pctComplete, uploader, txId)
    }

    const result = await arweave.transactions.getStatus(txId)
    return { id: txId, status: result }
  },

  /** 创建动态上传的对象结构 */
  createStatusData (status, extra) {
    return {
      title: String(status.title),
      content: String(status.content),
      isTop: Boolean(status.isTop),
      isLock: Boolean(status.isLock),
      lock: status.lock || null,
      extra: {
        medias: extra.medias || [],
        audios: extra.audios || [],
        files: extra.files || []
      }
    }
  }
}
