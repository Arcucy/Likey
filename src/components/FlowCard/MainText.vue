<template>
  <contentRender class="dynamic-text" :class="limitLines && 'limit-lines'" :content="content || '&nbsp;'" />
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
    text: {
      type: String,
      default: ''
    },
    limitLines: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    content () {
      return xssUtil.urlAddATag(xssUtil.escapeHtml(this.text.trim()))
    }
  }
}
</script>

<style lang="less" scoped>
.dynamic-text {
  color: #333;
  overflow: hidden;
  width: 100%;
  white-space: pre-line;
  word-break: break-all;
  word-wrap: break-word;
  line-height: 1.5;
  margin: 0 0 5px;
  /deep/ a {
    color: @primary;
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }
  &.limit-lines {
    display: -webkit-box;
    -webkit-line-clamp: 20;
    -webkit-box-orient: vertical;
  }
}
</style>
