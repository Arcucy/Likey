<template>
  <contentRender class="dynamic-text" :content="content || '&nbsp;'" />
</template>

<script>
import Vue from 'vue'
import xssUtil from '@/util/xss'

export default {
  components: {
    /** 通过这个中继组件，可以将 content 中的 vue 组件渲染出来 */
    contentRender: {
      props: {
        content: String
      },
      render (h) {
        const com = Vue.extend({
          template: `<p>${this.content}</p>`
        })
        return h(com, {})
      }
    }
  },
  props: {
    // 卡片数据
    card: {
      type: Object,
      default: null
    }
  },
  computed: {
    content () {
      return xssUtil.urlAddATag(xssUtil.escapeHtml(this.card.content.trim()))
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
  /deep/ a {
    color: @primary;
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }
}
</style>
