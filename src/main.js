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

const light = () => import('../src/themes/element/theme/light.css')
const pink = () => import('../src/themes/element/theme/pink.css')

const ls = localStorage || window.localStorage
const themeName = ls.getItem('theme')
if (!themeName) {
  light()
}

const loadTheme = async (themeName) => {
  switch (themeName) {
    case 'light':
      light()
      break
    case 'pink':
      pink()
      break
    case 'dark':
      pink()
      break
  }
}

loadTheme(themeName)

Vue.use(mdiVue, {
  icons: mdijs
})

Vue.use(VueClipboards)

Vue.config.productionTip = false
Vue.prototype.$api = API
Vue.prototype.$switchElementTheme = loadTheme

new Vue({
  router,
  store,
  i18n,
  render: h => h(App)
}).$mount('#app')
