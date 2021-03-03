<template>
  <header class="header">
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
  </header>
</template>

<script>
export default {
  methods: {
    switchTheme () {
      const current = document.getElementById('app').classList
      if (current.contains('dark-theme')) {
        current.remove('dark-theme')
        current.add('light-theme')
      } else if (current.contains('light-theme')) {
        current.remove('light-theme')
        current.add('dark-theme')
      }
    }
  }
}
</script>

<style lang="less" scoped>
header {
  width: 100%;
  height: 70px;
  padding: 20px 20px;
  display: flex;
  align-items: center;
  box-sizing: border-box;
  justify-content: space-between;
  -webkit-box-shadow: 0px 8px 15px -5px @secondary;
  -moz-box-shadow: 0px 8px 15px -5px @secondary;
  box-shadow: 0px 8px 15px -5px @secondary;
  color: @dark;
  background-color: @background;

  .header {
    &-links {
      flex: 1;

      display: flex;
      column-gap: 10px;
    }

    &-logo {
      flex: 1;
      font-weight: 500;
    }

    &-option {
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
