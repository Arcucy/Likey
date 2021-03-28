import localforage from 'localforage'

export const cache = {
  /**
   * 查询这笔交易信息是否已经缓存
   * @param txid 交易id
   * @return {Promise<string|undefined>} 如果返回undefined则表示没有被缓存
   */
  async getKeyByTxid (txid) {
    const key = (await localforage.keys()).find((key) => key.endsWith(txid))
    if (key) {
      const timeNow = new Date().getTime()
      const cacheTimeStamp = parseInt(key.substring(key.indexOf(':') + 1, key.lastIndexOf(':')))
      if (timeNow - cacheTimeStamp < 1000 * 60 * 60 * 24 * 7) {
        return key
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
   * @param detail 交易信息
   */
  async cacheTheTransaction (txid, detail) {
    const timestamp = new Date().getTime()
    const keyForCache = `transaction:${timestamp}:${txid}`
    const data = {
      ...detail
    }
    data.data = Buffer.from(detail.data).toString()
    await localforage.setItem(keyForCache, JSON.stringify(data))
  }
}
