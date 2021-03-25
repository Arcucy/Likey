<template>
  <div id="app" v-if="routerAlive" class="light-theme">
    <Layout>
      <router-view />
    </Layout>
  </div>
</template>

<script>
import Layout from '@/components/Layout'

export default {
  name: 'App',
  components: {
    Layout
  },
  provide () {
    return {
      routerRefresh: this.routerRefresh,
      updateQuery: this.updateQuery,
      backPage: this.backPage
    }
  },
  data () {
    return {
      routerAlive: true
    }
  },
  methods: {
    routerRefresh () {
      this.routerAlive = false
      this.$nextTick(() => {
        this.routerAlive = true
      })
    },
    /** 更改 Query */
    updateQuery (key, val) {
      const query = { ...this.$route.query }
      if (query[key] !== val) {
        if (!val) delete query[key]
        else query[key] = val
        this.$router.replace({ query }).catch(e => { // 过滤掉不必要的错误
          if (!e.message.includes('Avoided redundant navigation to current location')) {
            console.error(e.message)
          }
        })
      }
    },
    backPage (defaultLink) {
      const originRoute = { ...this.$route }
      const pushLink = defaultLink || { name: 'Landing' }
      this.$router.go(-1)
      // 如果页面没有变化，返回失败，将回到默认页面
      this.$nextTick(() => {
        if (this.$route.fullPath === originRoute.fullPath) {
          this.$router.push(pushLink)
        }
      })
    }
  }
}
</script>

<style lang="less">
body {
  margin: 0;
  padding: 0;
}

textarea {
  font-family: Arial, Helvetica, sans-serif;
  padding: 10px 15px !important;
}

#app {
  width: 100%;
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
