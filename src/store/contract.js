import API from '../api/api'

/** 缓存有效时长，单位：秒 */
const CACHE_DURATION = 30

export default {
  /** 是否开启命名空间 */
  namespaced: false,

  state: {
    /** 管理员 */
    admins: [],
    /** 创作者列表。是个对象，键是用户的钱包地址 */
    creators: {},
    /** 合约持有者 */
    owner: '',
    /** 事例 */
    schema: {
      categories: [],
      scales: []
    },
    /** 合约版本号 */
    version: '',
    /** 加载状态 */
    loading: false,
    /** 缓存时间戳 */
    timestamp: 0,
    creatorPst: {}
  },
  getters: {
  },
  mutations: {
    /** 设置合约状态，传入一个对象，对象内为 undefined 的值将不会被修改 */
    mSetLikeyContractStatus (state, {
      admins = state.admins,
      creators = state.creators,
      owner = state.owner,
      schema: {
        categories = state.schema.categories,
        scales = state.schema.scales
      },
      version = state.version
    }) {
      state.admins = admins
      state.creators = creators
      state.owner = owner
      state.schema = {
        categories,
        scales
      }
      state.version = version
    },
    /** 设置合约是否正在加载 */
    mSetLikeyContractLoading (state, data) {
      state.loading = !!data
    },
    updateLikeyContractTimestamp (state) {
      state.timestamp = Date.now()
    },
    mSetLikeyCreatorPstContract (state, data) {
      const { contractId, contractState } = data
      const obj = {}

      // 重新创建一个并更新数据
      Object.defineProperty(obj, contractId, {
        value: { ...contractState, loading: false, timestamp: Date.now() },
        writable: true,
        enumerable: true
      })

      state.creatorPst = { ...state.creatorPst, ...obj }
    },
    mSetLikeyCreatorPstContractLoading (state, data) {
      const { contractId, loading } = data
      if (!state.creatorPst[contractId]) {
        return
      }
      state.creatorPst[contractId] = { ...state.creatorPst[contractId], loading }
    },
    mSetLikeyCreatorPstContractTimestamp (state, data) {
      const { contractId } = data
      if (!state.creatorPst[contractId]) {
        return
      }
      state.creatorPst[contractId] = { ...state.creatorPst[contractId], timestamp: Date.now() }
    }
  },
  actions: {
    async initLikeyContract ({ commit }) {
      try {
        commit('mSetLikeyContractLoading', true)
        const res = await API.contract.readLikeyContract()
        commit('mSetLikeyContractStatus', res)
        commit('updateLikeyContractTimestamp')
        commit('mSetLikeyContractLoading', false)
        return JSON.parse(JSON.stringify(res))
      } catch (err) {
        commit('mSetLikeyContractLoading', false)
        throw err
      }
    },

    async initLikeyCreatorContract ({ commit }, data) {
      try {
        commit('mSetLikeyCreatorPstContractLoading', { contractId: data.contractId, loading: true })
        const contractState = await API.contract.readLikeyCreatorPstContract(data.contractId)
        commit('mSetLikeyCreatorPstContract', { contractId: data.contractId, contractState })
        commit('mSetLikeyCreatorPstContractTimestamp', { contractId: data.contractId })
        commit('mSetLikeyCreatorPstContractLoading', { contractId: data.contractId, loading: false })
        return JSON.parse(JSON.stringify(contractState))
      } catch (err) {
        commit('mSetLikeyCreatorPstContractLoading', { contractId: data.contractId, loading: false })
        throw err
      }
    },

    // ***************************************************
    // * 因为这些数据获取都涉及到异步操作，所以写在 actions 中  *
    // ***************************************************

    /** 根据地址获取用户的创作者信息 */
    async getCreatorInfo ({ state, dispatch }, address) {
      // 先调用这个方法～
      await checkCache(state, dispatch)
      return state.creators[address] || null
    },

    /** 通过主页地址获取钱包地址 */
    async getAddressByShortname ({ state, dispatch }, shortname) {
      await checkCache(state, dispatch)
      for (const [key, value] of Object.entries(state.creators)) {
        if (value.shortname === shortname) return key
      }
      return ''
    },

    async getPstContract ({ state, dispatch }, contractId) {
      await checkCreatorPstContractCache(state, dispatch, contractId)
      return state.creatorPst[contractId]
    }
  }
}

/** 适用于主合约，检查缓存，如果缓存失效则重新获取，如果正在获取缓存则等待获取完成 */
function checkCache (state, dispatch) {
  return new Promise((resolve, reject) => {
    // 正在获取合约状态，等待获取完成
    if (state.loading) {
      const loadingTimer = setInterval(() => {
        if (!state.loading) {
          clearInterval(loadingTimer)
          resolve()
        }
      }, 100)
      return
    }
    // 缓存失效，重新获取合约状态
    const timeDifference = Date.now() - state.timestamp
    if (timeDifference > 1000 * CACHE_DURATION) {
      dispatch('initLikeyContract').then(() => {
        resolve()
      }).catch(err => {
        reject(err)
      })
      return
    }
    // 没失效，直接用
    resolve()
  })
}

/** 适用于创作者 PST 合约，检查缓存，如果缓存失效则重新获取，如果正在获取缓存则等待获取完成 */
function checkCreatorPstContractCache (state, dispatch, contractId) {
  return new Promise((resolve, reject) => {
    // 正在获取合约状态，等待获取完成
    if (state.creatorPst[contractId] && state.creatorPst[contractId].loading) {
      const loadingTimer = setInterval(() => {
        if (!state.creatorPst[contractId].loading) {
          clearInterval(loadingTimer)
          resolve()
        }
      }, 100)
      return
    }
    let timestamp = 0
    if (!state.creatorPst[contractId]) {
      timestamp = 0
    } else {
      timestamp = state.creatorPst[contractId].timestamp
    }
    // 缓存失效，重新获取合约状态
    const timeDifference = Date.now() - timestamp
    if (timeDifference > 1000 * CACHE_DURATION) {
      dispatch('initLikeyCreatorContract', { contractId }).then(() => {
        resolve()
      }).catch(err => {
        reject(err)
      })
      return
    }
    // 没失效，直接用
    resolve()
  })
}
