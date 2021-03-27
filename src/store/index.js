import Vue from 'vue'
import Vuex from 'vuex'

import app from './app'
import user from './user'
import contract from './contract'
import uploader from './uploader'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    app,
    user,
    contract,
    uploader
  }
})
