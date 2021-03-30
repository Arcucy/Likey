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
            {{ item.label }}
          </span>
        </h4>
      </div>
      <div class="my-order-container">
        <div v-if="tabList.length > 0">
          <PurchasedItem
            v-for="(item, index) of paginatedList"
            :key="index"
            :purchase="item"
          />
        </div>
        <div class="no-data" v-if="loading || tabList.length === 0">
          <span>No Data</span>
        </div>
      </div>
      <div
        class="my-order-pagination"
        v-if="tabList.length > 0"
      >
        <el-pagination
          background
          layout="prev, pager, next"
          :page-count="maxPage"
          :page-size="pagesize"
          :total="tabList.length"
          :current-page="Number(page)"
          @current-change="handlePageChange"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'

import { getCookie } from '@/util/cookie'

import PurchasedItem from '@/components/Order/PurchasedItem'

export default {
  components: {
    PurchasedItem
  },
  inject: ['updateQuery'],
  data () {
    return {
      loading: false,
      tab: this.$route.query.tab || '',
      defaultTab: 'all',
      tabs: [
        {
          label: 'All Purchases',
          type: 'all'
        },
        {
          label: 'Sponsors',
          type: 'sponsors'
        },
        {
          label: 'Donations',
          type: 'donations'
        }
      ],
      purchases: {
        sponsors: [],
        donations: []
      },
      tabList: [],
      flash: false,
      page: this.$route.query.page || 1, // 页码
      pagesize: 2 // 每页数量
    }
  },
  computed: {
    ...mapGetters(['isLoggedIn']),
    ...mapState({
      myAddress: state => state.user.myInfo.address
    }),
    paginatedList () {
      if (this.flash) return []
      return this.tabList.slice((this.page - 1) * this.pagesize, this.page * this.pagesize)
    },
    maxPage () {
      return Math.ceil(this.tabList.length / this.pagesize)
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
    tab (val) {
      console.log(val)
      this.tabList = []
      this.page = 1
      this.updateQuery('tab', val)
      if (this.isLoggedIn) {
        console.log(this.getList(val || this.defaultTab))
      }
    },
    page (val) {
      this.flash = true
      setTimeout(() => { this.flash = false }, 100)
      this.updateQuery('page', val)
    }
  },
  mounted () {
    this.$nextTick(() => {
      this.tabs[0].label = this.$t('orderTab.allPurchases')
      this.tabs[1].label = this.$t('orderTab.sponsors')
      this.tabs[2].label = this.$t('orderTab.donations')
    })
  },
  methods: {
    /** 初始化用户订单数据 */
    async initUserData () {
      this.loading = true
      this.purchases = await this.$api.gql.getAllPurchases(this.myAddress)
      this.getList(this.tab || this.defaultTab)
      await this.parseTags(this.purchases)
      this.loading = false
    },
    /** 解析标签为属性字段 */
    async parseTags (purchase) {
      for (const arr of Object.values(purchase)) {
        for (let i = 0; i < arr.length; i++) {
          if (arr[i]) {
            const tags = {}
            arr[i].tags.forEach(tag => {
              const name = tag.name.replace('-', '').replace('_', '').toLowerCase()
              Object.defineProperty(tags, name, {
                value: tag.value,
                writable: true,
                enumerable: true
              })
            })
            arr[i].parsedTag = tags
          }
        }
      }
    },
    /** 获取标签页的数据 */
    getList (tab) {
      switch (tab) {
        case 'all':
          this.tabList = [...this.purchases.sponsors, ...this.purchases.donations]
          break
        case 'sponsors':
          this.tabList = this.purchases.sponsors
          break
        case 'donations':
          this.tabList = this.purchases.donations
          break
        default:
          this.tabList = []
          break
      }
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
      font-weight: 500;
    }
  }

  &-pagination {
    margin: 20px 10px 20px;
    width: 100%;
    display: flex;
    justify-content: center;
  }
}
</style>
