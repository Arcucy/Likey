import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './plugins/element.js'
import '@mdi/font/css/materialdesignicons.css'

import VueClipboards from 'vue-clipboard2'
import i18n from './i18n'
import Aplayer from 'vue-aplayer'
import moment from 'moment'

import '@/icons'
import API from '../src/api/api'
import Filters from '../src/filters/index'
import './index.css'
import '../public/element/theme/dark.css'
import '../public/element/theme/pink.css'
import '../public/element/theme/light.css'

const loadCSS = (path) => {
  const head = document.getElementsByTagName('head')[0]

  const allLinks = document.getElementsByTagName('link')
  for (const l of allLinks) {
    if (l.className === 'theme') {
      l.parentNode.removeChild(l)
    }
  }

  const link = document.createElement('link')
  link.href = path
  link.rel = 'stylesheet'
  link.className = 'theme'
  link.setAttribute('type', 'text/css')
  head.appendChild(link)
}
const ls = localStorage || window.localStorage
const themeName = ls.getItem('theme')
if (!themeName) {
  loadCSS('./element/theme/light.css')
}
const loadTheme = async (themeName) => {
  switch (themeName) {
    case 'light':
      loadCSS('./element/theme/light.css')
      break
    case 'pink':
      loadCSS('./element/theme/pink.css')
      break
    case 'dark':
      loadCSS('./element/theme/dark.css')
      break
  }
}
loadTheme(themeName)

Object.keys(Filters).forEach(key => {
  Vue.filter(key, Filters[key])
})

Vue.config.productionTip = false
Vue.prototype.$api = API
Vue.prototype.$switchElementTheme = loadTheme

moment.locale('en-US')
Vue.prototype.$moment = moment

Vue.use(VueClipboards)
Vue.component('aplayer', Aplayer)
new Vue({
  router,
  store,
  i18n,
  render: h => h(App)
}).$mount('#app')
