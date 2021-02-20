<template>
  <div id="app">
    <!-- Vue 专有的功能，把当前页面所在的路由放到 <div id="app"> 里面 -->
    <router-view></router-view>
  </div>
</template>

<script>

export default {
  name: 'app',
  components: {
  }
}
</script>

<style lang="less">
body {
  margin: 0;
  padding: 0;
}

#app {
  width: fit-content;
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;

  // 自动居中
  margin: 0 auto;
}
</style>
