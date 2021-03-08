import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './plugins/element.js'

import mdiVue from 'mdi-vue'
import * as mdijs from '@mdi/js'
import '@/icons'
import i18n from './i18n'

Vue.use(mdiVue, {
  icons: mdijs
})

Vue.config.productionTip = false

new Vue({
  router,
  store,
  i18n,
  render: h => h(App)
}).$mount('#app')
