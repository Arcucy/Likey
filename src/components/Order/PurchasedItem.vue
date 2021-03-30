<template>
  <div class="purchased-item" v-loading="loading">
    <div class="purchased-item-left">
      <div class="purchased-item-left-type">
        <span class="purchased-item-left-type-title">{{ purchaseType }}</span>
        <a class="address" :href="`https://viewblock.io/arweave/tx/${purchase.id}`">{{ purchase.id }}</a><span class="mdi mdi-content-copy copy-icon" @click="() => copyAddress(purchase.id)" />
      </div>
      <div class="purchased-item-left-info">
        <span class="purchased-item-left-info-item">{{ purchase.parsedTag.solutiontitle || '' }}</span>
      </div>
      <div class="purchased-item-left-recipient">
        <span class="mdi mdi-account-arrow-right" />
        <span class="purchased-item-left-info-user">{{ username + ' - ' }}</span><a class="address" :href="`https://viewblock.io/arweave/tx/${purchase.recipient}`">{{ purchase.recipient }}</a><span class="mdi mdi-content-copy copy-icon" @click="() => copyAddress(purchase.recipient)" />
      </div>
    </div>
    <div class="purchased-item-right">
      <span class="purchased-item-right-spend">-{{ purchase.quantity.winston | winstonToAr }} AR</span>
      <div class="purchased-item-right-get">
        <span class="purchased-item-right-get-value">+{{ purchase.parsedTag.solutionvalue }}</span>
        <span class="purchased-item-right-get-pst"> {{ tickerContract.ticker }}</span>
      </div>
      <span class="purchased-item-right-time">{{ createTime }}</span>
    </div>
  </div>
</template>

<script>
import * as momentFun from '@/util/momentFun'
import { mapActions, mapState } from 'vuex'

export default {
  props: {
    purchase: {
      type: Object,
      default: () => {}
    }
  },
  data () {
    return {
      loading: false,
      username: '',
      tickerContract: {
        name: '',
        ticker: '',
        owner: ''
      }
    }
  },
  computed: {
    ...mapState({
      appLang: state => state.app.appLang
    }),
    purchaseType () {
      switch (this.purchase.parsedTag.purchasetype) {
        case 'Likey-Sponsor':
          return this.$t('orderTab.purchasePST')
        case 'Likey-Donation':
          return this.$t('orderTab.onlyDonation')
        default:
          return this.$t('orderTab.onlyDonation')
      }
    },
    createTime () {
      const time = this.$moment(Number(this.purchase.parsedTag.unixtime)).locale(this.appLang)
      if (!momentFun.isNDaysAgo(2, time)) return time.fromNow()
      else if (!momentFun.isNDaysAgo(365, time)) return time.format('MMMDo')
      return time.format('YYYY MMMDo')
    }
  },
  async mounted () {
    this.loading = true
    await this.initHistoryData()
    this.loading = false
  },
  methods: {
    ...mapActions(['getPstContract']),
    /** 初始化卡片 */
    async initHistoryData () {
      if (!this.purchase.tickerContract) {
        this.tickerContract = await this.getPstContract(this.purchase.parsedTag.contract)
      }
      this.tickerContract = { ...this.purchase.tickerContract }
      if (!this.purchase.username) {
        const res = await this.$api.gql.getIdByAddress(this.purchase.recipient)
        this.username = res.data
      }
      this.username = this.purchase.username
    },
    /** 复制合约地址 */
    copyAddress (address) {
      this.$copyText(address).then(
        () => {
          this.$message({
            showClose: true,
            message: this.$t('success.copy'),
            type: 'success'
          })
        },
        () => {
          this.$message({ showClose: true, message: this.$t('error.copy'), type: 'error' })
        }
      )
    }
  }
}
</script>

<style lang="less" scoped>
.purchased-item {
  display: flex;
  width: 100%;
  margin: 20px 0px;
  padding: 20px 20px;
  box-sizing: border-box;
  border: 1px solid @primary;
  border-radius: 6px;
  background-color: @background;

  &-left {
    display: flex;
    flex-direction: column;
    flex: 1;
    align-items: stretch;
    row-gap: 5px;
    height: 100%;

    &-type {
      display: flex;
      align-items: center;
      column-gap: 5px;
      flex: 1;

      &-title {
        font-size: 20px;
        font-weight: 600;
      }

      .address {
        font-size: 14px;
        color: @gray4;
        text-decoration: none;

        &:hover {
          color: @primary;
        }
      }
    }

    &-info {
      flex: 1;
      &-user {
        color: @dark;
      }

      &-item {
        font-weight: 400;
      }
    }

    &-recipient {
      display: flex;
      align-items: center;
      column-gap: 5px;

      .mdi {
        color: @primary;
        font-size: 16px;
      }

      .address {
        font-size: 14px;
        color: @gray4;
        text-decoration: none;

        &:hover {
          color: @primary;
        }
      }
    }
  }

  &-right {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    text-align: right;
    row-gap: 5px;

    &-spend {
      font-size: 20px;
      font-weight: 600;
    }

    &-time {
      align-self: flex-end;
    }
  }
}

.copy-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: @primary;

  &:hover {
    color: @secondary;
  }

  &:active {
    color: @primary-dark;
  }
}
</style>
