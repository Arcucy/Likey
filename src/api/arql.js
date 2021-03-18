/* eslint-disable no-async-promise-executor */
import Arweave from 'arweave'
import Axios from 'axios'

import decode from '../util/decode'

const arweaveHost = 'https://' + process.env.VUE_APP_ARWEAVE_NODE + '/'

const arweave = Arweave.init({
  host: process.env.VUE_APP_ARWEAVE_NODE,
  port: 443,
  protocol: 'https',
  timeout: 20000,
  logging: false
})

// Configuration

const APP_NAME = 'arclight-app'

const arql = {
  timerInterval: undefined,

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
   * Get the decoded data and buffer to string from the given transaction id
   * 根据给定的 txid (交易ID) 获取解码的数据并缓冲为字符串
   * @param {String} txid     - 交易编号
   */
  getTransactionDataDecodedString (txid) {
    return new Promise((resolve, reject) => {
      arweave.transactions.getData(txid, { decode: true, string: true }).then(data => {
        resolve(data)
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
   */
  getIdFromAddress (address) {
    return new Promise((resolve, reject) => {
      /**
       * Use ArQL language to search the user's Arweave ID database
       * 使用 ArQL 语言搜索用户的 Arweave ID 数据库
       */
      arweave.arql({
        op: 'and',
        expr1: {
          op: 'equals',
          expr1: 'from',
          expr2: address // User address 用户钱包地址
        },
        expr2: {
          op: 'and',
          expr1: {
            op: 'equals',
            expr1: 'App-Name',
            expr2: 'arweave-id' // Specified the App-Name as arweave-id 将应用程序名称指定为arweave-id
          },
          expr2: {
            op: 'equals',
            expr1: 'Type',
            expr2: 'name'
          }
        }
      }).then(ids => {
        // Init a object to be resolved later
        // 初始化要稍后返回的对象
        const res = {
          type: 'User',
          data: ''
        }

        // Sepecify the user to be a guest if ids is empty
        // 如果 id 为空，则指定用户为访客 Guest
        if (ids.length === 0) {
          res.type = 'guest'
          res.data = 'Guest'
          // resolve data on finish
          return resolve(res)
        }

        const id = ids[0]

        // Get transaction detial
        // 获取交易明细
        this.getTransactionDetail(id).then(transaction => {
          // Get the encoded data from transaction
          // 从交易中获取编码数据
          this.getTransactionDataDecodedString(id).then(data => {
            res.data = data
            // resolve data on finish
            // 完成时返回数据
            resolve(res)
          }).catch(err => reject(err))
        }).catch(() => reject(new Error('Account has errored transactions, check your balance')))
      }).catch(err => reject(err))
    })
  },

  /**
   * Get user's Arweave Avatar based on the input wallet address
   * 根据输入的钱包地址获取用户的 Arweave 头像
   * @param {String} address    - 用户的钱包地址
   */
  getAvatarFromAddress (address) {
    return new Promise((resolve, reject) => {
      arweave.arql({
        op: 'and',
        expr1: {
          op: 'equals',
          expr1: 'from',
          expr2: address
        },
        expr2: {
          op: 'or',
          expr1: {
            op: 'equals',
            expr1: 'App-Name',
            expr2: 'arweave-avatar'
          },
          expr2: {
            op: 'equals',
            expr1: 'Type',
            expr2: 'avatar'
          }
        }
      }).then(async ids => {
        if (ids.length === 0) {
          resolve(null)
          return
        }

        arweave.transactions.getData(ids[0], { decode: true, string: true }).then(data => {
          resolve(data)
        })
      })
    })
  },

  getAllInfo (arr, type, icon) {
    return new Promise(async (resolve, reject) => {
      const res = []
      for (let i = 0; i < arr.length; i++) {
        const tx = await this.getTransactionDetail(arr[i].id)
        const tags = await this.getTagsByTransaction(tx)
        res.push({ id: arr[i].id, title: tags.Title, artist: tags['Author-Username'] })
      }
    })
  },

  /**
   * Get user's location settings from given address
   * @param {String} address  - 用户的钱包地址
   */
  getLocationFromAddress (address) {
    return new Promise((resolve, reject) => {
      arweave.arql({
        op: 'and',
        expr1: {
          op: 'equals',
          expr1: 'from',
          expr2: address
        },
        expr2: {
          op: 'and',
          expr1: {
            op: 'equals',
            expr1: 'App-Name',
            expr2: APP_NAME
          },
          expr2: {
            op: 'equals',
            expr1: 'Type',
            expr2: 'profile-location'
          }
        }
      }).then(async ids => {
        if (ids.length === 0) {
          resolve(false)
          return
        }

        arweave.transactions.getData(ids[0], { decode: true, string: true }).then(data => {
          resolve(data)
        })
      })
    })
  },

  /**
   * Get user's website settings from given address
   * @param {String} address  - 用户的钱包地址
   */
  getWebsiteFromAddress (address) {
    return new Promise((resolve, reject) => {
      arweave.arql({
        op: 'and',
        expr1: {
          op: 'equals',
          expr1: 'from',
          expr2: address
        },
        expr2: {
          op: 'and',
          expr1: {
            op: 'equals',
            expr1: 'App-Name',
            expr2: APP_NAME
          },
          expr2: {
            op: 'equals',
            expr1: 'Type',
            expr2: 'profile-website'
          }
        }
      }).then(async ids => {
        if (ids.length === 0) {
          resolve(false)
          return
        }

        arweave.transactions.getData(ids[0], { decode: true, string: true }).then(data => {
          resolve(data)
        })
      })
    })
  },

  /**
   * Get user's introduction settings from given address
   * @param {String} address  - 用户的钱包地址
   */
  getIntroFromAddress (address) {
    return new Promise((resolve, reject) => {
      arweave.arql({
        op: 'and',
        expr1: {
          op: 'equals',
          expr1: 'from',
          expr2: address
        },
        expr2: {
          op: 'and',
          expr1: {
            op: 'equals',
            expr1: 'App-Name',
            expr2: APP_NAME
          },
          expr2: {
            op: 'equals',
            expr1: 'Type',
            expr2: 'profile-introduction'
          }
        }
      }).then(async ids => {
        if (ids.length === 0) {
          resolve(false)
          return
        }

        arweave.transactions.getData(ids[0], { decode: true, string: true }).then(data => {
          resolve(data)
        })
      })
    })
  },

  /**
   * Get user's netease id settings from given address
   * @param {String} address  - 用户的钱包地址
   */
  getNeteaseIdFromAddress (address) {
    return new Promise((resolve, reject) => {
      arweave.arql({
        op: 'and',
        expr1: {
          op: 'equals',
          expr1: 'from',
          expr2: address
        },
        expr2: {
          op: 'and',
          expr1: {
            op: 'equals',
            expr1: 'App-Name',
            expr2: APP_NAME
          },
          expr2: {
            op: 'equals',
            expr1: 'Type',
            expr2: 'profile-neteaseid'
          }
        }
      }).then(async ids => {
        if (ids.length === 0) {
          resolve(false)
          return
        }

        arweave.transactions.getData(ids[0], { decode: true, string: true }).then(data => {
          resolve(data)
        })
      })
    })
  },

  /**
   * Get user's soundcloud id settings from given address
   * @param {String} address  - 用户的钱包地址
   */
  getSoundCloudIdFromAddress (address) {
    return new Promise((resolve, reject) => {
      arweave.arql({
        op: 'and',
        expr1: {
          op: 'equals',
          expr1: 'from',
          expr2: address
        },
        expr2: {
          op: 'and',
          expr1: {
            op: 'equals',
            expr1: 'App-Name',
            expr2: APP_NAME
          },
          expr2: {
            op: 'equals',
            expr1: 'Type',
            expr2: 'profile-soundcloudid'
          }
        }
      }).then(async ids => {
        if (ids.length === 0) {
          resolve(false)
          return
        }

        arweave.transactions.getData(ids[0], { decode: true, string: true }).then(data => {
          resolve(data)
        })
      })
    })
  },

  /**
   * 获取与提供的类型标签最相似的用户类型（一种类型符合目标的一级类型）。
   * @param {Number} genre1 歌曲类型
   */
  getTheMostSimilarUsers (genre1) {
    return new Promise((resolve, reject) => {
      arweave.arql({
        op: 'and',
        expr1: {
          op: 'equals',
          expr1: 'App-Name',
          expr2: APP_NAME
        },
        expr2: {
          op: 'and',
          expr1: {
            op: 'equals',
            expr1: 'Type',
            expr2: 'post-info'
          },
          expr2: { // 匹配歌曲类型
            op: 'equals',
            expr1: 'Top1-Genre',
            expr2: genre1 || 'noGenreData'
          }
        }
      }).then(ids => { resolve(ids || []) })
    })
  },

  /**
   * 获取与提供的类型标签相似的用户类型(两种类型的任意一种符合目标的一或二级类型)。
   * @param {Number} genre1 歌曲类型
   */
  GetTheSimilarUsers (genre1, genre2) {
    return new Promise((resolve, reject) => {
      arweave.arql({
        op: 'and',
        expr1: {
          op: 'equals',
          expr1: 'App-Name',
          expr2: APP_NAME
        },
        expr2: {
          op: 'and',
          expr1: {
            op: 'equals',
            expr1: 'Type',
            expr2: 'post-info'
          },
          expr2: { // 匹配歌曲类型
            op: 'or',
            expr1: { // Top1 类型
              op: 'or',
              expr1: {
                op: 'equals',
                expr1: 'Top1-Genre',
                expr2: genre1 || 'noGenreData'
              },
              expr2: {
                op: 'equals',
                expr1: 'Top1-Genre',
                expr2: genre2 || 'noGenreData'
              }
            },
            expr2: { // Top2 类型
              op: 'or',
              expr1: {
                op: 'equals',
                expr1: 'Top2-Genre',
                expr2: genre1 || 'noGenreData'
              },
              expr2: {
                op: 'equals',
                expr1: 'Top2-Genre',
                expr2: genre2 || 'noGenreData'
              }
            }
          }
        }
      }).then(ids => { resolve(ids || []) })
    })
  },

  /**
   * 获取与提供的类型标签有些相似的用户类型(三种类型的任意一种符合目标的一或二或三级类型)。
   * @param {Number} genre1 歌曲类型
   */
  getSomewhatSimilarUsers (excluded, genre1, genre2, genre3) {
    return new Promise((resolve, reject) => {
      arweave.arql({
        op: 'and',
        expr1: {
          op: 'equals',
          expr1: 'App-Name',
          expr2: APP_NAME
        },
        expr2: {
          op: 'and',
          expr1: {
            op: 'equals',
            expr1: 'Type',
            expr2: 'post-info'
          },
          expr2: { // 匹配歌曲类型
            op: 'or',
            expr1: { // Top1 类型
              op: 'or',
              expr1: {
                op: 'equals',
                expr1: 'Top1-Genre',
                expr2: genre1 || 'noGenreData'
              },
              expr2: {
                op: 'or',
                expr1: {
                  op: 'equals',
                  expr1: 'Top1-Genre',
                  expr2: genre2 || 'noGenreData'
                },
                expr2: {
                  op: 'equals',
                  expr1: 'Top1-Genre',
                  expr2: genre3 || 'noGenreData'
                }
              }
            },
            expr2: {
              op: 'or',
              expr1: { // Top2 类型
                op: 'or',
                expr1: {
                  op: 'equals',
                  expr1: 'Top2-Genre',
                  expr2: genre1 || 'noGenreData'
                },
                expr2: {
                  op: 'or',
                  expr1: {
                    op: 'equals',
                    expr1: 'Top2-Genre',
                    expr2: genre2 || 'noGenreData'
                  },
                  expr2: {
                    op: 'equals',
                    expr1: 'Top2-Genre',
                    expr2: genre3 || 'noGenreData'
                  }
                }
              },
              expr2: { // Top3 类型
                op: 'or',
                expr1: {
                  op: 'equals',
                  expr1: 'Top3-Genre',
                  expr2: genre1 || 'noGenreData'
                },
                expr2: {
                  op: 'or',
                  expr1: {
                    op: 'equals',
                    expr1: 'Top3-Genre',
                    expr2: genre2 || 'noGenreData'
                  },
                  expr2: {
                    op: 'equals',
                    expr1: 'Top3-Genre',
                    expr2: genre3 || 'noGenreData'
                  }
                }
              }
            }
          }
        }
      }).then(ids => { resolve(ids || []) })
    })
  },

  /**
   * Get user's Bandcamp Id settings from given address
   * @param {String} address  - 用户的钱包地址s
   */
  getBandCampFromAddress (address) {
    return new Promise((resolve, reject) => {
      arweave.arql({
        op: 'and',
        expr1: {
          op: 'equals',
          expr1: 'from',
          expr2: address
        },
        expr2: {
          op: 'and',
          expr1: {
            op: 'equals',
            expr1: 'App-Name',
            expr2: APP_NAME
          },
          expr2: {
            op: 'equals',
            expr1: 'Type',
            expr2: 'profile-bandcampid'
          }
        }
      }).then(async ids => {
        if (ids.length === 0) {
          resolve(false)
          return
        }

        arweave.transactions.getData(ids[0], { decode: true, string: true }).then(data => {
          resolve(data)
        })
      })
    })
  },

  /**
   * 获取用户上传的所有 post info 的 txid 列表
   * post-info 将会在每次上传时进行更新
   * @param {*} address
   */
  getPostInfosByAddress (address) {
    return new Promise((resolve, reject) => {
      arweave.arql({
        op: 'and',
        expr1: {
          op: 'equals',
          expr1: 'from',
          expr2: address
        },
        expr2: {
          op: 'and',
          expr1: {
            op: 'equals',
            expr1: 'App-Name',
            expr2: APP_NAME
          },
          expr2: {
            op: 'equals',
            expr1: 'Type',
            expr2: 'post-info'
          }
        }
      }).then(async ids => { resolve(ids || []) })
    })
  },

  /**
   * 获取 post-info 的数据
   * @param {String} address
   */
  getDataForPost (address) {
    return new Promise(async (resolve, reject) => {
      const list = await this.getPostInfosByAddress(address)
      if (!list.length) {
        resolve(null)
      } else {
        let data = await this.getPostData(list[0], address)
        if (!data) {
          resolve(false)
        } else {
          clearTimeout(this.timerInterval)
          data = decode.uint8ArrayToString(data.data)
          resolve(data)
        }
      }
    })
  },

  /**
   * 获取 post-info 的数据的底层实现，如有需要，请直接调用 getDataForPost
   * @param {String} txid
   * @param {String} address
   */
  async getPostData (txid, address) {
    let transaction
    try {
      transaction = await this.getTransactionDetail(txid)
    } catch (e) {
      if (e.type === 'TX_PENDING') {
        this.timerInterval = setTimeout(() => {
          this.getDataForPost(address)
        }, 2000)
      } else {
        console.error(e)
      }
    }
    return transaction
  },

  /**
   * 从账户地址中获取所有的 post-info
   * @param {String} address
   */
  getPostFromAddress (address) {
    return new Promise((resolve, reject) => {
      arweave.arql({
        op: 'and',
        expr1: {
          op: 'equals',
          expr1: 'from',
          expr2: address
        },
        expr2: {
          op: 'and',
          expr1: {
            op: 'equals',
            expr1: 'App-Name',
            expr2: APP_NAME
          },
          expr2: {
            op: 'equals',
            expr1: 'Type',
            expr2: 'post-info'
          }
        }
      }).then(async ids => {
        if (!ids.length) {
          resolve(null)
          return
        }
        // 有可能查到正在等待确认的交易所以需要通过循环尝试另一个交易地址，直到成功或者遍历了所有的地址。
        let detail
        for (let i = 0; i < ids.length; i++) {
          try {
            detail = await this.getTransactionDetail(ids[i])
            break
          } catch (e) {
            if (e.type !== 'TX_PENDING') {
              reject(new Error(e))
            }
          }
        }
        if (!detail) resolve(false)
        const tags = this.getTagsByTransaction(detail)
        const data = JSON.parse(decode.uint8ArrayToString(detail.data))
        resolve({ data, tags, tx: detail })
      })
    })
  },

  /**
   * 构建搜索对象
   * @param {Object} data
   */
  getSearchObject (data) {
    return new Promise((resolve, reject) => {
      arweave.arql({
        op: 'equals',
        expr1: {
          op: 'equals',
          expr1: 'from',
          expr2: data
        }
      }).then(async ids => {
        if (ids.length === 0) {
          resolve(false)
          return
        }

        arweave.transactions.getData(ids[0], { decode: true, string: true }).then(data => {
          resolve(data)
        })
      })
    })
  },

  /**
   * 获取上传给定大小的文件需要支付多少 Winston。
   * 注意：在展示时请使用 winstonToAr 转换为 AR 在显示，在运算时，请保持在 Winston 单位运算，以保证精确。
   * @param {*} byte
   */
  async getUploadPrice (byte) {
    const res = await Axios.get(`${arweaveHost}/price/${Number(byte)}`)
    if (res && res.data) return res.data
    else return 0
  },

  async getPaymentPrice (address) {
    const res = await Axios.get(`${arweaveHost}/price/1/${address}`)
    if (res && res.data) return res.data
    else return 0
  },

  winstonToAr (winston) {
    return arweave.ar.winstonToAr(winston)
  },

  getBalance (key) {
    return new Promise((resolve, reject) => {
      arweave.wallets.jwkToAddress(key).then(address => {
        arweave.wallets.getBalance(address).then((balance) => {
          resolve(arweave.ar.winstonToAr(balance))
        }).catch(err => {
          reject(err)
        })
      })
    })
  }
}

export default arql
