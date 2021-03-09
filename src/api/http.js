
import axios from 'axios'
import { Message } from 'element-ui'
import { getCookie } from '@/util/cookie'

const _axios = axios.create({
  baseURL: process.env.VUE_APP_BACKEND,
  timeout: 20000,
  headers: {}
})

_axios.interceptors.request.use(
  (config) => {
    // 客户端执行
    if (getCookie('session_token')) {
      config.headers['session-token'] = getCookie('session_token')
    }
    const ls = localStorage || window.localStorage
    config.headers.lang = ls.getItem('lang') || 'en'
    return config
  },
  (err) => {
    return Promise.reject(err)
  }
)

// Add a response interceptor
_axios.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    if (error.message.includes('status code 401')) {
      Message.closeAll()
      Message({
        message: '登录状态异常,请重新登录',
        type: 'error'
      })
    }
    // 超时处理
    if (error.message.includes('timeout')) {
      Message.closeAll()
      Message({
        message: '请求超时',
        type: 'error'
      })
    }
    if (error.message.includes('Network Error')) {
      Message.closeAll()
      Message({
        message: '网络错误',
        type: 'error'
      })
    }
    return Promise.reject(error)
  }
)

export default _axios
