import localforage from 'localforage'
import Transaction from 'arweave/web/lib/transaction'
import Api from '@/api/api'

export const cache = {
  // 缓存版本，请在每次修改过这个文件之后将它+1
  cacheVersion: 1,
  /**
   * 根据txid获取已缓存的key
   * 如果缓存数据已经超过7天，或者版本不兼容将被删除
   * @param txid 交易id
   * @return {Promise<string>} 已缓存的key
   */
  async getCachedKeyByTxid (txid) {
    const key = (await localforage.keys()).find((key) => key.endsWith(txid))
    if (key) {
      const timeNow = new Date().getTime()
      const cacheVersion = parseInt(key.substring(0, key.indexOf('-')))
      const cacheTimeStamp = parseInt(key.substring(key.indexOf(':') + 1, key.lastIndexOf(':')))
      if ((timeNow - cacheTimeStamp < 1000 * 3600 * 24 * 7) && cacheVersion === this.cacheVersion) {
        return key
      } else {
        await localforage.removeItem(key)
      }
    }
  },
  /**
   * 查询这笔交易信息是否已经缓存
   * @param txid 交易id
   * @return {Promise<Transaction>} 如果返回undefined则表示没有被缓存
   */
  async getCachedTransactionByTxid (txid) {
    const key = await this.getCachedKeyByTxid(txid)
    if (key) {
      const transaction = JSON.parse(await localforage.getItem(key))
      return new Transaction({
        ...transaction
      })
    }
    return undefined
  },
  /**
   * 将这笔交易信息缓存到本地
   * @param txid 交易id
   * @param transaction 交易信息
   */
  async cacheTheTransaction (txid, transaction) {
    const tags = Api.gql.getTagsByTransaction(transaction)
    const type = tags.Type
    if (type !== 'status') {
      return
    }
    const timestamp = new Date().getTime()
    const keyForCache = `${this.cacheVersion}-transaction:${timestamp}:${txid}`
    await localforage.setItem(keyForCache, JSON.stringify(transaction))
  }
}
