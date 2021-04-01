import localforage from 'localforage'
import Transaction from 'arweave/web/lib/transaction'
import Api from '@/api/api'

export const cache = {
  /**
   * 查询这笔交易信息是否已经缓存
   * @param txid 交易id
   * @return {Promise<Transaction>} 如果返回undefined则表示没有被缓存
   */
  async getCachedTransactionByTxid (txid) {
    const key = (await localforage.keys()).find((key) => key.endsWith(txid))
    if (key) {
      const timeNow = new Date().getTime()
      const cacheTimeStamp = parseInt(key.substring(key.indexOf(':') + 1, key.lastIndexOf(':')))
      if (timeNow - cacheTimeStamp < 1000 * 60 * 60 * 24 * 7) {
        const transaction = JSON.parse(await localforage.getItem(key))
        return new Transaction({
          ...transaction
        })
      } else {
        await localforage.removeItem(key)
        return undefined
      }
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
      console.warn('This transaction is not cached: ' + txid)
      return
    }
    const timestamp = new Date().getTime()
    const keyForCache = `transaction:${timestamp}:${txid}`
    await localforage.setItem(keyForCache, JSON.stringify(transaction))
  }
}
