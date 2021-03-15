<template>
  <el-dropdown @command="handleCommand">
    <span class="el-dropdown-link">
      <div class="header-option-items"><mdicon class="language-switch" name="earth" /></div>
    </span>
    <el-dropdown-menu slot="dropdown">
      <el-dropdown-item command="en-US">
        English
      </el-dropdown-item>
      <el-dropdown-item command="zh-CN">
        简体中文
      </el-dropdown-item>
    </el-dropdown-menu>
  </el-dropdown>
</template>

<script>
import { mapMutations, mapState } from 'vuex'

const localStore = window.localStorage || localStorage

export default {
  data () {
    return {
    }
  },
  computed: {
    ...mapState({
      appLang: state => state.app.appLang
    })
  },
  watch: {
    // 监听 Vuex 变化
    appLang (val) {
      // 执行全局 i18n 更新
      this.setLang(val)
    }
  },
  mounted () {
    // App 初始化并设定语言
    let lang = this.getStoredLangCode()
    if (!lang) {
      this.setLangCodeFromBrowser()
      lang = this.getStoredLangCode()
    }
    switch (lang) {
      case 'zh-CN':
        this.$i18n.locale = 'zh-CN'
        break
      case 'zh-TW':
        this.$i18n.locale = 'zh-TW'
        break
      case 'en-US':
        this.$i18n.locale = 'en'
        break
      case 'ja-JP':
        this.$i18n.locale = 'ja-JP'
        break
    }
  },
  methods: {
    ...mapMutations(['setAppLang']),
    /** Element 选择之后触发设定行为 */
    handleCommand (command) {
      // 设定当前选中的语言到 localStorage 以及传递给 Vuex 进行全局更新
      this.setLangAs(command)
    },
    /** getBrowserLangCode 读取浏览器的语言 */
    getBrowserLangCode () {
      const lang = navigator.languages
      for (let i = 0; i < lang.length; i++) {
        const item = lang[i]
        if (item === 'zh-CN') return item
        if (item === 'zh-TW') return item
        if (item === 'en-US') return item
        if (item === 'ja-JP') return item
      }
    },
    /** getStoredLangCode 读取历史存储过的语言 */
    getStoredLangCode () {
      const storedLang = localStore.getItem('locale_lang')
      this.setAppLang(storedLang)
      return storedLang
    },
    /** setLangCodeFromBrowser 从浏览器内读取 localStorage 并设定语言 */
    setLangCodeFromBrowser () {
      localStore.setItem('locale_lang', this.getBrowserLangCode())
      this.setAppLang(this.getBrowserLangCode())
    },
    /** setLangAs 设定语言为指定语言，仅通过 handleCommand 函数进行调用 */
    setLangAs (lang) {
      localStore.setItem('locale_lang', lang)
      this.setAppLang(lang)
    },
    /** setLang 设定语言并更新到 i18n 组件 */
    setLang (item) {
      switch (item) {
        case 'zh-CN':
          this.$i18n.locale = 'zh-CN'
          break
        case 'zh-TW':
          this.$i18n.locale = 'zh-TW'
          break
        case 'en-US':
          this.$i18n.locale = 'en'
          break
        case 'jp-JP':
          this.$i18n.locale = 'ja-JP'
          break
      }
    }
  }
}
</script>

<style lang="less" scoped>
.language-switch {
  color: @primary;;
}
</style>
