<template>
  <div class="user-profile">
    <div v-if="isCreator" class="row">
      <div class="col-6">
        <div class="col-header">
          <h3>{{ $t('userProfile.flow') }}</h3>
        </div>
        <InputBox v-if="isMe(address)" :address="address" />
        <FlowCard
          v-for="(data, index) of flow"
          class="flow-card"
          :key="index"
          :brief="data"
          :user="user"
          @locked-payment="startPayment"
          @status-donation="startDonationPayment"
          no-load-user
        />
        <InfiniteScroll
          :no-data="!flow || !flow.length"
          :loading="flowLoading"
          :distance="200"
          :disable="!hasNextPage"
          @load="() => getUserStatus(address)"
        />
      </div>
      <div class="col-3">
        <div class="col-header">
          <h3>{{ $t('userProfile.sponsorship') }}</h3>
        </div>
        <SponsorStatistics :address="address" />
        <UnlockSolutionList :address="address" />
      </div>
    </div>
    <div v-else class="no-creator">
      <p>{{ $t('userProfile.notYetACreator') }}</p>
      <router-link :to="{ name: 'Setting-Creator' }">
        <el-button v-if="isMyself && !creatorLoading" class="no-creator-btn" type="primary">
          {{ $t('becomeACreatorBtn') }}
        </el-button>
      </router-link>
      <div v-if="isMyself && !creatorLoading" class="no-creator-edit">
        <p>{{ $t('userProfile.editUsernameAndAvatar') }}</p>
        <a href="https://arweave.net/fGUdNmXFmflBMGI2f9vD7KzsrAc1s1USQgQLgAVT0W0" target="_blank">
          Arweave ID
        </a>
        <a href="https://arweave.net/d9SXf_N32hAm3cygt1btmPC-7Dg460VhQEtW8I-cfvU" target="_blank">
          Arweave Avatar
        </a>
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
import { mapGetters, mapActions, mapState } from 'vuex'

import SponsorStatistics from '@/components/Creator/SponsorStatistics'
import UnlockSolutionList from '@/components/Creator/UnlockSolutionList'
import FlowCard from '@/components/FlowCard'
import InputBox from '@/components/Creator/InputBox'
import InfiniteScroll from '@/components/InfiniteScroll'
import Payment from '@/components/Common/Payment'
import DonationPurchase from '@/components/Common/DonationPurchase'

export default {
  components: {
    SponsorStatistics,
    UnlockSolutionList,
    FlowCard,
    InputBox,
    InfiniteScroll,
    Payment,
    DonationPurchase
  },
  props: {
    basicInfo: {
      type: Object,
      default: () => {
        return {
          username: '',
          avatar: '',
          address: ''
        }
      }
    }
  },
  data () {
    return {
      creatorLoading: false,
      creatorInfo: {
        shortname: '',
        intro: '',
        category: '',
        scale: '',
        ticker: {
          name: '',
          ticker: '',
          contract: ''
        },
        items: []
      },
      /** 动态列表 */
      flow: [],
      /** 动态获取中 */
      flowLoading: false,
      /** 是否还有下一页么 */
      hasNextPage: true,
      /** 每页（每次）获取的条目数量 */
      pageSize: 10,
      showPaymentDialog: false,
      showDonationInput: false,
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
      creators: state => state.contract.creators,
      creatorPst: state => state.contract.creatorPst
    }),
    ...mapGetters(['isMe']),
    address () {
      const name = this.$route.name
      // 如果是创作者的短链接页面，需要通过 basicInfo 获取 address
      return name === 'User' ? this.$route.params.id : this.basicInfo.address
    },
    isMyself () {
      return this.isMe(this.address)
    },
    isCreator () {
      return Boolean(this.creatorInfo.shortname)
    },
    user () {
      return {
        ...this.basicInfo,
        ...this.creatorInfo
      }
    },
    /** flow 中最后条数据的 cursor（索引） */
    endCursor () {
      if (!this.flow || !this.flow.length) return ''
      return this.flow[this.flow.length - 1].cursor
    }
  },
  watch: {
    address: {
      handler (val) {
        if (val) {
          this.initCreatorInfo(val)
          // this.getUserStatus(val)
        }
      },
      immediate: true
    }
  },
  methods: {
    ...mapActions(['getCreatorInfo', 'getPstContract']),
    /** 初始化获取创作者信息 */
    async initCreatorInfo (address) {
      this.creatorLoading = true
      try {
        const res = await this.getCreatorInfo(address)
        if (res) this.creatorInfo = res
      } catch (err) {
        console.error('Failed to obtain creator information', err)
        this.$message.error(this.$t('failure.failedToObtainContractStatus'))
      }
      this.creatorLoading = false
    },
    /** 获取用户动态列表 */
    async getUserStatus (address) {
      // 如果已经在加载了，则直接结束，否则开始加载
      if (this.flowLoading) return
      this.flowLoading = true
      try {
        // 获取数据
        const res = await this.$api.gql.getUserStatusByAddress(address, this.endCursor, this.pageSize)
        // 将获取到的数据加入数组尾部，并且更新 hasNextPage 字段
        this.flow.push(...res.transactions.edges)
        this.hasNextPage = res.transactions.pageInfo.hasNextPage
      } catch (err) {
        console.error(err)
        this.$message.error(this.$t('failure.load'))
      }
      // 结束加载状态
      this.flowLoading = false
    },
    load () {
      console.log('load')
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
    confirmDonation (val) {
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
    }
  }
}
</script>

<style lang="less" scoped>
.user-profile {
  margin: 0 0 60px;
}

.no-creator {
  margin: 20px auto 0;
  max-width: 1200px;
  display: flex;
  flex-direction: column;
  align-items: center;

  p {
    color: @gray3;
    margin: 0 0 10px;
    padding: 0;
  }

  &-btn {
    padding: 12px 20px;
    min-width: 130px;
  }

  &-edit {
    margin: 60px 0 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    p {
      margin: 0 0 5px;
    }
    a {
      color: @secondary;
    }
  }
}

.row {
  max-width: 1220px;
  width: 100%;
  margin: 20px auto 0;
  padding-bottom: 40px;
  &::after {
    content: "";
    display: block;
    width: 0;
    height: 0;
    clear: both;
  }
  .col-6 {
    width: 66.666%;
    padding: 0 10px;
    float: left;
    box-sizing: border-box;
  }
  .col-3 {
    width: 33.333%;
    padding: 0 10px;
    float: left;
    box-sizing: border-box;
  }
}

.col-header {
  margin-bottom: 20px;
  h3 {
    margin: 0;
    padding: 0;
  }
}

.flow-card {
  margin-bottom: 20px;
}

@media screen and (max-width: 799px) {
  .row {
    display: flex;
    flex-direction: column-reverse;
    .col-6, .col-3 {
      width: 100%;
    }
  }
}

@media screen and (max-width: 640px) {
  .row {
    .col-6, .col-3 {
      padding: 0;
      margin-bottom: 20px;
    }
  }
  .col-header {
    padding: 0 16px;
  }
  .flow-card {
    margin-bottom: 1px;
  }
}
</style>
