<template>
  <header>
    <div class="header">
      <div class="header-links">
        <span>Title1</span>
        <span>Title2</span>
      </div>
      <div class="header-logo">
        <span>Growth</span>
      </div>
      <div class="header-option">
        <!-- <svg-icon icon-class="account" class="header-option-icon"/> -->
        <!-- <span class="icon"><i class="el-icon-picture-outline-round"></i></span> -->
        <div class="header-option-items" @click="switchTheme"><mdicon class="theme-switch" name="brightness-6" /></div>
        <el-button class="header-option-items" @click="showKeyReader = true">Login</el-button>
        <el-button class="header-option-items" @click="signForLogin">Sign</el-button>
      </div>
      <KeyReader v-model="showKeyReader" @key-file="getJwk" />
    </div>
  </header>
</template>

<script>
// import Axios from 'axios'
import { mapActions } from 'vuex'

import API from '@/api/api'
import { FileUtil } from '@/util/file'
// import jwkUtil from '@/util/jwk'
import { getCookie, setCookie, removeCookie } from '@/util/cookie'

import KeyReader from '@/components/Common/KeyReader'

export default {
  components: {
    KeyReader
  },
  data () {
    return {
      showKeyReader: false,
      keyFileContent: '',
      loginBtnLoading: false,
      writeCookie: false,
      file: null,
      fileName: '',
      fileContent: '',
      fileRaw: '',
      isWalletLoaded: ''
    }
  },
  computed: {
  },
  watch: {
    keyFileContent (val) {
    }
  },
  mounted () {
    this.initJwkLogin()
    this.initWalletPlugin()
  },
  methods: {
    ...mapActions(['setMyJwk', 'setMyAddress', 'setMyUsername', 'setMyAvatar', 'logout']),
    /** 初始化 JWK 登录 */
    async initJwkLogin () {
      const jwk = getCookie('arclight_userkey')
      if (jwk) {
        this.loginBtnLoading = true
        await this.loginByJwk(JSON.parse(jwk))
        this.loginBtnLoading = false
      }
    },
    /** 获取 JWK */
    async getJwk (key) {
      this.loginBtnLoading = true
      try {
        // 检查是否是Arweave的Key
        if (!await FileUtil.isValidKeyFile(key)) {
          this.showKeyReader = false
          this.loginBtnLoading = false
          this.$message.error(this.$t('failure.fileFormatError'))
          return
        }
        // 登录
        const res = await this.loginByJwk(key)
        // 如果用户选择了记住登录状态，则将 JWK 保存到 cookie 中
        if (res && this.writeCookie) {
          removeCookie('arclight_userkey')
          setCookie('arclight_userkey', JSON.stringify(key), 7)
        }
      } catch (err) {
        this.$message.error(this.$t('failure.login'))
        console.error(err)
      }
      this.loginBtnLoading = false
    },
    /** 通过 Jwk 登录 */
    async loginByJwk (key) {
      try {
        this.setMyJwk(JSON.stringify(key))
        // 获取钱包地址
        const address = await API.arweave.getAddress(key)
        this.setMyAddress(address)
        // 通过钱包地址获取用户名
        try {
          const res = await API.arweave.getIdFromAddress(address)
          this.setMyUsername(res ? res.data : 'guest')
        } catch (err) {
          // 错误处理
          if (err.message.startsWith('timeout')) {
            // 获取用户名超时
            this.$message.error(this.$t('login.connectionTimeout'))
            this.logout()
            return false
          } else {
            // 其他错误
            console.warn('uncaught error: ' + err)
            this.setMyUsername('guest')
          }
        }
        // 异步获取用户头像
        this.setMyAvatarByAddress(address)
        return true
      } catch (err) {
        this.$message.error(this.$t('failure.login'))
        console.warn('uncaught error: ' + err)
        this.logout()
        return false
      }
    },
    /** 通过地址设置我的头像 */
    async setMyAvatarByAddress (address) {
      try {
        const data = await API.arweave.getAvatarFromAddress(address)
        this.setMyAvatar(data)
      } catch (err) {
        if (err.message.startsWith('timeout')) {
          this.$message.error(this.$t('failure.gettingAvatarTimeout'))
        }
        console.warn('uncaught error: ' + err)
      }
    },
    /** 切换主题 */
    switchTheme () {
      // 主题样式 Theme
      const themes = ['light-theme', 'dark-theme', 'pink-theme']
      const current = document.getElementById('app').classList
      const currentTheme = [...current].filter(name => /^.*-theme$/i.test(name)).pop()
      if (current.contains(currentTheme)) {
        current.remove(currentTheme)
        if (themes.indexOf(currentTheme) === (themes.length - 1)) {
          current.add(themes[0])
        } else {
          current.add(themes[themes.indexOf(currentTheme) + 1])
        }
      }
    },
    /** 初始化钱包插件 */
    initWalletPlugin () {
      // 获取当前使用的钱包的地址。"arweave-js "将处理所有的幕后工作（权限等）。
      // 重要的是：这个函数返回一个 Promise，在用户登录之前不会被解析。
      addEventListener('arweaveWalletLoaded', async () => {
        const addr = await API.ArweaveNative.wallets.getAddress()
        // 获得地址
        console.log(addr)
        // 设定地址
        this.setMyAddress(addr)
      })
      // 当用户切换钱包时获得新的钱包
      // 你也可以监听钱包切换事件（当用户选择使用另一个钱包时）。
      addEventListener('walletSwitch', (e) => {
        const newAddr = e.detail.address
        // 获得地址
        console.log(newAddr)
      // 设定地址
      })
    },
    /** 使用插件登录时进行签名请求 */
    async signForLogin (verifyCode) {
      if (window.arweaveWallet) {
        try {
          const existingPermissions = await window.arweaveWallet.getPermissions()

          if (!existingPermissions.includes('SIGN_TRANSACTION')) await window.arweaveWallet.connect(['SIGN_TRANSACTION'])
        } catch {
          // Permission is already granted
        }

        const tx = { format: 2, data: verifyCode }
        try {
          const signedResult = await window.arweaveWallet.sign(tx)
          return { data: signedResult }
        } catch (e) {
          console.error(e)
        }
      }
    }
  }
}
</script>

<style lang="less" scoped>
header {
  .header {
    width: 100%;
    height: 60px;
    padding: 20px 20px;
    display: flex;
    align-items: center;
    box-sizing: border-box;
    justify-content: center;
    -webkit-box-shadow: 0px 8px 15px -5px @gray1;
    -moz-box-shadow: 0px 8px 15px -5px @gray1;
    box-shadow: 0px 8px 15px -5px @gray1;
    color: @dark;
    background-color: @background;

    &-links {
      display: flex;
      column-gap: 10px;
      justify-content: flex-start;
      width: 100%;
    }

    &-logo {
      flex: 1;
      flex-grow: 1;
      font-size: 20px;
      font-weight: 500;
    }

    &-option {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      column-gap: 10px;

      &-items {
        .theme-switch {
          color: @primary;
        }
      }
    }
  }
}

.icon {
  color: @primary
}
</style>
