/* eslint-disable no-useless-catch */
import Arweave from 'arweave'
import * as SmartWeave from 'smartweave'
import { Message } from 'element-ui'
import Axios from 'axios'
import BigNumber from 'bignumber.js'

// PST 合约 zNR-5J9CJERI2s4rFnvCHOo85GY3L66prbFygB-5hFg
const LIKEY_CREATOR_PST_CONTRACT = 'fdCi9eHLKBF4jnH98tbMzSi-VRDBp_Vzs8M5f8Z6JgQ'
const LIKEY_CONTRACT = 'XUc8q12a_Me80D4TJopM0ruW4McTPTk1EChVHzNk1lM'
const DEVELOPER = 't1YdNMmOJFaUwtraiM1I3vJPqhU9QxiWjjiprOPo9aA'
const PST_HOLDER_TIP = '0.15'
const DEVELOPER_TIP = '0.05'

/** 测试模式开关，开启后不会调用 interactWrite 方法，只会模拟运行 */
const TEST_MODE = false
console.log('Is it test mode? :', TEST_MODE)
const arweave = Arweave.init({
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
   * 计算拥有代币的总人数
   * @param {*} balances    - PST 中的 balance 字段
   * @returns               - 持有总人数
   */
  _countHolders (balances) {
    const balancesState = JSON.parse(JSON.stringify(balances))
    return String(Object.keys(balancesState).length)
  },

  /**
   * 计算总共的发行量
   * @param {*} balances    - PST 中的 balance 字段
   * @returns               - 总计发行量
   */
  _countTotalSupply (balances) {
    let init = new BigNumber('0')
    const balancesState = JSON.parse(JSON.stringify(balances))
    for (const i of Object.values(balancesState)) {
      const temp = new BigNumber(i)
      init = init.plus(temp)
    }

    return init.toString()
  },
  /**
   * Given an map of address->balance, select one random address
   * weighted by the amount of tokens they hold.
   *
   * @param balances  A balances object, where the key is address and the value is the number of tokens they hold
   */
  selectWeightedPstHolder (balances) {
    // Count the total tokens
    const totalTokens = new BigNumber(this._countTotalSupply(balances))
    // Create a copy of balances where the amount each holder owns is represented
    // by a value 0-1.
    const weighted = {}
    for (const address of Object.keys(balances)) {
      let addressBalance = new BigNumber(balances[address])
      if (addressBalance.toString() === 'NaN') {
        addressBalance = new BigNumber('0')
      }
      weighted[address] = addressBalance.div(totalTokens).toNumber()
    }
    let sum = 0
    const r = Math.random()
    for (const address of Object.keys(weighted)) {
      sum += weighted[address]
      if (r <= sum && weighted[address] > 0) {
        return address
      }
    }
    throw new Error('Unable to select token holder')
  },
  /**
   * 读取 Likey 主合约
   */
  async readLikeyContract () {
    const state = await SmartWeave.readContract(arweave, LIKEY_CONTRACT)
    return state
  },
  /**
   * 读取 Likey PST 合约信息
   */
  async readLikeyCreatorPstContract (address) {
    const state = await SmartWeave.readContract(arweave, address)
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
    const resDryRun = await SmartWeave.interactWriteDryRun(arweave, jwk, LIKEY_CONTRACT, copy(input), tags, target, winstonQty)
    if (TEST_MODE) Message({ message: '正在使用测试模式', type: 'warning' })
    if (resDryRun.type !== 'ok' || TEST_MODE) {
      return {
        ...resDryRun,
        isTestMode: TEST_MODE
      }
    }
    const res = await SmartWeave.interactWrite(arweave, jwk, LIKEY_CONTRACT, copy(input), tags, target, winstonQty)
    return {
      ...resDryRun,
      data: res,
      isTestMode: TEST_MODE
    }
  },
  /**
   * 封装好的 interactWritePst 方法，用于写入 PST 合约，会先进行 interactWriteDryRun 模拟运行，成功后在实际执行 interactWrite
   * @param {Object} jwk 钱包
   * @param {*} input 数据
   * @param {*} tags 给交易添加标签
   * @param {*} target ？
   * @param {*} winstonQty ？
   */
  async interactWritePst (jwk, contract, input, tags, target, winstonQty) {
    const resDryRun = await SmartWeave.interactWriteDryRun(arweave, jwk, contract, copy(input), tags, target, winstonQty)
    if (TEST_MODE) Message({ message: '正在使用测试模式', type: 'warning' })
    if (resDryRun.type !== 'ok' || TEST_MODE) {
      return {
        ...resDryRun,
        isTestMode: TEST_MODE
      }
    }
    const res = await SmartWeave.interactWrite(arweave, jwk, contract, copy(input), tags, target, winstonQty)
    return {
      ...resDryRun,
      data: res,
      isTestMode: TEST_MODE
    }
  },
  /**
   * estimateCreatorPstContractFee 估算创建创作者的 PST 合约所需要的手续费
   * @param {*} jwk JWK 密钥
   * @param {*} ticker ticker PST 信息
   * @returns fee 手续费
   */
  async estimateCreatorPstContractFee (jwk, ticker, address = '') {
    if (address === '') {
      address = await arweave.wallets.getAddress(jwk)
    }
    const LikeyPst = LikeyCreatorPstState()
    LikeyPst.ticker = ticker.ticker
    LikeyPst.name = ticker.name
    LikeyPst.ratio = ticker.ratio || '1:1'
    LikeyPst.admins = [address]
    LikeyPst.owner = address
    const tx = await SmartWeave.simulateCreateContractFromTx(arweave, jwk, LIKEY_CREATOR_PST_CONTRACT, JSON.stringify(LikeyPst))
    const fee = await Axios.get(`https://${process.env.VUE_APP_ARWEAVE_NODE}/price/${Number(tx.data_size)}`)
    return { id: tx.id, fee }
  },
  /**
   * createCreatorPstContract 创建创作者 PST 合约
   * @param {*} jwk JWK 密钥
   * @param {*} ticker ticker PST 信息
   * @returns id 合约 ID
   */
  async createCreatorPstContract (jwk, ticker, address = '') {
    if (address === '') {
      address = await arweave.wallets.getAddress(jwk)
    }
    const LikeyPst = LikeyCreatorPstState()
    LikeyPst.ticker = ticker.ticker
    LikeyPst.name = ticker.name
    LikeyPst.ratio = ticker.ratio || '1:1'
    LikeyPst.admins = [address]
    LikeyPst.owner = address
    const contractId = await SmartWeave.createContractFromTx(arweave, jwk, LIKEY_CREATOR_PST_CONTRACT, JSON.stringify(LikeyPst))
    return contractId
  },
  /** 创建创作者 */
  async announceCreator (jwk, creator, ticker, items) {
    const obj = LikeyContract.announceCreator(creator, ticker, items)
    const tags = [{ name: 'App-Name', value: process.env.VUE_APP_APP_NAME }]
    const res = await this.interactWrite(jwk, obj, tags)
    return res
  },
  /** 更新创作者 */
  async updateCreator (jwk, creator) {
    const obj = LikeyContract.updateCreator(creator)
    const tags = [{ name: 'App-Name', value: process.env.VUE_APP_APP_NAME }]
    const res = await this.interactWrite(jwk, obj, tags)
    return res
  },
  /** 更新创作者解锁方案 */
  async editCreatorItems (jwk, items, address = '') {
    if (address === '') {
      address = await arweave.wallets.getAddress(jwk)
    }
    items.forEach(i => delete i.editing)
    const obj = LikeyContract.editItem(address, items)
    const tags = [{ name: 'App-Name', value: process.env.VUE_APP_APP_NAME }]
    const res = await this.interactWrite(jwk, obj, tags)
    return res
  },
  /** 更新兑换比率 */
  async updateCreatorRatio (jwk, contract, ratio) {
    const obj = LikeyCreatorPst.updateRatio(ratio)
    const tags = [{ name: 'App-Name', value: process.env.VUE_APP_APP_NAME }]

    const likey = await this.interactWrite(jwk, obj, tags)
    const pst = await this.interactWritePst(jwk, contract, obj, tags)
    return { likey, pst }
  },
  /**
   * 分润
   * @param {*} quantity      - 金额
   * @param {*} callback      - 回调函数
   * @returns                 - 分润后的金额
   */
  async distributeTokens (pstState, quantity, jwk, confirm, callback = () => {}) {
    if (!confirm) {
      jwk = await arweave.wallets.generate()
    }

    let quantityBig = new BigNumber(quantity)
    const pstHolderQuantity = new BigNumber(quantityBig.multipliedBy(PST_HOLDER_TIP).toFixed(12))
    const developerQuantity = new BigNumber(quantityBig.multipliedBy(DEVELOPER_TIP).toFixed(12))

    let selected = ''
    let reward = new BigNumber('0')

    let status = 'onDistribution'
    callback(status, '')
    if (pstState.balances && Object.keys(pstState.balances).length > 0 && pstHolderQuantity.toString() >= 1) {
      // 获得被选中的小幸运
      selected = this.selectWeightedPstHolder(pstState.balances)

      try {
        const pstTransaction = await arweave.createTransaction({
          target: selected,
          quantity: pstHolderQuantity.toString()
        }, jwk)

        reward = reward.plus(pstTransaction.reward)

        pstTransaction.addTag('App-Name', process.env.VUE_APP_APP_NAME)
        // 如果是分发给 PST 持有者，即使用 Likey-Purchase-Holder
        pstTransaction.addTag('Purchase-Type', 'Likey-Purchase-Holder')
        // 如果是分发给 PST 持有者，并且是赞助形式，即使用 Sponsor-Holder
        pstTransaction.addTag('Likey-Solution', 'Sponsor-Holder')

        if (confirm) {
          await arweave.transactions.sign(pstTransaction, jwk)
          const txStatus = await arweave.transactions.post(pstTransaction)

          if (String(txStatus.status).length === 3 && !String(txStatus.status).startsWith('2')) {
            status = 'onDistributionError'
            callback(status, pstTransaction.id)
            throw new Error('Send PST Distribution Failed')
          }
          status = 'onDistributionPosted'
          callback(status, pstTransaction.id)

          // 从总额中去除被减去的部分
          quantityBig = quantityBig.minus(pstHolderQuantity)
        }
      } catch (err) {
        status = 'onDistributionCatchError'
        callback(status, '')
        console.error(err)
        throw err
      }
    }

    status = 'onDeveloper'
    callback(status, '')
    if (DEVELOPER && /^([a-zA-Z0-9]|_|-){43}$/.test(DEVELOPER) && developerQuantity.toString() >= 1) {
      try {
        const developerTransaction = await arweave.createTransaction({
          target: DEVELOPER,
          quantity: developerQuantity.toString()
        }, jwk)

        reward = reward.plus(developerTransaction.reward)

        developerTransaction.addTag('App-Name', process.env.VUE_APP_APP_NAME)
        // 如果是分发给开发者，即使用 Likey-Purchase-Developer
        developerTransaction.addTag('Purchase-Type', 'Likey-Purchase-Developer')
        // 如果是分发给开发者，并且是赞助形式，即使用 Sponsor-Developer
        developerTransaction.addTag('Likey-Solution', 'Sponsor-Developer')

        if (confirm) {
          await arweave.transactions.sign(developerTransaction, jwk)
          const txStatus = await arweave.transactions.post(developerTransaction)

          if (String(txStatus.status).length === 3 && !String(txStatus.status).startsWith('2')) {
            status = 'onDeveloperError'
            callback(status, developerTransaction.id)
            throw new Error('Send Developer Tip Failed')
          }
          status = 'onDeveloperPosted'
          callback(status, developerTransaction.id)

          // 从总额中去除被减去的部分
          quantityBig = quantityBig.minus(developerQuantity)
        }
      } catch (err) {
        status = 'onDeveloperCatchError'
        callback(status, '')
        console.error(err)
        throw err
      }
    }

    const creatorTransaction = await arweave.createTransaction({
      target: pstState.owner || DEVELOPER,
      quantity: quantityBig.toString()
    }, jwk)

    reward = reward.plus(creatorTransaction.reward)
    return { creator: quantityBig, holders: pstHolderQuantity, selected, developer: developerQuantity, fee: reward, total: new BigNumber(quantity) }
  },
  /**
   * 赞赏创作者
   * @param {*} jwk         - JWK 密钥
   * @param {*} contract    - 要交互的合约地址，创作者的 PST 地址
   * @param {*} quantity    - 赞助金额，以 Winston 为单位，写入数据前请根据兑换比率自行换算，进入合约后才会按照兑换比率换算
   * @returns               - 返回变更后数据，如果不在测试模式还会返回 data 字段，值为写入数据的 ID
   */
  async sponsorAdded (jwk, contract, quantity, callback) {
    try {
      let status = 'onSponsorAddedStarted'
      callback(status, '')
      const pstState = await this.readLikeyCreatorPstContract(contract)
      const obj = LikeyCreatorPst.sponsorAdded()

      const { creator } = await this.distributeTokens(pstState, quantity, jwk, true, callback)
      const tags = [
        { name: 'Purchase-Type', value: 'Likey-Purchase' },
        { name: 'Likey-Solution', value: 'Sponsor-Creator' },
        { name: 'App-Name', value: process.env.VUE_APP_APP_NAME }
      ]

      try {
        const res = await this.interactWritePst(jwk, contract, obj, tags, pstState.owner, creator.toString())
        if (!res.isTestMode) {
          status = 'onSponsorAdded'
          callback(status, res.data)
        }
        return res
      } catch (err) {
        status = 'onSponsorAddedCatchError'
        callback(status, '')
        throw err
      }
    } catch (err) {
      throw err
    }
  },
  /**
   * 打赏动态
   * @param {*} jwk         - JWK 密钥
   * @param {*} contract    - 要交互的合约地址，创作者的 PST 地址
   * @param {*} statusId    - 打赏的动态 ID
   * @param {*} quantity    - 打赏金额，单位为 Winston
   * @returns               - 返回变更后数据，如果不在测试模式还会返回 data 字段，值为写入数据的 ID
   */
  async donationAdded (jwk, contract, statusId, quantity, callback) {
    try {
      let status = 'onDonationAddedStarted'
      callback(status, '')
      const pstState = await this.readLikeyCreatorPstContract(contract)
      const obj = LikeyCreatorPst.donationAdded(statusId)

      const { creator } = await this.distributeTokens(pstState, quantity, jwk, true, callback)
      const tags = [
        { name: 'Purchase-Type', value: 'Likey-Donation' },
        { name: 'Likey-Solution', value: 'Status-Creator' },
        { name: 'App-Name', value: process.env.VUE_APP_APP_NAME }
      ]

      try {
        const res = await this.interactWritePst(jwk, contract, obj, tags, pstState.owner, creator.toString())
        if (!res.isTestMode) {
          status = 'onDonationAdded'
          callback(status, res.data)
        }
        return res
      } catch (err) {
        status = 'onDonationAddedCatchError'
        callback(status, '')
        throw err
      }
    } catch (err) {
      throw err
    }
  },
  /**
   * 铸币
   * @param {*} jwk         - JWK 密钥
   * @param {*} contract    - 要交互的合约地址，创作者的 PST 地址
   * @param {*} recipient   - 收款人
   * @param {*} quantity    - 铸币数量，以 PST 为单位
   * @returns               - 返回变更后数据，如果不在测试模式还会返回 data 字段，值为写入数据的 ID
   */
  async mint (jwk, contract, recipient, quantity) {
    const obj = LikeyCreatorPst.mint(recipient, quantity)
    const tags = [{ name: 'App-Name', value: process.env.VUE_APP_APP_NAME }]
    const res = await this.interactWritePst(jwk, contract, obj, tags)
    return res
  },
  /**
   * 转账
   * @param {*} jwk         - JWK 密钥
   * @param {*} contract    - 要交互的合约地址，创作者的 PST 地址
   * @param {*} target      - 收款人
   * @param {*} quantity    - 转账数量，以 PST 为单位
   * @returns               - 返回变更后数据，如果不在测试模式还会返回 data 字段，值为写入数据的 ID
   */
  async transfer (jwk, contract, target, quantity) {
    const obj = LikeyCreatorPst.transfer(target, quantity)
    const tags = [{ name: 'App-Name', value: process.env.VUE_APP_APP_NAME }]
    const res = await this.interactWritePst(jwk, contract, obj, tags)
    return res
  },
  /**
   * 为创作者 PST 添加代币图标
   * @param {*} jwk         - JWK 密钥
   * @param {*} contract    - 要交互的合约地址，创作者的 PST 地址
   * @param {*} logo        - 图片地址，尽量选用 Arweave 链上数据（安全性：本地转换的时候以字符串进行读取）
   * @returns               - 返回变更后数据，如果不在测试模式还会返回 data 字段，值为写入数据的 ID
   */
  async editCreatorPstLogo (jwk, contract, logo) {
    try {
      const pstState = await this.readLikeyCreatorPstContract(contract)
      const temp = [...pstState.settings]
      temp.push(['communityLogo', String(logo)])

      const obj = LikeyCreatorPst.editSettings(temp)
      const tags = [{ name: 'App-Name', value: process.env.VUE_APP_APP_NAME }]
      const res = await this.interactWritePst(jwk, contract, obj, tags)
      return res
    } catch (err) {
      throw new Error(err)
    }
  }
}

/**
 * 斩断变量与它前世的姻缘
 * @param {*} data 需要被斩断的变量
 */
function copy (data) {
  return data && typeof data === 'object' ? JSON.parse(JSON.stringify(data)) : data
}

const LikeyContract = {
  /**
   * isOwner 合约读取方法
   * 判断一个地址是不是合约拥有者
   * address 填写 Arweave 地址
   */
  isOwner (address) {
    return {
      function: 'isOwner',
      address
    }
  },
  /**
   * isAdmin 合约读取方法
   * 判断一个地址是不是合约管理员
   * address 填写 Arweave 地址
   */
  isAdmin (address) {
    return {
      function: 'isAdmin',
      address
    }
  },
  /**
   * shortNameExist 合约读取方法
   * 判断一个用户短链接名是否已经存在
   * shortname 填写字符串
   */
  shortNameExist (shortname) {
    return {
      function: 'shortNameExist',
      shortname
    }
  },
  /**
   * addAdmin 合约写入方法
   * 添加一个地址为管理员，该操作只有合约拥有者有权限完成
   * target 填写地址
   */
  addAdmin (target) {
    return {
      function: 'addAdmin',
      target
    }
  },
  /**
   * removeAdmin 合约写入方法
   * 从管理员列表溢出一个管理员，该操作只有合约拥有者有权限完成
   * target 填写地址
   */
  removeAdmin (target) {
    return {
      function: 'removeAdmin',
      target
    }
  },
  /**
   * transferOwnership 合约写入方法
   * 转移合约所有权为目标地址，该操作只有合约拥有者有权限完成
   * target 填写地址
   */
  transferOwnership (target) {
    return {
      function: 'transferOwnership',
      target
    }
  },
  /**
   * updateScale 合约写入方法
   * 更新合约支持的创作规模
   * data 结构中含有 updateScales 对象
   * updateScales 对象中必须包含 add 和 remove 字段
   */
  updateScale (add, remove) {
    return {
      function: 'updateScale',
      data: {
        updateScales: {
          add,
          remove
        }
      }
    }
  },
  /**
   * updateCategory 合约写入方法
   * 更新合约支持的创作类型
   * data 结构中含有 updateCategories 对象
   * updateCategories 对象中必须包含 add 和 remove 字段
   */
  updateCategory (add, remove) {
    return {
      function: 'updateCategory',
      data: {
        updateCategories: {
          add,
          remove
        }
      }
    }
  },
  /**
   * announceCreator 合约写入方法
   * 创建一个创作者
   * data 结构中必须含有 scale, shortname, intro, category, ticker, items 字段，
   * 其中，items 数组可以为长度为零的数组，ticker 包含 ticker，name，contract 字段，
   * items 的物品包含 title，value，description 字段
   */
  announceCreator (creator, ticker, items) {
    return {
      function: 'announceCreator',
      data: {
        /** 创作规模 */
        scale: creator.scale,
        /** 短链接 */
        shortname: creator.shortname,
        /** 自我介绍 */
        intro: creator.intro,
        /** 创作类型 */
        category: creator.category,
        /** PST 代币相关 */
        ticker,
        /** 售卖方案列表 */
        items
      }
    }
  },
  /**
   * removeCreator 合约写入方法
   * 移除一个创作者
   * target 填写创作者地址
   */
  updateCreator (creator) {
    return {
      function: 'updateCreator',
      data: {
        scale: creator.scale,
        intro: creator.intro,
        category: creator.category
      }
    }
  },
  /**
  * updateCreator 合约写入方法
  * 更新一个创作者
  * data 结构中必须含有 scale, intro, category 字段
  */
  removeCreator (target) {
    return {
      function: 'removeCreator',
      target
    }
  },
  /**
   * editItem 合约写入方法
   * 为创作者添加多个售卖物品
   * data 结构中必须含有 items 字段，
   * items 的物品包含 title，value，description 字段
   */
  editItem (target, items) {
    return {
      function: 'editItem',
      target,
      data: {
        items
      }
    }
  }
}

const LikeyCreatorPstState = () => {
  return {
    name: '',
    ticker: '',
    owner: '',
    admins: [],
    divisibility: 1000000000000,
    ratio: '1:1',
    balances: {},
    holders: '0',
    totalSupply: '0',
    donations: [],
    attributes: [],
    settings: [],
    version: '1.0.5'
  }
}

const LikeyCreatorPst = {
  /**
   * mint 合约写入方法
   * 为指定地址铸币
   * target 填写地址，quantity 填写数量
   */
  mint (recipient, quantity) {
    return {
      function: 'mint',
      recipient,
      quantity
    }
  },
  /**
   * burn 合约写入方法
   * 销毁指定地址的资产
   * target 填写地址，quantity 填写数量
   */
  burn (target, quantity) {
    return {
      function: 'burn',
      target,
      quantity
    }
  },
  /**
   * transfer 合约写入方法
   * PST 转账，通用方法
   * recipient 填写地址，qty 填写数量
   */
  transfer (target, qty) {
    return {
      function: 'transfer',
      target,
      qty
    }
  },
  /**
   * sponsorAdded 合约写入方法
   * 购买作者的售卖方案
   * 购买时直接通过这个方法转账
   * 调用此合约时，必须包含调用合约的 target 和 winstonQty 参数，参见 SmartWeave
   */
  sponsorAdded () {
    return {
      function: 'sponsorAdded'
    }
  },
  /**
   * donationAdded 合约写入方法
   * 打赏作者的动态
   * data 结构中含有 statusId 字段
   * 调用此合约时，必须包含调用合约的 target 和 winstonQty 参数，参见 SmartWeave
   */
  donationAdded (statusId) {
    return {
      function: 'donationAdded',
      data: {
        statusId
      }
    }
  },
  /**
   * updateRatio 合约写入方法
   * 更新合约兑换比率
   * data 结构中含有 ratio 字段
   */
  updateRatio (ratio) {
    return {
      function: 'updateRatio',
      data: {
        ratio
      }
    }
  },
  /**
   * editSettings 合约写入方法
   * 更新合约支持的设定参数
   * data 结构中含有 settings 对象
   * settings 对象必须是数组，元素也应该是数组
   */
  editSettings (settings = []) {
    return {
      function: 'editSettings',
      data: {
        settings
      }
    }
  },
  /**
   * editAttributes 合约写入方法
   * 更新合约支持的拓展标签
   * data 结构中含有 attributes 对象
   * attributes 对象必须是数组，元素必须是对象
   */
  editAttributes (attributes = []) {
    return {
      function: 'editAttributes',
      data: {
        attributes
      }
    }
  }
}
