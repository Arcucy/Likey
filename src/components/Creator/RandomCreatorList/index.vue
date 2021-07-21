<template>
  <div class="creator-list" v-loading="!notCreators && !creatorsAddress.length">
    <CreatorItem v-for="address of list" :key="address" :address="address" />
  </div>
</template>

<script>
import { mapState } from 'vuex'

import CreatorItem from './CreatorItem'

export default {
  components: {
    CreatorItem
  },
  props: {
    pagesize: {
      type: Number,
      default: 5
    },
    refresh: {
      type: Number,
      default: 0
    }
  },
  data () {
    return {
      list: []
    }
  },
  computed: {
    ...mapState({
      creatorsAddress: state => Object.keys(state.contract.creators),
      contract: state => state.contract
    }),
    notCreators () {
      return !this.contract.loading && !this.creatorsAddress.length
    }
  },
  watch: {
    creatorsAddress: {
      handler (value) {
        // 初次生成列表
        if (!this.list.length && value.length) {
          this.list = this.getRandomChildList(value, this.pagesize)
        }
      },
      immediate: true
    },
    refresh () {
      // 点击刷新按钮后生成列表
      if (!this.creatorsAddress.length) return
      this.list = this.getRandomChildList(this.creatorsAddress, this.pagesize)
    }
  },
  mounted () {
  },
  methods: {
    getRandomChildList (list, num) {
      const clist = [...list]
      const res = []
      while (res.length < num && clist.length) {
        res.push(clist.splice(Math.floor(Math.random() * clist.length), 1)[0])
      }
      return res
    }
  }
}
</script>

<style lang="less" scoped>
.creator-list {
  background: @background;
  color: @dark;
  box-shadow: 0 0 2px 0 #0000001a;
  box-sizing: border-box;
  border-radius: 10px;
  padding: 20px;
  overflow: hidden;

  min-height: 108px;
}

@media screen and (max-width: 799px) {
  .creator-list {
    display: flex;
  }
}

@media screen and (max-width: 640px) {
  .creator-list {
    border-radius: 0;
    padding: 20px 16px;
  }
}
</style>
