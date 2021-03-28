export default {
  /** 是否开启命名空间 */
  namespaced: false,

  state: {
    appLang: 'en-US',
    themeName: ''
  },
  getters: {
    appLang: (state) => {
      return state.appLang
    }
  },
  mutations: {
    setAppLang (state, lang) { state.appLang = lang },
    mSetThemeName (state, name) { state.themeName = name }
  },
  actions: {
  }
}
