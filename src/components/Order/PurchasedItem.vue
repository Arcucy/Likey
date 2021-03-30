<template>
  <div class="purchased-item">
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
      <span class="purchased-item-right-value">{{ purchase.quantity.winston | winstonToAr }} AR</span>
      <span class="purchased-item-right-time">{{ createTime }}</span>
    </div>
  </div>
</template>

<script>
import * as momentFun from '@/util/momentFun'
import { mapState } from 'vuex'

export default {
  props: {
    purchase: {
      type: Object,
      default: () => {}
    }
  },
  data () {
    return {
      username: ''
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
  mounted () {
    console.log(this.purchase)
  },
  methods: {
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

  &-left {
    display: flex;
    flex-direction: column;
    flex: 1;
    row-gap: 5px;

    &-type {
      display: flex;
      align-items: center;
      column-gap: 5px;

      &-title {
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
      &-user {
        color: @gray4;
      }

      &-item {
        font-weight: 600;
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
        color: @dark;
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
    text-align: right;
    row-gap: 5px;

    &-value {
      flex: 1;
      font-size: 20px;
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
