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
      </div>
      <KeyReader v-model="showKeyReader" @key-file="getKey" />
    </div>
  </header>
</template>

<script>
import { mapActions } from 'vuex'

import API from '@/api/api'
import { FileUtil } from '@/util/file'

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
      fileRaw: ''
    }
  },
  watch: {
    keyFileContent (val) {
    }
  },
  methods: {
    ...mapActions(['setKey', 'setWallet', 'logout']),
    getKey (key) {
      // 接下来需要 key 的函数，也可以是赋值
      // loginWithKey
    },
    // 使用钱包密钥登录
    loginWithKey () {
      try {
        this.keyFile = this.file
        this.fileName = this.keyFile.name
        const reader = new FileReader()
        reader.readAsText(this.keyFile)
        reader.onload = async (e) => {
          try {
            const fileContent = JSON.parse(e.target.result)

            if (!await FileUtil.isValidKeyFile(fileContent)) { // 提前检查是否是Arweave的Key
              this.showKeyReader = false
              this.loginBtnLoading = false
              // 错误处理
              return
            }

            this.fileContent = fileContent
            this.fileRaw = JSON.stringify(this.fileContent)
            const data = {
              file: this.file,
              raw: this.fileRaw,
              name: this.fileName,
              content: this.fileContent
            }
            await this.setKey(data)
            this.needUpload = false
            this.showKeyReader = false
            if (this.writeCookie) {
              // clearCookie('arclight_userkey')
              // setCookie('arclight_userkey', this.fileRaw, 7)
            }
          } catch (err) {
            // 错误处理
          }
        }
      } catch {
        // this.loginBtnLoading = false
      }
    },
    // 切换主题
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
    }
  },
  mounted () {
    console.log(process.env.VUE_APP_TITLE)
    // 获取当前使用的钱包的地址。"arweave-js "将处理所有的幕后工作（权限等）。
    // 重要的是：这个函数返回一个 Promise，在用户登录之前不会被解析。
    addEventListener('arweaveWalletLoaded', async () => {
      const addr = await API.Arweave.wallets.getAddress()
      // 获得地址
      console.log(addr)

      // 设定地址
    })

    // 当用户切换钱包时获得新的钱包
    // 你也可以监听钱包切换事件（当用户选择使用另一个钱包时）。
    addEventListener('walletSwitch', (e) => {
      const newAddr = e.detail.address
      // 获得地址
      console.log(newAddr)

      // 设定地址
    })
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
