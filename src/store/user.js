/* eslint-disable no-async-promise-executor */

export default {
  /** 是否开启命名空间 */
  namespaced: false,

  state: {
    myInfo: {
      address: '',
      username: '',
      avatar: ''
    },
    myJwk: '',
    isWalletLoaded: false,
    wallet: ''
  },
  getters: {
    /** 传入 id，检查是不是当前登录的用户 */
    isMe: (state) => (id) => {
      if (!state.myInfo) return false
      return state.myInfo.id === id
    },
    /** 已登录 */
    isLoggedIn (state) {
      return state.myInfo && state.myInfo.id
    }
  },
  mutations: {
    mSetMyInfo (state, { address, username, avatar }) {
      state.myInfo = {
        address: address || '',
        username: username || '',
        avatar: avatar || ''
      }
    },
    mSetMyJwk (state, jwk) {
      if (jwk && typeof jwk !== 'string') throw new Error('mSetMyJwk: Only accept string type values')
      state.myJwk = jwk || ''
    },
    mSetIsWalletLoaded (state, status) {
      state.isWalletLoaded = status
    }
  },
  actions: {
    /** 设置我的用户信息 */
    setMyInfo: ({ commit }, data) => commit('mSetMyInfo', data),
    /** 设置我的地址 */
    setMyAddress: ({ commit, state }, address) => commit('mSetMyInfo', { ...state.myInfo, address }),
    /** 设置我的用户名 */
    setMyUsername: ({ commit, state }, username) => commit('mSetMyInfo', { ...state.myInfo, username }),
    /** 设置我的头像 */
    setMyAvatar: ({ commit, state }, avatar) => commit('mSetMyInfo', { ...state.myInfo, avatar }),
    /** 设置我的 JSON Web Key */
    setMyJwk: ({ commit }, jwk) => commit('mSetMyJwk', jwk),

    setWallet ({ commit }, data) {
      // return new Promise(async (resolve, reject) => {
      //   try {
      //     let errorCaught = false
      //     commit('setWallet', data.address)
      //     commit('setIsWalletLoaded', true)
      //     const res2 = await API.arweave.getIdFromAddress(data.address).catch((err) => {
      //       if (err.message.startsWith('timeout')) {
      //         commit('setLoginConnectionTimeoutFailure', true)
      //         errorCaught = true
      //       } else {
      //         console.warn('uncaught error: ' + err)
      //         commit('setUserAccountFailure', true)
      //         commit('setUsername', 'guest')
      //       }
      //       resolve(true)
      //     })

      //     if (errorCaught) return
      //     commit('setLoginConnectionTimeoutFailure', false)

      //     if (res2) {
      //       commit('setUsername', res2.data)
      //       if (res2.type !== 'guest') {
      //         API.arweave.getAvatarFromAddress(data.address).then(data => {
      //           if (data) {
      //             commit('setUserAvatar', data)
      //           }
      //         }).catch((err) => {
      //           if (err.message.startsWith('timeout')) {
      //             commit('setGettingUserAvatarTimeoutFailure', true)
      //           }
      //         })
      //         resolve(true)
      //       }
      //     }
      //   } catch (err) {
      //     console.warn('uncaught error: ' + err)
      //   }
      // })
    },
    logout ({ commit }) {
      commit('mSetMyInfo', {})
      commit('mSetMyJwk', '')
    }
  }
}
