<template>
  <div id="app" v-if="routerAlive">
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

<style lang='less'>
body {
  margin: 0;
  padding: 0;
  font-family: 'Likey-NunitoSans', 'Microsoft YaHei', sans-serif;
}

[lang^='zh'] body {
  font-family: 'Source Han Sans', 'Microsoft YaHei', 'Hiragino Sans GB', '微软雅黑';
}

[lang^='ja'] body {
  font-family: 'Source Han Sans', 'ヒラギノ角ゴ Pro','Hiragino Kaku Gothic Pro','メイリオ',Meiryo,Osaka,'ＭＳ Ｐゴシック','MS PGothic','MS Gothic', 'ＭＳ ゴシック','Helvetica Neue',Helvetica,Arial, sans-serif;
}

[lang^='ko'] body {
  font-family: 'Source Han Sans', '나눔 고딕','Nanum Gothic', '맑은 고딕', 'Malgun Gothic', 'Apple Gothic',' 돋움', Dotum,' Helvetica Neue', sans-serif;
}

textarea {
  font-family: 'Likey-NunitoSans', 'Microsoft YaHei', 'Source Han Sans', sans-serif;
}

#app {
  width: 100%;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.transaction-message {
  &-text {
    display: block;
    text-align: left;
  }

  &-id {
    overflow-wrap: anywhere;
    text-decoration: none;
    color: @primary;

    &:hover {
      color: @secondary;
    }
  }
}
</style>
