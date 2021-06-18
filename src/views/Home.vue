<template>
  <div class="container">
    <div class="row">
      <div class="col-6">
        <div class="home-title-container">
          <div
            class="home-title"
            @click="toggleSponsored(false)"
            :class="showingSponsored ? 'home-title-not-active' : ''"
          >
            {{ $t('home.tabFlow') }}
          </div>
          <div
            class="home-title home-title-sponsored"
            :class="showingSponsored ? '' : 'home-title-not-active'"
            @click="toggleSponsored(true)"
          >
            {{ $t('home.tabSponsored') }}
          </div>
        </div>
        <!-- 赞助列表 -->
        <div v-if="showingSponsored">
          <FlowCard
            v-for="(data, index) in sponsoredStatus"
            :brief="data"
            :key="data.cursor || index"
            @locked-payment="startPayment"
            @status-donation="startDonationPayment"
            class="flow-card"
          />
          <InfiniteScroll
            tag="sponsored-infinite-scroll"
            :no-data="!sponsoredStatus || !sponsoredStatus.length"
            :loading="sponsoredStatusLoading"
            :distance="200"
            :disable="!sponsoredStatusHasNextPage"
            :immediate="false"
            @load="() => getSponsoredStatus()"
          />
        </div>
        <!-- 主页列表 -->
        <div v-if="!showingSponsored">
          <FlowCard
            v-for="(data, index) in flow"
            :brief="data"
            :key="data.cursor || index"
            @locked-payment="startPayment"
            @status-donation="startDonationPayment"
            class="flow-card"
          />
          <InfiniteScroll
            tag="home-infinite-scroll"
            :no-data="!flow || !flow.length"
            :loading="flowLoading"
            :distance="200"
            :disable="!hasNextPage"
            :immediate="false"
            @load="() => getUserStatus()"
          />
        </div>
      </div>
      <div class="col-3">
        <div class="home-title">
          {{ $t('home.findMoreCreators') }}
        </div>
        <div class="card flow-card" v-if="shownCreators.length === 0">
          <div v-loading="true">
            {{ $t('home.creatorsLoading') }}
          </div>
        </div>
        <CreatorCard
          v-for="(address, index) in shownCreators"
          :address="address"
          :key="index"
          class="flow-card"
        />
        <div class="show-more-btn">
          <span
            @click="showMore ++"
            v-if="creatorsAddress.length !== shownCreators.length"
            class="show-more-btn-text"
          >{{ $t('home.showMoreCreators') }}</span>
        </div>
      </div>
    </div>
    <Payment
      v-model="showPaymentDialog"
      :data="paymentData"
      @payment-close="paymentClose"
    />
    <DonationPurchase
      v-model="showDonationInput"
      @confirm-donation="confirmDonation"
      @donation-close="closeDonation"
    />
  </div>
</template>

<script>
import CreatorCard from '@/components/CreatorCard'
import FlowCard from '@/components/FlowCard'
import InfiniteScroll from '@/components/InfiniteScroll'
import Payment from '@/components/Common/Payment'
import DonationPurchase from '@/components/Common/DonationPurchase'

import { mapActions, mapState, mapGetters } from 'vuex'

