import Arweave from 'arweave'
import * as SmartWeave from 'smartweave'

const LIKEY_CONTRACT = 'ztM2Ewn6gaptOskYbW35OyQD-MoZ86NckQWjkGxtXhA'
/** 测试模式开关，开启后不会调用 interactWrite 方法，只会模拟运行 */
const TEST_MODE = false

const ar = Arweave.init({
  host: process.env.VUE_APP_ARWEAVE_NODE,
  port: 443,
  protocol: 'https',
  timeout: 20000,
  logging: false
})

// 合约状态读取请使用 @/store/contract 中的 vuex，那个有缓存功能，
// 如果没有特殊需求，不要直接调用 readLikeyContract。
export default {
  /**
   * 读取 Likey 主合约
   */
  async readLikeyContract () {
    const state = await SmartWeave.readContract(ar, LIKEY_CONTRACT)
    return state
  },

  /**
   * 封装好的 interactWrite 方法，会先进行 interactWriteDryRun 模拟运行，成功后在实际执行 interactWrite
   * @param {Object} jwk 钱包
   * @param {*} input 数据
   * @param {*} tags 给交易添加标签
   * @param {*} target ？
   * @param {*} winstonQty ？
   */
  async interactWrite (jwk, input, tags, target, winstonQty) {
    const resDryRun = await SmartWeave.interactWriteDryRun(ar, jwk, LIKEY_CONTRACT, input, tags, target, winstonQty)
    if (resDryRun.type !== 'ok' || TEST_MODE) {
      return {
        ...resDryRun,
        isTestMode: TEST_MODE
      }
    }
    const res = await SmartWeave.interactWrite(ar, jwk, LIKEY_CONTRACT, input, tags, target, winstonQty)
    return {
      ...res,
      isTestMode: TEST_MODE
    }
  },

  /** 创建创作者 */
  async announceCreator (jwk) {
    const announceCreatorInput = {
      function: 'announceCreator',
      data: {
        scale: 'Personal',
        shortname: 'xxx',
        intro: 'xxx',
        category: 'Type1',
        ticker: {
          ticker: 'EXA',
          name: 'Example Name',
          contract: 'ADDRESS'
        },
        items: [
          {
            title: 'Example Title',
            value: '10',
            description: 'Example Description'
          }
        ]
      }
    }

    announceCreatorInput.data.shortname = 'littlesound'

    const res = await this.interactWrite(jwk, announceCreatorInput)
    console.log('创建创作者结果：', res)
    return res
  }
}
