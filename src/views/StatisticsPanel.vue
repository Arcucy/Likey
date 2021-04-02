<template>
  <div
    class="my-stats"
    v-loading="loading"
  >
    <div class="my-stats-pst">
      <div class="my-stats-pst-title">
        <h3>
          {{ $t('pageTitle.myStatistic') }}
        </h3>
      </div>
      <div class="my-stats-pst-block">
        <div class="my-stats-pst-block-item" v-loading="contractLoading">
          <span class="my-stats-pst-block-item-title">{{ $t('sponsor.totalSupply') }}</span>
          <span class="my-stats-pst-block-item-number">{{ totalSupply | winstonToAr | abbreviateNumber }}</span>
        </div>
        <div class="my-stats-pst-block-item" v-loading="contractLoading">
          <span class="my-stats-pst-block-item-title">{{ $t('sponsor.holders') }}</span>
          <span class="my-stats-pst-block-item-number">{{ holders | abbreviateNumber }}</span>
        </div>
        <div class="my-stats-pst-block-item" v-loading="totalSponsorsLoading">
          <span class="my-stats-pst-block-item-title">{{ $t('statistics.sponsorCount') }}</span>
          <span class="my-stats-pst-block-item-number">{{ totalSponsors | abbreviateNumber }}</span>
        </div>
        <div class="my-stats-pst-block-item" v-loading="totalDonationsLoading">
          <span class="my-stats-pst-block-item-title">{{ $t('statistics.donationCount') }}</span>
          <span class="my-stats-pst-block-item-number">{{ totalDonations | abbreviateNumber }}</span>
        </div>
      </div>
    </div>
    <div class="my-stats-header">
      <h3 class="my-stats-header-title">
        {{ $t('statistics.historyIncome') }}
      </h3>
      <div class="my-stats-header-menu">
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
      <div class="my-stats-container">
        <PurchasedItem
          v-for="(item, index) of tabList"
          :key="index"
          :purchase="item"
        />
        <InfiniteScroll
          class="orders-card"
          :no-data="!tabList || !tabList.length"
          :no-data-text="$t('order.nodata')"
          :loading="dataLoading"
          :distance="500"
          :disable="!isLoggedIn || !hasNextPage"
          @load="getList"
        />
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
      dataLoading: false,
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
      hasNextPage: true,
      tabList: [],
      flash: false,
      pagesize: 10, // 每页数量，
      totalDonations: 0,
      totalDonationsLoading: false,
      totalSponsors: 0,
      totalSponsorsLoading: false,
      totalSupply: 0,
      holders: 0,
      contractLoading: false
    }
  },
  computed: {
    ...mapGetters(['isLoggedIn']),
    ...mapState({
      myAddress: state => state.user.myInfo.address,
      themeName: state => state.app.themeName,
      creators: state => state.contract.creators,
      creatorPst: state => state.contract.creatorPst
    }),
    maxPage () {
      return Math.ceil(this.tabList.length / this.pagesize)
    },
    creator () {
      return this.creators ? this.creators[this.myAddress] : null
    },
    contract () {
      if (!this.creator) return {}
      return this.creatorPst[this.creator.ticker.contract]
    },
    /** tabList 中最后条数据的 cursor（索引） */
    endCursor () {
      if (!this.tabList || !this.tabList.length) return ''
      return this.tabList[this.tabList.length - 1].cursor
    }
  },
  watch: {
    isLoggedIn: {
      handler (val) {
        if (val) this.initUserData()
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
    ...mapActions(['getPstContract', 'getCreatorInfo']),
    /** 初始化用户订单数据 */
    async initUserData () {
      this.totalSponsorsLoading = true
      this.totalDonationsLoading = true
      this.contractLoading = true
      await this.getCreatorInfo()
      this.getContractState()
      this.getSponsorsCount()
      this.getDonationsCount()
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
          purchase.transactions.edges[i].node.target = purchase.transactions.edges[i].node.owner.address
          purchase.transactions.edges[i].node.txType = 'In'
        }
      }
    },
    /** 获取标签页的数据 */
    async getList (tab) {
      if (this.dataLoading || this.loading) return
      this.dataLoading = true
      const tx = await this.$api.gql.getAllSponsorAndDonation(this.myAddress, tab, this.pagesize, this.endCursor)
      this.parseTags(tx)

      this.tabList.push(...tx.transactions.edges)
      this.hasNextPage = tx.transactions.pageInfo.hasNextPage
      this.dataLoading = false
    },
    async getContractState () {
      await this.getPstContract(this.creator.ticker.contract)
      this.totalSupply = this.contract.totalSupply
      this.holders = this.contract.holders
      this.contractLoading = false
    },
    async getSponsorsCount () {
      this.totalSponsors = await this.$api.gql.getAllPurchasesStats(this.creator.ticker.contract, 'sponsors')
      this.totalSponsorsLoading = false
    },
    async getDonationsCount () {
      this.totalDonations = await this.$api.gql.getAllPurchasesStats(this.creator.ticker.contract, 'donations')
      this.totalDonationsLoading = false
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
.my-stats {
  color: @dark;
  margin: 20px auto 0px;
  max-width: 1200px;
  width: 100%;
  display: flex;
  justify-content: center;
  flex-direction: column;
  padding: 0 10px;
  box-sizing: border-box;

  &-pst {
    &-title {
      h3 {
        color: @dark;
        text-align: left;
        margin-top: 0;
      }
    }
    &-block {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      grid-gap: 10px 10px;
      justify-content: space-between;

      &-item {
        display: flex;
        align-items: center;
        justify-content: center;
        background: @background;
        border-radius: 6px;
        flex: 1;
        position: relative;

        &:first-child {
          margin-left: 0px;
        }

        &:last-child {
          margin-right: 0px;
        }

        &-title {
          position: absolute;
          font-size: 14px;
          top: 15px;
          left: 15px;
        }

        &-number {
          padding: 50px 0;
          font-size: 20px;
          font-weight: 500;
        }
      }
    }
  }

  &-header {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    flex: 1;

    &-title {
      color: @dark;
      line-height: 22px;
      text-align: left;
      margin-top: 25px;
    }

    &-menu {
      h4 {
        font-size: 16px;
        text-align: left;
        margin: 0 auto;
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
}

.orders-card {
  margin-top: 10px;
  border-radius: 6px;
}

@media screen and (max-width: 640px) {
  .my-stats {
    &-pst {
      &-block {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  }
}
</style>
