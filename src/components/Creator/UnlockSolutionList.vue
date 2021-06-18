<template>
  <div class="solutions">
    <div v-for="(item, index) of items" class="solution" :key="index">
      <div class="solution-price">
        {{ $t('setting.ownBalance') }}
        <span class="solution-price-value">
          {{ item.value }}
        </span>
        <span class="solution-price-suffix">
          {{ ticker || 'PST' }}/{{ $t('setting.unlock') }}
        </span>
      </div>
      <p v-if="isShowDifference(requiredItems[index].value) && !initLoading" class="solution-left">
        {{ $t('sponsor.unlockValueNeed' , [requiredItems[index].value, ticker]) }}
      </p>
      <p class="solution-title">
        {{ item.title }}
      </p>
      <p class="solution-desp">
        {{ item.description }}
      </p>
      <div class="solution-unlock">
        <!-- 未解锁 -->
        <span v-if="!isUnlocked(requiredItems[index].value)" class="solution-unlock-status">
          <span class="mdi mdi-lock" />
          <span class="mdi mdi-lock-open" />
          {{ $t('sponsor.locked') }}
        </span>
        <!-- 已解锁 -->
        <span v-else class="solution-unlock-status">
          <span class="mdi mdi-lock-open-variant" />
          {{ $t('sponsor.unlocked') }}
        </span>
        <!-- 支付按钮 -->
        <el-button
          v-if="!isUnlockedIgnoreCreator(requiredItems[index].value)"
          class="solution-unlock-btn"
          type="primary"
          @click="buyUnlockSolution(requiredItems[index])"
          :loading="loading"
        >
          {{ convertPstToWinston(requiredItems[index].value, ratio) | winstonToAr | finalize(loading) }}
        </el-button>
        <!-- 已解锁按钮 -->
        <el-button
          v-else
          class="solution-unlock-btn"
          type="primary"
          disabled
        >
          {{ $t('flowCard.unlocked') }}
        </el-button>
      </div>
    </div>

    <!-- 自定义购买量 -->
    <div class="solution">
      <div class="solution-price">
        <el-input-number
          class="solution-price-input"
          v-model="customPstInput"
          controls-position="right"
          size="small"
          :precision="0"
          :min="1"
          :max="9007199254740991"
        />
        <span class="solution-price-suffix">
          {{ ticker || 'PST' }}
        </span>
      </div>
      <p style="line-height: normal;" class="solution-title">
        {{ $t('sponsor.custom') }}
      </p>
      <p class="solution-desp">
        {{ $t('sponsor.customInputDescription') }}
      </p>
      <div class="solution-unlock">
        <span class="solution-unlock-status" />
        <el-button
          class="solution-unlock-btn"
          type="primary"
          @click="buyCustomSolution(customPstInput)"
          :loading="loading"
          :disabled="disableBtn"
        >
          {{ convertPstToWinston(customPstInput, ratio) | winstonToAr | finalize(loading) }}
        </el-button>
      </div>
    </div>
    <SolutionPurchaseReceipt
      v-model="showReceipt"
      :receipt="paymentData"
      :loading="receiptLoading"
      @confirm="openKeyReader"
      @dialog-close="handleReceiptClose"
    />
    <PaymentKeyReader
      v-model="showKeyReader"
      @key-file="payOrder"
      @dialog-close="handleKeyReaderClose"
    />
  </div>
</template>

<script>
import BigNumber from 'bignumber.js'
import { mapActions, mapGetters, mapState } from 'vuex'

import decode from '@/util/decode'

import PaymentKeyReader from '@/components/Common/PaymentKeyReader'
import SolutionPurchaseReceipt from '@/components/Common/SolutionPurchaseReceipt'

