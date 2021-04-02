<template>
  <div class="purchased-item" v-loading="loading">
    <div class="purchased-item-left">
      <div class="purchased-item-left-type">
        <div class="purchased-item-left-type-info">
          <span class="purchased-item-left-type-info-title">{{ purchaseType }}</span>
          <div class="purchased-item-left-type-info-tx">
            <a class="address" target="_blank" :href="`https://viewblock.io/arweave/tx/${purchase.node.id}`">{{ purchase.node.id }}</a><span class="mdi mdi-content-copy copy-icon" @click="() => copyAddress(purchase.node.id)" />
          </div>
        </div>
        <span class="purchased-item-left-type-info-spend">{{ indicator }}{{ purchase.node.quantity.winston | winstonToAr }} AR</span>
      </div>
      <div class="purchased-item-left-info" v-if="purchase.node.parsedTag.purchasetype === 'Likey-Sponsor'">
        <span class="purchased-item-left-info-item">{{ purchase.node.parsedTag.solutiontitle || '' }}</span>
        <div class="purchased-item-left-info-pst" v-if="this.purchase.txType === 'Out'">
          <span class="purchased-item-left-info-pst-value">+{{ purchase.node.parsedTag.solutionvalue }}</span>
          <span class="purchased-item-left-info-pst-ticker"> {{ tickerContract.ticker }}</span>
        </div>
      </div>
      <div class="purchased-item-left-recipient">
        <div class="purchased-item-left-recipient-user">
          <div class="purchased-item-left-recipient-user-info">
            <span class="mdi mdi-account-arrow-right" />
            <span class="username">{{ username }}</span>
          </div>
          <div class="purchased-item-left-recipient-user-tx">
            <a class="address" target="_blank" :href="`https://viewblock.io/arweave/tx/${purchase.node.target}`">{{ purchase.node.target }}</a><span class="mdi mdi-content-copy copy-icon" @click="() => copyAddress(purchase.node.target)" />
          </div>
        </div>
        <span class="purchased-item-right-time">{{ createTime }}</span>
      </div>
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
      switch (this.purchase.node.parsedTag.purchasetype) {
        case 'Likey-Sponsor':
          return this.$t('order.purchasePST')
        case 'Likey-Donation':
          return this.$t('order.onlyDonation')
        default:
          return this.$t('order.onlyDonation')
      }
    },
    createTime () {
      const time = this.$moment(Number(this.purchase.node.parsedTag.unixtime)).locale(this.appLang)
      if (!momentFun.isNDaysAgo(2, time)) return time.fromNow()
      else if (!momentFun.isNDaysAgo(365, time)) return time.format('MMMDo')
      return time.format('YYYY MMMDo')
    },
    indicator () {
      if (this.purchase.txType === 'Out') return '-'
      else return '+'
    }
  },
  async mounted () {
    this.loading = true
    await this.initHistoryData()
    this.loading = false
  },
  methods: {
    ...mapActions(['getPstContract', 'getCreatorInfo']),
    /** 初始化卡片 */
    async initHistoryData () {
      await this.getCreatorInfo()
      this.tickerContract = { ...await this.getPstContract(this.purchase.node.parsedTag.contract) }
      if (!this.purchase.username) {
        const res = await this.$api.gql.getIdByAddress(this.purchase.node.target)
        this.username = res.data
      }
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
  color: @dark;
  display: flex;
  width: 100%;
  margin: 20px 0px;
  padding: 20px 20px;
  box-sizing: border-box;
  border: 1px solid @primary;
  border-radius: 6px;
  background-color: @background;
  flex-direction: column;

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

       &-info {
        display: flex;
        align-items: center;
        flex:1;

        &-title {
          font-size: 20px;
          font-weight: 600;
          white-space: nowrap;
        }

        &-tx {
          display: flex;
        }

        .address {
          font-size: 14px;
          color: @gray4;
          text-decoration: none;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 1;
          overflow: hidden;
          word-break: break-all;
          margin-left: 10px;

          &:hover {
            color: @primary;
          }
        }

        .mdi {
          flex: 1;
          margin-left: 5px;
        }

        &-spend {
          font-size: 20px;
          font-weight: 600;
          white-space: nowrap;
        }
      }
    }

    &-info {
      flex: 1;
      display: flex;
      &-item {
        flex: 1;
        font-weight: 400;
      }
      &-pst {
        display: flex;

        &-ticker {
          margin-left: 5px;
        }
      }
    }

    &-recipient {
      display: flex;
      align-items: center;
      column-gap: 5px;

      &-user {
        display: flex;
        align-items: center;
        flex: 1;

        &-info {
          display: flex;
          flex-direction: row;

          .username {
            margin-left: 5px;
            color: @dark;
            display: -webkit-box;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 1;
            overflow: hidden;
            word-break: break-all;
          }

          .mdi {
            color: @primary;
            font-size: 16px;
          }
        }

        &-tx {
          display: flex;

          .address {
            font-size: 14px;
            color: @gray4;
            text-decoration: none;
            display: -webkit-box;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 1;
            overflow: hidden;
            word-break: break-all;
            margin-left: 10px;

            &:hover {
              color: @primary;
            }
          }

          .mdi {
            margin-left: 5px;
          }
        }
      }
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

@media screen and (max-width: 640px) {
  .purchased-item {
    flex-direction: column;
    align-items: flex-start;
    &-left {
      &-type {
        display: flex;
        flex-direction: column;
        align-items: flex-start;

        &-info {
          &-spend {
            font-size: 20px;
            font-weight: 600;
            white-space: unset;
            word-break: break-all;
          }
        }
      }
      &-recipient {
        flex-direction: column;
        align-items: flex-start;

        &-user {
          flex-direction: column;
          align-items: flex-start;

          .address {
            margin-left: 0;
          }
        }
      }
    }
  }
}
</style>
