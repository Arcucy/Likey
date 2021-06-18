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
      return xssUtil.urlAddATag(xssUtil.escapeHtml(this.filterBlanks(this.text.trim())))
    }
  },
  methods: {
    filterBlanks (test) {
      // 开头不能有空白
      const regexp = new RegExp('(^\\s+.*?)', 'g')
      let newVal = test.replace(regexp, '')
      // 空格不能超过两个
      const regexp2 = new RegExp('( {3,})', 'g')
      newVal = newVal.replace(regexp2, '  ')
      // 换行不能超过两个
      const regexp3 = new RegExp('[\\n\\r]{3,}', 'g')
      newVal = newVal.replace(regexp3, '\n\n')
      return newVal
    }
  }
}
</script>

<style lang="less" scoped>
.dynamic-text {
  color: @dark;
  overflow: hidden;
  width: 100%;
  font-size: 15px;
  line-height: 20px;
  font-weight: 400;
  margin: 0 0 5px;

  white-space: pre-wrap;
  overflow-wrap: break-word;
  word-wrap: break-word;
  -ms-word-break: break-all;
  word-break: break-word;

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