export default {
  name: 'Home',
  components: {
    CreatorCard,
    FlowCard,
    InfiniteScroll,
    Payment,
    DonationPurchase
  },
  inject: ['updateQuery'],
  data () {
    return {
      // 记录用户点了多少次展开
      showMore: 1,
      showingSponsored: this.$route.query.tab === 'sponsored',
      // 动态列表
      flow: [],
      flowLoading: false,
      hasNextPage: true,
      // 已赞赏的动态列表,
      sponsoredStatus: [],
      sponsoredStatusLoading: false,
      sponsoredStatusHasNextPage: true,
      showPaymentDialog: false,
      showDonationInput: false,
      // 用户持有的 PST 列表
      pstList: [],
      donateData: {
        contract: {},
        status: {},
        donation: {
          value: ''
        }
      },
      paymentData: {
        type: '0',
        data: {}
      }
    }
  },
  computed: {
    ...mapState({
      creatorsAddress: state => Object.keys(state.contract.creators),
      creators: state => state.contract.creators,
      creatorPst: state => state.contract.creatorPst,
      userAddress: state => state.user.myInfo.address
    }),
    ...mapGetters(['isLoggedIn']),
    shownCreators () {
      return this.creatorsAddress.slice(0, this.showMore * 5)
    },
    flowCursor () {
      if (!this.flow || !this.flow.length) return ''
      return this.flow[this.flow.length - 1].cursor
    },
    sponsoredStatusCursor () {
      if (!this.sponsoredStatus || !this.sponsoredStatus.length) return ''
      return this.sponsoredStatus[this.sponsoredStatus.length - 1].cursor
    },
    pstOwnerList () {
      if (!this.pstList || !this.pstList.length) return []
      return this.pstList.map(item => item.owner)
    }
  },
  watch: {
    isLoggedIn (val) {
      if (val) {
        if (this.showingSponsored) {
          this.sponsoredStatus = []
          this.sponsoredStatusHasNextPage = true
          this.sponsoredStatusLoading = false
          this.getSponsoredStatus()
        }
      } else {
        this.sponsoredStatus = []
        this.pstList = []
      }
    }
  },
  mounted () {
    this.initLikeyContract()
    if (this.showingSponsored) this.getSponsoredStatus()
    else this.getUserStatus()
  },
  methods: {
    ...mapActions(['initLikeyContract', 'getPstContract', 'getUserPstList']),
    /** 获取所有用户动态列表 */
    async getUserStatus () {
      if (this.flowLoading) return
      this.flowLoading = true
      const res = await this.$api.gql.getUserStatus(this.flowCursor, 10, true)
      this.flow.push(...res.transactions.edges)
      this.hasNextPage = res.transactions.pageInfo.hasNextPage
      this.flowLoading = false
    },
    /** 获取已赞赏的动态 */
    async getSponsoredStatus () {
      if (this.sponsoredStatusLoading) return
      if (!this.isLoggedIn) return
      this.sponsoredStatusLoading = true
      // 获取用户持有的 PST 列表
      if (!this.pstList || !this.pstList.length) {
        const pstList = await this.getUserPstList(this.userAddress)
        if (!pstList.length) {
          this.sponsoredStatusLoading = false
          this.sponsoredStatusHasNextPage = false
          return
        }
        this.pstList = pstList
      }
      const res = await this.$api.gql.getUserStatusByAddress(this.pstOwnerList, this.sponsoredStatusCursor, 10, true)
      this.sponsoredStatus.push(...res.transactions.edges)
      this.sponsoredStatusHasNextPage = res.transactions.pageInfo.hasNextPage
      this.sponsoredStatusLoading = false
    },
    startPayment (data) {
      this.paymentData.type = '0'
      this.paymentData.data = data
      this.showPaymentDialog = true
    },
    startDonationPayment (data) {
      this.showDonationInput = true
      this.donateData = data
    },
    async confirmDonation (val) {
      if (!this.donateData.status.creator || !this.creators || !this.creators[this.donateData.status.creator]) return
      this.donateData.contract = this.creators[this.donateData.status.creator].ticker.contract
      this.showDonationInput = false
      this.donateData.donation.value = val
      this.paymentData.type = '1'
      this.paymentData.data = this.donateData
      this.showPaymentDialog = true
    },
    paymentClose () {
      this.showPaymentDialog = false
    },
    closeDonation () {
      this.showDonationInput = false
    },
    async toggleSponsored (showingSponsored) {
      if (showingSponsored) {
        if (showingSponsored === this.showingSponsored) {
          this.pstList = []
          this.sponsoredStatus = []
        }
        if (!this.sponsoredStatus || !this.sponsoredStatus.length) {
          this.sponsoredStatus = []
          this.sponsoredStatusHasNextPage = true
          this.sponsoredStatusLoading = false
          this.updateQuery('tab', 'sponsored')
          this.getSponsoredStatus()
        }
      } else {
        if (showingSponsored === this.showingSponsored) this.flow = []
        if (!this.flow || !this.flow.length) {
          this.flow = []
          this.flowLoading = false
          this.hasNextPage = true
          this.updateQuery('tab', 'all')
          this.getUserStatus()
        }
      }
      this.showingSponsored = showingSponsored
    }
  }
}
</script>

<style lang="less" scoped>
@import '../themes/variables';

.container {
  width: 100%;
  .row {
    max-width: 1220px;
    width: 100%;
    margin: 20px auto 100px;
    display: flex;
    .col-6 {
      width: 66.6%;
      padding: 0 10px;
      box-sizing: border-box;
    }
    .col-3 {
      width: 33.3%;
      padding: 0 10px;
      box-sizing: border-box;
    }
  }
}

.card {
  background: @background;
  box-shadow: 0 0 2px 0 #0000001a;
  box-sizing: border-box;
  border-radius: 6px;
  padding: 20px;
}

.home-title-container {
  display: flex;
}

.home-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 20px;

  &-sponsored {
    margin-left: 30px;
  }

  &-not-active {
    transition: all 250ms;
    color: gray;
    cursor: pointer;
    &:hover {
      color: @primary;
    }
  }
}

.show-more-btn {
  width: 100%;
  text-align: center;
  padding: 20px;
  box-sizing: border-box;

  &-text {
    transition: all 200ms;
    font-weight: bold;
    color: @primary;
    cursor: pointer;

    &:hover {
      color: @secondary;
    }
  }
}

.flow-card {
  margin-bottom: 20px;
}

@media screen and (max-width: 799px) {
  .container {
    width: 100%;
    .row {
      display: flex;
      flex-direction: column-reverse;
      .col-6, .col-3 {
        width: 100%;
      }
    }
  }
}

@media screen and (max-width: 640px) {
  .container {
    width: 100%;
    .row {
      .col-6, .col-3 {
        width: 100%;
        padding: 0;
        margin-bottom: 20px;
      }
    }
    .home-title {
      padding: 0 16px;
    }
    .flow-card {
      margin-bottom: 1px;
    }
  }
}
</style>
