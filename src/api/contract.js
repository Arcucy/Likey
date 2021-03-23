import Arweave from 'arweave'
import * as SmartWeave from 'smartweave'
import { Message } from 'element-ui'
import Axios from 'axios'

const LIKEY_CREATOR_PST_CONTRACT = 'nkgrioAGagAmmb-7Hr8WJ-Jx2mPpejMZq7UerinrS_o'
const LIKEY_CONTRACT = 'fN-nTV-Q6HX9wDPNo89CKpbUhC6nDLWlnic7QzRA1g0'
/** 测试模式开关，开启后不会调用 interactWrite 方法，只会模拟运行 */
const TEST_MODE = true
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
   * 读取 Likey 主合约
   */
  async readLikeyContract () {
    const state = await SmartWeave.readContract(arweave, LIKEY_CONTRACT)
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
   * estimateCreatorPSTContractFee 估算创建创作者的 PST 合约所需要的手续费
   * @param {*} jwk JWK 密钥
   * @param {*} ticker ticker PST 信息
   * @returns fee 手续费
   */
  async estimateCreatorPSTContractFee (jwk, ticker, address = '') {
    if (address === '') {
      address = await arweave.wallets.getAddress(jwk)
    }
    const LikeyPST = LikeyCreatorPSTState()
    LikeyPST.ticker = ticker.ticker
    LikeyPST.name = ticker.name
    LikeyPST.ratio = ticker.ratio || '1:1'
    LikeyPST.admins = [address]
    LikeyPST.owner = address
    const tx = await SmartWeave.simulateCreateContractFromTx(arweave, jwk, LIKEY_CREATOR_PST_CONTRACT, JSON.stringify(LikeyPST))
    const fee = await Axios.get(`https://${process.env.VUE_APP_ARWEAVE_NODE}/price/${Number(tx.data_size)}`)
    return fee
  },
  /**
   * createCreatorPSTContract 创建创作者 PST 合约
   * @param {*} jwk JWK 密钥
   * @param {*} ticker ticker PST 信息
   * @returns id 合约 ID
   */
  async createCreatorPSTContract (jwk, ticker, address = '') {
    if (address === '') {
      address = await arweave.wallets.getAddress(jwk)
    }
    const LikeyPST = LikeyCreatorPSTState()
    LikeyPST.ticker = ticker.ticker
    LikeyPST.name = ticker.name
    LikeyPST.ratio = ticker.ratio || '1:1'
    LikeyPST.admins = [address]
    LikeyPST.owner = address
    console.log(LikeyPST)
    const contractId = await SmartWeave.createContractFromTx(arweave, jwk, LIKEY_CREATOR_PST_CONTRACT, JSON.stringify(LikeyCreatorPSTState))
    return contractId
  },

  /** 创建创作者 */
  async announceCreator (jwk, creator, ticker, items) {
    const obj = LikeyContract.announceCreator(creator, ticker, items)

    const res = await this.interactWrite(jwk, obj)
    return res
  },
  /** 更新创作者解锁方案 */
  async editCreatorItems (jwk, items, address = '') {
    if (address === '') {
      address = await arweave.wallets.getAddress(jwk)
    }
    items.forEach(i => delete i.editing)
    const obj = LikeyContract.editItem(address, items)
    const res = await this.interactWrite(jwk, obj)
    return res
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

const LikeyCreatorPSTState = () => {
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
    version: '1.0.1'
  }
}

// eslint-disable-next-line no-unused-vars
const LikeyCreatorPST = {
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
