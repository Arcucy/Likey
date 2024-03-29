<template>
  <header>
    <div class="header">
      <div class="header-logo">
        <router-link :to="{ name: 'Landing' }">
          <img src="@/assets/img/logo-80px.png">
          <span>Likey</span>
        </router-link>
      </div>
      <div class="header-links">
        <router-link :to="{ name: 'Home' }">
          {{ $t('pageTitle.home') }}
        </router-link>
        <!-- <router-link :to="{ name: 'ThemesTest' }">
          {{ $t('pageTitle.themesTest') }}
        </router-link> -->
      </div>
      <div class="header-option">
        <LanguageSwitch />
        <div class="header-option-items" @click="switchTheme">
          <span class="mdi mdi-brightness-6 theme-switch" />
        </div>
        <!-- 成为创作者按钮 -->
        <router-link class="creator-btn" v-if="!hideStartCreatingButton" :to="{ name: 'Setting-Creator' }">
          <el-button
            v-if="isLoggedIn"
            class="header-option-btn btn-mobile-hide"
            type="primary"
          >
            {{ $t('becomeACreatorBtn') }}
          </el-button>
        </router-link>
        <!-- 我的菜单 -->
        <MyMenu v-if="isLoggedIn" />
        <!-- 登录按钮 -->
        <el-button
          v-else
          class="header-option-btn"
          :disabled="loginBtnLoading"
          type="primary"
          @click="showKeyReader = true"
        >
          <i v-if="loginBtnLoading" class="el-icon-loading" />
          {{ $t('login.login') }}
        </el-button>
        <!-- <el-button class="header-option-items" @click="signForLogin">Sign</el-button> -->
      </div>
      <KeyReader
        v-model="showKeyReader"
        :loading="loginBtnLoading"
        @key-file="getJwk"
        @keep-logged-in="val => keepLoggedIn = val"
      />
    </div>
  </header>
</template>

<script>
// import Axios from 'axios'
import { mapActions, mapGetters, mapState, mapMutations } from 'vuex'

import FileUtil from '@/util/file'
// import jwkUtil from '@/util/jwk'
import { getCookie, setCookie, removeCookie } from '@/util/cookie'

import KeyReader from '@/components/Common/KeyReader'
import MyMenu from '@/components/Layout/MyMenu'
import LanguageSwitch from '@/components/Common/LanguageSwitch'

export default {
  components: {
    KeyReader,
    MyMenu,
    LanguageSwitch
  },
  data () {
    return {
      showKeyReader: false,
      keyFileContent: '',
      loginBtnLoading: false,
      keepLoggedIn: false,
      file: null,
      fileName: '',
      fileContent: '',
      fileRaw: '',
      isWalletLoaded: ''
    }
  },
  computed: {
    ...mapState({
      myInfo: state => state.user.myInfo,
      creators: state => state.contract.creators
    }),
    ...mapGetters(['isLoggedIn', 'isMe']),
    /** 特定情况下隐藏成为创作者按钮 */
    hideStartCreatingButton () {
      const onSettingPage = this.$route.name === 'Setting-Creator' || this.$route.name === 'Setting-Token'
      const onMyProfilePage = this.$route.name === 'User' && this.isMe(this.$route.params.id)
      return onSettingPage || onMyProfilePage || this.isCreator
    },
    isCreator () {
      if (!this.isLoggedIn) return false
      return Boolean(this.creators && this.creators[this.myInfo.address])
    }
  },
  watch: {
  },
  async mounted () {
    this.initJwkLogin()
    this.initTheme()
    this._initLikeyContract()
  },
  methods: {
    ...mapActions(['setMyJwk', 'setMyInfo', 'setMyAddress', 'setMyAvatar', 'logout', 'initLikeyContract', 'getCreatorInfo']),
    ...mapMutations(['mSetThemeName']),
    /** 初始化 JWK 登录 */
    async initJwkLogin () {
      if (this.isLoggedIn) return
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
        this.showKeyReader = false
        // 如果用户选择了记住登录状态，则将 JWK 保存到 cookie 中
        if (res && this.keepLoggedIn) {
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
        const info = {
          address: '',
          username: '',
          type: 'Guest'
        }
        // 获取钱包地址
        info.address = await this.$api.gql.getAddress(key)
        if (!info.address) {
          this.$message.error(this.$t('failure.getAddress'))
          return
        }
        // 通过钱包地址获取用户名
        try {
          const res = await this.$api.gql.getIdByAddress(info.address)
          info.username = res.data
          info.type = res.type
        } catch (err) {
          // 错误处理
          if (err.message.startsWith('timeout')) {
            // 获取用户名超时
            this.$message.error(this.$t('login.connectionTimeout'))
            return false
          } else {
            // 其他错误
            console.warn('uncaught error: ' + err)
          }
        }
        // 登录成功，提交数据
        this.setMyJwk(JSON.stringify(key))
        this.setMyInfo(info)
        this.$message.success(this.$t('success.login'))
        // 异步获取用户头像
        this.setMyAvatarByAddress(info.address)
        return true
      } catch (err) {
        this.$message.error(this.$t('failure.login'))
        console.warn('uncaught error: ' + err)
        return false
      }
    },
    /** 通过地址设置我的头像 */
    async setMyAvatarByAddress (address) {
      try {
        const data = await this.$api.gql.getAvatarByAddress(address)
        this.setMyAvatar(data)
      } catch (err) {
        if (err.message.startsWith('timeout')) {
          this.$message.error(this.$t('failure.gettingAvatarTimeout'))
        }
        console.warn('uncaught error: ' + err)
      }
    },
    /** 初始化获取合约状态 */
    async _initLikeyContract () {
      try {
        const res = await this.initLikeyContract()
        console.log('Likey contract version:', res.version)
      } catch (err) {
        console.error('Failed to obtain contract status, error:', err)
        this.$message.error(this.$t('failure.failedToObtainContractStatus'))
      }
    },
    /** 初始化主题 */
    initTheme () {
      const ls = localStorage || window.localStorage
      const current = document.getElementById('app').classList
      const currentTheme = [...current].filter(name => /^.*-theme$/i.test(name)).pop()

      const lsThemeName = ls.getItem('theme')
      if (lsThemeName) {
        if (current.contains(currentTheme)) {
          current.remove(currentTheme)
        }
        current.add(lsThemeName + '-theme')
        this.mSetThemeName(lsThemeName)
        this.$switchElementTheme(lsThemeName)
      }
      const themeName = currentTheme.split('-')[0]
      ls.setItem('theme', themeName)
      this.mSetThemeName(themeName)
      this.$switchElementTheme(themeName)
    },
    /** 切换主题 */
    switchTheme () {
      const ls = localStorage || window.localStorage

      // 主题样式 Theme
      // const themes = ['light-theme', 'dark-theme', 'pink-theme']
      const themes = ['light-theme', 'pink-theme']
      const current = document.getElementById('app').classList
      const currentTheme = [...current].filter(name => /^.*-theme$/i.test(name)).pop()

      if (current.contains(currentTheme)) {
        current.remove(currentTheme)

        if (themes.indexOf(currentTheme) === (themes.length - 1)) {
          current.add(themes[0])
          const themeName = themes[0].split('-')[0]
          ls.removeItem('theme')
          ls.setItem('theme', themeName)
          this.mSetThemeName(themeName)
          this.$switchElementTheme(themeName)
        } else {
          current.add(themes[themes.indexOf(currentTheme) + 1])
          const themeName = themes[themes.indexOf(currentTheme) + 1].split('-')[0]
          ls.removeItem('theme')
          ls.setItem('theme', themeName)
          this.mSetThemeName(themeName)
          this.$switchElementTheme(themeName)
        }
      }
    }
  }
}
</script>

