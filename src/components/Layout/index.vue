<template>
  <div class="layout">
    <Header />
    <div class="slot-shell">
      <slot/>
    </div>
    <Footer />
  </div>
</template>

<script>
import Header from '@/components/Layout/Header'
import Footer from '@/components/Layout/Footer'

export default {
  components: {
    Header,
    Footer
  }
}
</script>

<style lang="less" scoped>
.layout {
  width: 100%;

  .slot-shell {
    min-height: calc(100vh - 320px);
  }
}
</style>
