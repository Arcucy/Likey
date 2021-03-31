export default {
  /** 是否开启命名空间 */
  namespaced: false,

  state: {
    appLang: 'en-US',
    themeName: '',
    paymentInProgress: false,
    donationPaymentInProgress: false
  },
  getters: {
    appLang: (state) => {
      return state.appLang
    },
    paymentInProgress: (state) => {
      return state.paymentInProgress
    },
    donationPaymentInProgress: (state) => {
      return state.donationPaymentInProgress
    }
  },
  mutations: {
    setAppLang (state, lang) { state.appLang = lang },
    mSetThemeName (state, name) { state.themeName = name },
    mSetPaymentInProgress (state, status) { state.paymentInProgress = status },
    mSetDonationPaymentInProgress (state, status) { state.donationPaymentInProgress = status }
  },
  actions: {
  }
}
