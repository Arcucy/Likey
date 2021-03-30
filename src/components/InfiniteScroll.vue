<template>
  <div :id="tag">
    <div v-if="noData || loading" class="infinite-scroll" v-loading="loading">
      <p v-if="!loading">
        {{ noDataText || $t('flowCard.noStatusYet') }}
      </p>
    </div>
  </div>
</template>

<script>
import throttle from 'lodash/throttle'

export default {
  props: {
    /** 无数据 */
    noData: {
      type: Boolean,
      default: false
    },
    /** 无数据时的文本 */
    noDataText: {
      type: String,
      default: ''
    },
    /** 加载中 */
    loading: {
      type: Boolean,
      default: false
    },
    /** 触发加载时的距离阈值 */
    distance: {
      type: Number,
      default: 0
    },
    /** 是否在组件渲染完成或解除禁用后立即执行加载方法 */
    immediate: {
      type: Boolean,
      default: true
    },
    /** 组件的 id，用来定位组件在页面中的位置，不能重名 */
    tag: {
      type: String,
      default: 'infinite-scroll-load'
    },
    /** 禁用 */
    disable: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      scrollEvent: null
    }
  },
  watch: {
    disable (val, oldVal) {
      // 如果 immediate 为真值，则在组件解除禁用后立即 load 一次
      if ((!oldVal && val) && this.immediate) this.$emit('load')
    }
  },
  mounted () {
    if (process.browser) {
      this.$nextTick(() => {
        if (this.immediate) this.$emit('load')
        this.scrollEvent = throttle(this._scroll, 300)
        window.addEventListener('scroll', this.scrollEvent)
      })
    }
  },
  destroyed () {
    window.removeEventListener('scroll', this.scrollEvent)
  },
  methods: {
    _scroll () {
      if (this.disable || this.loading) return

      const currentTop = document.body.scrollTop || document.documentElement.scrollTop
      const clientHeight = document.documentElement.clientHeight || document.body.clientHeight

      const element = document.getElementById(this.tag)
      if (!element) return
      if (currentTop + clientHeight >= element.offsetTop - this.distance) {
        this.$emit('load')
      }
    }
  }
}
</script>

<style scoped lang="less">
.infinite-scroll {
  height: 100px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 6px;

  p {
    margin: 0;
    padding: 0;
    font-size: 14px;
    color: @gray3;
  }
}
</style>
