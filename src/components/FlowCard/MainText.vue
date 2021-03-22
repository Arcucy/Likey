<template>
  <p class="dynamic-text" v-html="content || '&nbsp;'" />
</template>

<script>

export default {
  components: {
  },
  props: {
    // 卡片数据
    card: {
      type: Object,
      required: true
    }
  },
  computed: {
    content () {
      return 'xxx'
    }
  }
}
</script>

<style lang="less" scoped>
.dynamic-text {
  color: #333;
  overflow: hidden;
  width: 100%;
  word-break: break-word;
  white-space: pre-line;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 20;
  -webkit-box-orient: vertical;
  em {
    font-weight: bold;
    font-style: normal;
    color: rgb(47, 174, 227);
  }
  a {
    color: rgb(47, 174, 227)
  }
}
</style>