<style lang="less" scoped>
header {
  box-shadow: 0 0 2px 0 #0000001a;
  border-bottom: 1px solid #f1f1f1;
  box-sizing: border-box;
  color: @dark;
  background-color: @background;
  display: flex;
  justify-content: center;

  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 99;

  .header {
    width: 100%;
    max-width: 1200px;
    height: 60px;
    margin: 0 10px;
    display: flex;
    align-items: center;
    box-sizing: border-box;
    justify-content: center;

    &-links {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: flex-start;
      user-select: none;

      a {
        color: @dark;
        text-decoration: none;
        font-size: 16px;
        font-weight: 500;
        margin-right: 20px;
        &:last-child {
          margin-right: 0;
        }

        &:hover {
          color: @primary;
        }
      }
    }

    &-logo {
      display: flex;
      align-items: center;
      margin-right: 40px;
      user-select: none;
      a {
        display: flex;
        align-items: center;
        color: @dark;
        text-decoration: none;
        font-size: 16px;
        font-weight: 500;
        &:hover {
          color: @primary;
        }
      }
      img {
        width: 40px;
        height: 40px;
        min-width: 40px;
        min-height: 40px;
      }
      span {
        margin: 0 0 0 5px;
        font-size: 20px;
        font-weight: 500;
      }
    }

    &-option {
      display: flex;
      align-items: center;
      justify-content: flex-end;

      &-items {
        user-select: none;

        margin: 0 20px;

        cursor: pointer;
        .theme-switch {
          display: flex;
          align-items: center;
          justify-content: center;
          color: @primary;
          font-size: 25px;
        }
      }

      &-btn {
        padding: 12px 20px;
        min-width: 130px;
      }

      .creator-btn {
        margin-right: 20px;
      }
    }
  }
}

.icon {
  color: @primary
}

@media screen and (max-width: 640px) {
  header {
    .header {
      &-logo {
        margin-right: 20px;
      }
      &-links {

        a {
          font-size: 15px;
          margin-right: 10px;
          &:last-child {
            margin-right: 0;
          }
        }
      }
      &-option {

        &-items {
          margin: 0 10px;
        }

        &-btn {
          padding: 10px 5px;
          min-width: 50px;
          font-size: 12px;
        }
        .creator-btn {
          margin-right: 10px;
        }
      }
    }
  }
}

@media screen and (max-width: 480px) {
  header {
    .header {
      &-logo {
        margin-right: 10px;
        img {
          width: 30px;
          height: 30px;
          min-width: 30px;
          min-height: 30px;
        }
        span {
          display: none;
        }
      }
      &-links {

        a {
          font-size: 15px;
        }
      }
      &-option {
        &-btn {
          &.btn-mobile-hide {
            display: none;
          }
        }
      }
    }
  }
}
</style>
