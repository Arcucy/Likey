<template>
  <div
    class="my-order"
    v-loading="loading"
  >
    <div class="my-order-header">
      <h3 class="my-order-header-title">
        {{ $t('pageTitle.myOrder') }}
      </h3>
      <div class="my-order-header-menu">
        <h4>
          <span
            v-for="(item, index) in tabs"
            :class="(tab || defaultTab) === item.type && 'active'"
            :key="index"
            @click="tab = item.type"
          >
            {{ $t(item.label) }}
          </span>
        </h4>
      </div>
      <div class="my-order-container">
        <div v-if="tabList.length > 0">
          <PurchasedItem
            v-for="(item, index) of tabList"
            :key="index"
            :purchase="item"
          />
          <InfiniteScroll
            class="flow-card"
            :no-data="!tabList || !tabList.length"
            :loading="loading"
            :distance="500"
            :disable="!hasNextPage"
            @load="getList"
          />
        </div>
        <div class="no-data" v-if="(!flash && tabList.length === 0) || loading">
          <span>{{ $t('order.nodata') }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex'

import { getCookie } from '@/util/cookie'

import PurchasedItem from '@/components/Order/PurchasedItem'
import InfiniteScroll from '@/components/InfiniteScroll'

export default {
  components: {
    PurchasedItem,
    InfiniteScroll
  },
  inject: ['updateQuery'],
  data () {
    return {
      loading: false,
      tab: this.$route.query.tab || '',
      defaultTab: 'all',
      tabs: [
        {
          label: 'order.allPurchases',
          type: 'all'
        },
        {
          label: 'order.sponsors',
          type: 'sponsors'
        },
        {
          label: 'order.donations',
          type: 'donations'
        }
      ],
      purchases: {
        sponsors: [],
        donations: []
      },
      hasNextPage: false,
      tabList: [],
      flash: false,
      pagesize: 10 // 每页数量
    }
  },
  computed: {
    ...mapGetters(['isLoggedIn']),
    ...mapState({
      myAddress: state => state.user.myInfo.address,
      themeName: state => state.app.themeName
    }),
    maxPage () {
      return Math.ceil(this.tabList.length / this.pagesize)
    },
    /** tabList 中最后条数据的 cursor（索引） */
    endCursor () {
      if (!this.tabList || !this.tabList.length) return ''
      return this.tabList[this.tabList.length - 1].cursor
    }
  },
  watch: {
    isLoggedIn: {
      async handler (val) {
        if (val) await this.initUserData()
        else {
          // 对于没有登录的用户，检查 Cookie 中是否有 key，
          // 如果有的话，等待登录完成，没有则直接退回主页。
          const jwk = getCookie('arclight_userkey')
          if (!jwk) {
            this.$message.warning(this.$t('failure.noPermissionToAccessPage'))
            this.$router.push({ name: 'Home' })
          }
        }
      },
      immediate: true
    },
    async tab (val) {
      this.flash = true
      this.tabList = []
      this.page = 1
      this.updateQuery('tab', val)

      if (this.isLoggedIn) {
        await this.getList(val || this.defaultTab)
      }
      setTimeout(() => { this.flash = false })
    }
  },
  mounted () {
  },
  methods: {
    ...mapActions(['getPstContract']),
    /** 初始化用户订单数据 */
    async initUserData () {
      await this.getList(this.tab || this.defaultTab)
    },
    /** 解析标签为属性字段 */
    parseTags (purchase) {
      for (let i = 0; i < purchase.transactions.edges.length; i++) {
        if (purchase.transactions.edges[i].node) {
          // 整理标签
          const tags = {}
          purchase.transactions.edges[i].node.tags.forEach(tag => {
            const name = tag.name.replace('-', '').replace('_', '').toLowerCase()
            Object.defineProperty(tags, name, {
              value: tag.value,
              writable: true,
              enumerable: true
            })
          })
          purchase.transactions.edges[i].node.parsedTag = tags
          purchase.transactions.edges[i].node.target = purchase.transactions.edges[i].node.recipient
          purchase.transactions.edges[i].node.txType = 'Out'
        }
      }
    },
    /** 获取标签页的数据 */
    async getList (tab) {
      if (this.loading) return
      this.loading = true
      const tx = await this.$api.gql.getAllPurchases(this.myAddress, tab, this.pagesize, this.endCursor)
      this.parseTags(tx)

      this.tabList.push(...tx.transactions.edges)
      this.hasNextPage = tx.transactions.pageInfo.hasNextPage
      this.loading = false
    },
    /** 页面切换控制 */
    handlePageChange (pageNum) {
      this.loading = true
      setTimeout(() => {
        this.page = pageNum
        this.loading = false
      }, 200)
    }
  }
}
</script>

<style lang="less" scoped>
.my-order {
  margin: 20px auto 0px;
  padding: 10px;
  box-sizing: border-box;
  max-width: 1200px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

  &-header {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    flex: 1;

    &-title {
      color: @dark;
      margin-bottom: 10px;
      line-height: 22px;
      text-align: left;
    }

    &-menu {
      h4 {
        font-size: 16px;
        text-align: left;
        margin-bottom: 16px;
        span {
          transition: all 0.3s ease;
          cursor: pointer;
          color: @gray2;
          margin-right: 20px;
          display: inline-block;
          &:hover {
            color: @dark;
          }
          &.active {
            color: @primary;
          }
        }
      }
    }
  }

  &-container {
    width: 100%;
    flex: 1;

    .no-data {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-top: 20px;
      margin-bottom: 50px;
      font-weight: 500;
    }
  }

  &-pagination {
    margin: 20px 10px 20px;
    width: calc(100% - 20px);
    display: flex;
    justify-content: center;
  }
}
</style>
