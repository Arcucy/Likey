/* eslint-disable no-async-promise-executor */
import Vue from 'vue'
import Vuex from 'vuex'
// import arweave from 'arweave'

import API from '../api/api'

Vue.use(Vuex)

// const arweave = Arweave.init({
//   host: process.env.VUE_APP_ARWEAVE_NODE,
//   port: 443,
//   protocol: 'https',
//   timeout: 20000,
//   logging: false
// })

export default new Vuex.Store({
  state: {
    isLoggedIn: false,
    keyFile: '',
    isWalletLoaded: false,
    wallet: '',
    username: '',
    userType: '',
    userAvatar: '',
    userIntroduction: '',
    userInfoUpdateComplete: '',
    userNoBalanceFailure: false,
    loginConnectionTimeoutFailure: false,
    gettingUserAvatarTimeoutFailure: false,
    isMe: false
  },
  mutations: {
    setIsLoggedIn (state, status) {
      state.isLoggedIn = status
    },
    setKeyFile (state, file) {
      state.keyFile = file
    },
    setIsWalletLoaded (state, status) {
      state.isWalletLoaded = status
    },
    setWallet (state, address) {
      state.wallet = address
    },
    setUsername (state, username) {
      state.username = username
    },
    setUserType (state, type) {
      state.userType = type
    },
    setUserAvatar (state, avatar) {
      state.userAvatar = avatar
    },
    setUserIntroduction (state, intro) {
      state.userIntroduction = intro
    },
    setUserInfoUpdateComplete (state, status) {
      state.userInfoUpdateComplete = status
    },
    setUserNoBalanceFailure (state, status) {
      state.userNoBalanceFailure = status
    },
    setLoginConnectionTimeoutFailure (state, status) {
      state.loginConnectionTimeoutFailure = status
    },
    setGettingUserAvatarTimeoutFailure (state, status) {
      state.gettingUserAvatarTimeoutFailure = status
    },
    setUserAccountFailure (state, status) {
      state.userAccountFailure = status
    },
    setIsMe (state, status) {
      state.isMe = status
    }
  },
  actions: {
    setKey ({ commit }, data) {
      return new Promise(async (resolve, reject) => {
        commit('setKeyFile', data.file)

        try {
          let errorCaught = false
          const res = await API.weave.getAddress(data.content) // 已经检查过地址了无需再次catch
          commit('setWallet', res)
          const res2 = await API.weave.getIdFromAddress(res).catch((err) => {
            if (err.message.startsWith('timeout')) {
              commit('setLoginConnectionTimeoutFailure', true)
              errorCaught = true
            } else {
              console.warn('uncaught error: ' + err)
              commit('setUserAccountFailure', true)
              commit('setUsername', 'guest')
              commit('setUserType', 'Guest')
              commit('setIsLoggedIn', true)
            }
            resolve(true)
          })

          if (errorCaught) return
          commit('setLoginConnectionTimeoutFailure', false)

          if (res2) {
            commit('setUsername', res2.data)
            commit('setUserType', res2.type)
            commit('setIsLoggedIn', true)
            if (res2.type !== 'guest') {
              API.weave.getAvatarFromAddress(res).then(data => {
                if (data) {
                  commit('setUserAvatar', data)
                }
              }).catch((err) => {
                if (err.message.startsWith('timeout')) {
                  commit('setGettingUserAvatarTimeoutFailure', true)
                }
              })
              resolve(true)
            }
          }
        } catch (err) {
          console.warn('uncaught error: ' + err)
        }
      })
    },
    setWallet ({ commit }, data) {
      return new Promise(async (resolve, reject) => {
        try {
          let errorCaught = false
          commit('setWallet', data.address)
          commit('setIsWalletLoaded', true)
          const res2 = await API.weave.getIdFromAddress(data.address).catch((err) => {
            if (err.message.startsWith('timeout')) {
              commit('setLoginConnectionTimeoutFailure', true)
              errorCaught = true
            } else {
              console.warn('uncaught error: ' + err)
              commit('setUserAccountFailure', true)
              commit('setUsername', 'guest')
              commit('setUserType', 'Guest')
              commit('setIsLoggedIn', true)
            }
            resolve(true)
          })

          if (errorCaught) return
          commit('setLoginConnectionTimeoutFailure', false)

          if (res2) {
            commit('setUsername', res2.data)
            commit('setUserType', res2.type)
            commit('setIsLoggedIn', true)
            if (res2.type !== 'guest') {
              API.weave.getAvatarFromAddress(data.address).then(data => {
                if (data) {
                  commit('setUserAvatar', data)
                }
              }).catch((err) => {
                if (err.message.startsWith('timeout')) {
                  commit('setGettingUserAvatarTimeoutFailure', true)
                }
              })
              resolve(true)
            }
          }
        } catch (err) {
          console.warn('uncaught error: ' + err)
        }
      })
    },
    logout ({ commit }) {
      commit('setUsername', '')
      commit('setUserAvatar', undefined)
      commit('setIsLoggedIn', false)
      commit('setWallet', '')
      commit('setIsMe', false)
    },
    setIsMe ({ commit }, status) {
      commit('setIsMe', status)
    }
  },
  modules: {
  }
})
