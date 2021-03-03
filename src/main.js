import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './plugins/element.js'

import mdiVue from 'mdi-vue'
import * as mdijs from '@mdi/js'
import '@/icons'

Vue.use(mdiVue, {
  icons: mdijs
})

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
