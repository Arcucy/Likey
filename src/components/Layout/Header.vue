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
        <div @click="switchTheme"><mdicon class="theme-switch" name="brightness-6" /></div>
      </div>
    </div>
  </header>
</template>

<script>
export default {
  methods: {
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
    height: 50px;
    padding: 20px 20px;
    display: flex;
    align-items: center;
    box-sizing: border-box;
    justify-content: center;
    -webkit-box-shadow: 0px 8px 15px -5px @secondary;
    -moz-box-shadow: 0px 8px 15px -5px @secondary;
    box-shadow: 0px 8px 15px -5px @secondary;
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
      display: flex;
      width: 100%;
      justify-content: flex-end;
      .theme-switch {
        color: @primary;
      }
    }
  }
}

.icon {
  color: @primary
}
</style>
