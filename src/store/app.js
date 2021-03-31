export default {
  /** 是否开启命名空间 */
  namespaced: false,

  state: {
    appLang: 'en-US',
    themeName: '',
    paymentInProgress: ''
  },
  getters: {
    appLang: (state) => {
      return state.appLang
    },
    paymentInProgress: (state) => {
      return state.paymentInProgress
    }
  },
  mutations: {
    setAppLang (state, lang) { state.appLang = lang },
    mSetThemeName (state, name) { state.themeName = name },
    mSetPaymentInProgress (state, status) { state.paymentInProgress = status }
  },
  actions: {
  }
}