export default {
  components: {
    PaymentKeyReader,
    SolutionPurchaseReceipt
  },
  props: {
    address: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      customPstInput: 1,
      ratio: '',
      loading: true,
      initLoading: true,
      receiptLoading: false,
      showReceipt: false,
      showKeyReader: false,
      /**
       * 支付类型
       * 0 为解锁方案
       * 1 为自定义方案
       * 2 为打赏
       */
      paymentType: -1,
      paymentData: {
        contract: '',
        value: new BigNumber('0'),
        creator: new BigNumber('0'),
        holder: new BigNumber('0'),
        developer: new BigNumber('0'),
        owner: ''
      },
      pstContract: {},
      // import convertPstToWinston
      convertPstToWinston: decode.convertPstToWinston
    }
  },
  computed: {
    ...mapGetters(['isLoggedIn', 'isMe']),
    ...mapState({
      creators: state => state.contract.creators,
      creatorPst: state => state.contract.creatorPst,
      themeName: state => state.app.themeName,
      myAddress: state => state.user.myInfo.address
    }),
    creator () {
      return this.creators ? this.creators[this.address] : null
    },
    ticker () {
      if (!this.creator) return ''
      return this.creator.ticker.ticker
    },
    name () {
      if (!this.creator) return ''
      return this.creator.ticker.name
    },
    items () {
      if (!this.creator) return []
      return this.creator.items
    },
    requiredItems () {
      if (!this.creator) return []
      if (!this.contract.ticker) return this.creator.items
      if (!this.myAddress) return this.creator.items
      const newItems = []
      const oldItems = JSON.parse(JSON.stringify(this.creator.items))
      oldItems.forEach(item => {
        newItems.push({ ...item })
      })

      const balance = new BigNumber(this.contract.balances[this.myAddress]).div(this.contract.divisibility)
      const resItems = []
      if (balance.toString() === 'NaN') return this.creator.items
      for (let i = 0; i < newItems.length; i++) {
        const currentValue = new BigNumber(newItems[i].value)
        const resultValue = currentValue.minus(balance)
        if (resultValue.isLessThanOrEqualTo(0)) {
          const obj = newItems[i]
          obj.value = '0'
          resItems.push(obj)
        } else {
          const obj = newItems[i]
          obj.value = resultValue.toString()
          resItems.push(obj)
        }
      }
      return resItems
    },
    contract () {
      if (!this.creator) return {}
      return this.creatorPst[this.creator.ticker.contract] || {}
    },
    disableBtn () {
      return this.customPstInput === '0' || this.customPstInput === 0 || !this.customPstInput
    }
  },
  watch: {
    creator: {
      handler (val) {
        if (val) {
          this.initContractInfo()
        }
      },
      immediate: true
    }
  },
  methods: {
    ...mapActions(['getPstContract']),
    /** 初始化合约状态 */
    async initContractInfo () {
      this.loading = true
      this.initLoading = true
      await this.getPstContract(this.creator.ticker.contract)
      if (!this.contract.ratio) this.ratio = '1:1'
      else this.ratio = this.contract.ratio
      this.loading = false
      this.initLoading = false
    },
    /** 传入解锁所需的金额，判断是否已经解锁 */
    isUnlocked (value) {
      if (this.address === this.myAddress) return true
      return value === '0'
    },
    /** 判断是否已经解锁，忽略是创作者的情况 */
    isUnlockedIgnoreCreator (value) {
      return value === '0'
    },
    isShowDifference (value) {
      if (!this.contract.ticker) return false
      const balance = new BigNumber(this.contract.balances[this.myAddress]).div(this.contract.divisibility)
      if (balance.toString() === 'NaN' || balance.toString() === '0') return false
      return !this.isUnlocked(value)
    },
    /** 开始进行交易 */
    buyUnlockSolution (item) {
      if (this.address === this.myAddress) {
        this.$message.warning(this.$t('failure.shouldnotSponsorYourSelf'))
        return
      }
      if (this.isUnlocked(item.value)) {
        this.$message.warning(this.$t('sponsor.unlocked'))
        return
      }
      // 如果未解锁，则开始执行交易
      this.proceedToBuyUnlockSolution(item)
    },
    /** 开始购买解锁方案 */
    async proceedToBuyUnlockSolution (item) {
      if (!this.isLoggedIn) {
        this.$message.warning(this.$t('login.pleaseLogInFirst'))
        return
      }
      if (this.address === this.myAddress) {
        this.$message.warning(this.$t('failure.shouldnotSponsorYourSelf'))
        return
      }

      this.showReceipt = false
      this.showReceipt = true
      this.loading = true
      this.receiptLoading = true
      this.paymentType = 0

      // 换算为具体支付的金额
      let value = this.convertPstToWinston(item.value, this.ratio)
      value = new BigNumber(value).toFixed(0)

      const balance = await this.$api.ArweaveNative.wallets.getBalance(this.myAddress)
      this.paymentData = await this.$api.contract.distributeTokens(this.contract,
        value,
        undefined,
        false,
        this.myAddress
      )
      this.paymentData.contract = this.creator.ticker.contract
      this.paymentData.owner = this.address
      this.paymentData.item = {
        title: item.title,
        value: item.value,
        number: '1'
      }
      this.paymentData.balance = balance
      this.receiptLoading = false
      this.loading = false
    },
    /** 购买自定义方案 */
    async buyCustomSolution (value) {
      if (!this.isLoggedIn) {
        this.$message.warning(this.$t('login.pleaseLogInFirst'))
        return
      }
      if (this.address === this.myAddress) {
        this.$message.warning(this.$t('failure.shouldnotSponsorYourSelf'))
        return
      }

      this.showReceipt = false
      this.showReceipt = true
      this.receiptLoading = true
      this.paymentType = 1

      // 换算为具体支付的金额
      value = this.convertPstToWinston(String(value), this.ratio)
      const paymentValue = new BigNumber(value).toFixed(0)

      const balance = await this.$api.ArweaveNative.wallets.getBalance(this.myAddress)
      this.paymentData = await this.$api.contract.distributeTokens(this.contract,
        paymentValue,
        undefined,
        false,
        this.myAddress
      )
      this.paymentData.contract = this.creator.ticker.contract
      this.paymentData.owner = this.address
      this.paymentData.item = {
        title: 'Custom',
        value: '1',
        number: '1'
      }
      this.paymentData.balance = balance
      this.receiptLoading = false
    },
    /** 在确认费用后打开钱包 */
    openKeyReader () {
      this.showKeyReader = false
      this.showKeyReader = true
    },
    /** 支付金额 */
    async payOrder (jwk) {
      if (!this.isLoggedIn) {
        this.$message.warning(this.$t('login.pleaseLogInFirst'))
        return
      }

      const myWalletAddress = await this.$api.ArweaveNative.wallets.getAddress(jwk)
      if (myWalletAddress === this.address) {
        this.$message.warning(this.$t('failure.shouldnotSponsorYourSelf'))
        return
      }
      if (myWalletAddress !== this.myAddress) {
        this.$message.warning(this.$t('failure.youCanOnlyPayForYourSelf'))
        return
      }

      this.loading = true
      this.showKeyReader = false
      const callback = (event, id) => {
        if (event === 'onDistributionPosted') this.openSuccessNotify('distribution', id, 30000)
        if (event === 'onDeveloperPosted') this.openSuccessNotify('developer', id, 30000)
        if (event === 'onSponsorAdded') this.openSuccessNotify('sponsor', id, 30000)
        if (event === 'onUpdatedTicker') this.openSuccessNotify('update', '', 30000)

        if (event === 'onDistributionError') this.openFailureNotify('distribution', '', 30000)
        if (event === 'onDeveloperCatchError') this.openFailureNotify('developer', '', 30000)
        if (event === 'onSponsorAddedCatchError') this.openSuccessNotify('sponsor', id, 30000)
        if (event === 'onUpdatedTickerError') this.openFailureNotify('update', id, 30000)
      }
      this.openTransactionInProgressNotify()
      switch (this.paymentType) {
        case 0:
          // 执行合约
          await this.$api.contract.sponsorAdded(jwk,
            this.creator.ticker.contract,
            this.paymentData.total.toString(),
            this.paymentData.item, callback
          )
          this.loading = false
          break
        case 1:
          await this.$api.contract.sponsorAdded(jwk,
            this.creator.ticker.contract,
            this.paymentData.total.toString(),
            this.paymentData.item, callback
          )
          this.loading = false
          break
      }
    },
    /** 关闭结算界面 */
    handleReceiptClose () {
      this.showReceipt = false
      this.loading = false
    },
    /** 打开钱包读取界面 */
    handleKeyReaderClose () {
      this.showKeyReader = false
      this.loading = false
    },
    /** 打开交易正在进行中通知 */
    openTransactionInProgressNotify () {
      const message = this.$t('payment.transactionInProgress')
      this.$notify({
        title: this.$t('payment.transactionInProgres'),
        dangerouslyUseHTMLString: true,
        message: `<span class="transaction-message-text">${message}</span>`,
        type: 'info',
        duration: 30000
      })
    },
    openSuccessNotify (type, id, duration) {
      let title = ''
      let message = this.$t('payment.txPosted')
      message = message.replace('{0}', `<a target="_blank" href="https://viewblock.io/arweave/tx/${id}" class="transaction-message-id">${id}</a>`)

      switch (type) {
        case 'distribution':
          title = this.$t('success.profitSharingTxSuccess') + ', ' + this.$t('payment.nextTransactionInProgress')
          break
        case 'developer':
          title = this.$t('success.developerTipTxSuccess') + ', ' + this.$t('payment.nextTransactionInProgress')
          break
        case 'sponsor':
          title = this.$t('success.sponsorTxSuccess') + ', ' + this.$t('payment.nextTransactionInProgress')
          break
        case 'update':
          title = this.$t('success.tickerHoldingUpdateSuccess')
          message = ''
          break
        default:
          title = this.$t('success.txSuccess')
      }

      this.$notify({
        title: title,
        dangerouslyUseHTMLString: true,
        message: `<span class="transaction-message-text ${this.themeName}-theme">${message}</span>`,
        type: 'success',
        duration: Number(duration)
      })
    },
    openFailureNotify (type, id, duration) {
      let title = ''
      this.loading = false
      let message = this.$t('failure.txFailMessage')

      switch (type) {
        case 'distribution':
          title = this.$t('failure.profitSharingTxFailed')
          break
        case 'developer':
          title = this.$t('failure.developerTipTxFailed')
          break
        case 'sponsor':
          title = this.$t('failure.sponsorTxFailed')
          break
        case 'update':
          title = this.$t('failure.tickerHoldingUpdateFailed')
          message = id
          break
        default:
          title = this.$t('failure.txFailed')
      }

      this.$notify({
        title: title,
        dangerouslyUseHTMLString: true,
        message: `<span class="transaction-message-text ${this.themeName}-theme">${message}</span>`,
        type: 'error',
        duration: Number(duration)
      })
    }
  }
}
</script>

