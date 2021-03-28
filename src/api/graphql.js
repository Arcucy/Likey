import { GraphQLClient, gql } from 'graphql-request'
import Arweave from 'arweave'

import decode from '../util/decode'

const arweave = Arweave.init({
  host: process.env.VUE_APP_ARWEAVE_NODE,
  port: 443,
  protocol: 'https',
  timeout: 20000,
  logging: false
})

const graph = new GraphQLClient(process.env.VUE_APP_ARWEAVE_GRAPHQL + '/graphql', { headers: {} })

/** 支持的架构版本，在 env 文件中配置，用逗号分隔每个版本号 */
const SCHEMA_VERSION_SUPPORTED = process.env.VUE_APP_SCHEMA_VERSION_SUPPORTED.split(',').map(item => item.trim()).filter(item => item)

export default {
  /**
   * Get user address based on key file content input
   * 根据密钥文件内容获取用户地址
   * @param {String} key      - 使用 keyFileContent，不是原始文件
   */
  getAddress (key) {
    return new Promise((resolve, reject) => {
      arweave.wallets.jwkToAddress(key).then((address) => {
        resolve(address)
      }).catch(err => {
        reject(err)
      })
    })
  },

  /**
   * 转换 AR 为 Winston
   * @param {} arweave   - AR 币值
   */
  getWinstonFromAr (arprice) {
    return arweave.ar.arToWinston(arprice)
  },

  /**
   * 转换 Winston 为 AR
   * @param {*} winston
   */
  getArFromWinston (winston) {
    return arweave.ar.winstonToAr(winston)
  },

  /**
   * Get transaction detail entirely based on given txid
   * 根据给定的 txid (交易ID) 获取完整的交易明细
   * @param {String} txid     - 交易编号
   */
  getTransactionDetail (txid) {
    return new Promise((resolve, reject) => {
      arweave.transactions.get(txid).then(detail => {
        resolve(detail)
      }).catch(err => {
        reject(err)
      })
    })
  },

  /**
   * 提取给定的交易对象中的所有标签
   * @param {Object} transaction
   */
  getTagsByTransaction (transaction) {
    const tags = transaction.get('tags')
    const ret = {}
    for (let i = 0; i < tags.length; i++) {
      const key = tags[i].get('name', { decode: true, string: true })
      const value = tags[i].get('value', { decode: true, string: true })
      ret[key] = value
    }
    return ret
  },

  /**
   * Get user's Arweave Id based on the input wallet address
   * 根据输入的钱包地址获取用户的 Arweave ID
   * @param {String} address  - 用户的钱包地址
   * @param {String} type  - 获取的数据类型，默认为 name
   */
  async getIdByAddress (address, type = 'name') {
    // GraphQL 查询语句，获取设置 arweave-id 的交易记录
    const query = gql`
      query getId($address: String!, $type: String!) {
        transactions (
          owners: [$address]
          tags: [
            {
              name: "App-Name",
              values: ["arweave-id"]
            },
            {
              name: "Type",
              values: [$type]
            }
          ]
        ) {
          edges {
            node {
              id
              block {
                id,
              }
            }
          }
        }
      }
    `
    // 使用 GraphQL 获取 Ar 链上的交易
    const res = await graph.request(query, { address, type })
    // 遍历找到最新的一笔已确认的交易
    for (const value of res.transactions.edges) {
      if (value.node.block && value.node.block.id) {
        // 获取交易详情
        let detail
        try {
          detail = await this.getTransactionDetail(value.node.id)
        } catch (err) {
          if (err.type !== 'TX_PENDING') throw new Error(err)
        }
        if (!detail) return { type: 'Guest', data: 'Guest' }
        // 解码并获取 data
        const data = decode.uint8ArrayToString(detail.data) || 'Guest'
        return { type: 'User', data }
      }
    }
    return { type: 'Guest', data: 'Guest' }
  },

  /**
   * Get user's Arweave Avatar based on the input wallet address
   * 根据输入的钱包地址获取用户的 Arweave 头像
   * @param {String} address    - 用户的钱包地址
   */
  async getAvatarByAddress (address) {
    // GraphQL 查询语句，获取设置 arweave-avatar 的交易记录
    const query = gql`
      query getAvatar($address: String!) {
        transactions (
          owners: [$address]
          tags: [
            {
              name: "App-Name"
              values: ["arweave-avatar"]
            }
          ]
        ) {
          edges {
            node {
              id
              block {
                id
              }
            }
          }
        }
      }
    `
    // 使用 GraphQL 获取 Ar 链上的交易
    const res = await graph.request(query, { address })
    // 遍历找到最新的一笔已确认的交易
    for (const value of res.transactions.edges) {
      if (value.node.block && value.node.block.id) {
        // 获取交易详情
        let detail
        try {
          detail = await this.getTransactionDetail(value.node.id)
        } catch (err) {
          if (err.type !== 'TX_PENDING') throw new Error(err)
        }
        if (!detail) return ''
        // 解码并获取 data
        const data = decode.uint8ArrayToString(detail.data)
        return data
      }
    }
    return ''
  },

  /**
   * 根据用户地址获取动态列表
   * @param {String | String[]} address 查询的用户地址，可以传入单个地址或地址列表
   * @param {String} after 获取指定的 cursor 之后的数据
   * @param {Number} first 一次获取几条数据，默认获取 10 条
   * @param {Boolean} filterNoBlock 不返回没有区块信息的交易，没有区块信息的交易将无法通过 transactions.get 获取。
   */
  async getUserStatusByAddress (address, after = '', first = 10, filterNoBlock = false) {
    const query = gql`
      query getStatus(
        $appName: String!,
        $schemaVersion: [String!]!,
        $addressList: [String!],
        $first: Int,
        $after: String,
      ) {
        transactions(
          first: $first
          after: $after
          owners: $addressList
          tags: [
            { name: "App-Name"        values: [$appName] },
            { name: "Schema-Version"  values: $schemaVersion },
            { name: "Type"            values: ["status"] }
          ]
        ) {
          pageInfo { hasNextPage }
          edges {
            cursor
            node {
              id
              owner { address }
              tags { name value }
              block { timestamp }
            }
        }
        }
      }
    `
    const addressList = typeof address === 'string' ? [address] : [...address]

    const res = await graph.request(query, {
      appName: process.env.VUE_APP_APP_NAME,
      schemaVersion: SCHEMA_VERSION_SUPPORTED,
      addressList,
      after: after || '',
      first: first || 10
    })

    if (filterNoBlock) {
      const edges = res.transactions.edges.filter(item => {
        return item.node.block && item.node.block.timestamp
      })
      res.transactions.edges = edges
    }

    return res
  }
}
