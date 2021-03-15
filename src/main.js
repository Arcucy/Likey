import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './plugins/element.js'

import mdiVue from 'mdi-vue'
import * as mdijs from '@mdi/js'
import '@/icons'
import VueClipboards from 'vue-clipboard2'
import i18n from './i18n'

import API from '../src/api/api'

Vue.use(mdiVue, {
  icons: mdijs
})

Vue.use(VueClipboards)

Vue.config.productionTip = false

Vue.prototype.$api = API

new Vue({
  router,
  store,
  i18n,
  render: h => h(App)
}).$mount('#app')