<style lang="less" scoped>
.solutions {
  display: flex;
  flex-direction: column;
}
.solution {
  color: @dark;
  overflow: hidden;
  background: @background;
  box-shadow: 0 0 2px 0 #0000001a;
  box-sizing: border-box;
  border-radius: 6px;
  padding: 20px;
  margin: 0 0 20px;

  &-price {
    font-size: 24px;
    font-weight: 500;
    color: @gray3;
    padding: 0;
    display: flex;
    align-items: flex-start;
    white-space:nowrap;

    &-value {
      color: @primary;
      padding: 0;
      margin: 0 5px 0 5px;
      white-space: normal;
      word-break: break-all;
    }

    &-input {
      margin: 0 5px 0 0;
      font-size: 15px;
      /deep/ input {
        font-size: 16px;
        border-radius: 6px;
        font-weight: 500;
        &:focus {
          color: @primary;
        }
      }
    }

    &-suffix {
      color: @gray3;
      font-size: 14px;
      line-height: 29px;
      padding: 0;
      margin: 0;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 1;
      overflow: hidden;
      word-break: break-all;
      white-space: normal;
      align-self: flex-end;
      flex: 1;
    }
  }

  &-left {
    font-size: 15px;
    padding: 0;
    margin: 0;
    color: @primary;
    word-break: break-all;
    word-wrap: break-word;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
    overflow: hidden;
  }

  &-title {
    font-size: 15px;
    padding: 0;
    margin: 5px 0 5px;
    font-weight: 500;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
    overflow: hidden;

    overflow-wrap: break-word;
    word-wrap: break-word;
    -ms-word-break: break-all;
    word-break: break-word;
  }

  &-desp {
    font-size: 14px;
    padding: 0;
    margin: 0 0 5px;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 17;
    overflow: hidden;

    overflow-wrap: break-word;
    word-wrap: break-word;
    -ms-word-break: break-all;
    word-break: break-word;
  }

  &-unlock {
    display: flex;
    align-items: center;
    user-select: none;
    margin: 10px 0 0;
    flex-wrap: wrap;
    justify-content: flex-end;

    &-status {
      flex: 1;
      white-space:nowrap;
      margin: 10px 5px 10px 0;
      .mdi-lock-open {
        display: none;
      }
      .mdi-lock {
        display: inline;
      }
    }

    &-btn {
      min-width: 130px;
      border-radius: 6px;
    }

    &:hover {
      .solution-unlock-status {
        .mdi-lock-open {
          display: inline;
        }
        .mdi-lock {
          display: none;
        }
      }
    }
  }
}

@media screen and (max-width: 640px) {
  .solutions {
    display: flex;
    overflow-x: auto;
    width: 100%;
    box-sizing: border-box;
    flex-wrap: nowrap;
    flex-direction: row;

    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
    &::-webkit-scrollbar {
      display: none;
    }
  }

  .solution {
    border-radius: 6px;
    padding: 20px 16px;
    width: 100%;
    min-width: 87%;
    display: flex;
    flex-direction: column;
    margin: 0 5px;

    scroll-snap-align: center;
    &-desp {
      flex: 1;
      -webkit-line-clamp: 10;
    }
  }
}
</style>
