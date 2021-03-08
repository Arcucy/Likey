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
import KeyReader from '@/components/Common/KeyReader'

export default {
  components: {
    KeyReader
  },
  data () {
    return {
      showKeyReader: false,
      keyFile: ''
    }
  },
  watch: {
    keyFile (val) {
      console.log(val)
    }
  },
  methods: {
    getKey (key) {
      // 接下来需要 key 的函数，也可以是赋值
    },
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
