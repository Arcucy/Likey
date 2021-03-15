<template>
  <div class="layout">
    <Header />
    <div class="slot-shell">
      <slot />
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
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: @gray1;

  .slot-shell {
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    flex: 1;
  }
}
</style>
