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
      <p class="solution-title">
        {{ item.title }}
      </p>
      <p class="solution-desp">
        {{ item.description }}
      </p>
      <div class="solution-unlock">
        <span class="solution-unlock-status">
          <span class="mdi mdi-lock" />
          <span class="mdi mdi-lock-open" />
          Locked
        </span>
        <el-button
          class="solution-unlock-btn"
          type="primary"
          @click="buyUnlockSolution(item, index)"
          :loading="loading"
        >
          {{ convertPstToWinston(item.value) | winstonToAr | finalize(loading) }}
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
        >
          {{ convertPstToWinston(customPstInput) | winstonToAr | finalize(loading) }}
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
      }
    }
  },
  computed: {
    ...mapGetters(['isLoggedIn']),
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
    contract () {
      if (!this.creator) return {}
      return this.creatorPst[this.creator.ticker.contract]
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
      await this.getPstContract(this.creator.ticker.contract)
      this.ratio = this.contract.ratio
      this.loading = false
    },
    /** 转换 PST 为 Winston */
    convertPstToWinston (value) {
      const { from, to } = this.getRatio(this.ratio)
      value = new BigNumber(String(value)).multipliedBy(to).div(from).multipliedBy(1000000000000)
      value = value.toFixed(12)

      if (value === 'Infinity' || value === 'NaN') {
        return '0'
      }
      return value
    },
    /** 拆分换算比率 */
    getRatio (ratio) {
      if (!/^1:\d*\.?\d*$/.test(ratio)) {
        return { from: '1', to: '0' }
      }
      let from = 1
      let to = parseFloat(parseFloat(ratio.split(':').pop()).toFixed(12))
      let iteration = 0

      while (true) {
        if (!Number.isInteger(to)) {
          to = to * 10
          iteration++
          continue
        }
        break
      }

      for (let i = 0; i < iteration; i++) {
        from = new BigNumber(from).multipliedBy(10)
      }
      to = BigNumber(to)
      return { from: new BigNumber(String(from)), to }
    },
    /** 购买解锁方案 */
    async buyUnlockSolution (item, index) {
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
      let value = this.convertPstToWinston(item.value)
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
      this.loading = true
      this.receiptLoading = true
      this.paymentType = 1

      // 换算为具体支付的金额
      value = this.convertPstToWinston(String(value))
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
      this.loading = false
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

      this.showKeyReader = false
      const callback = (event, id) => {
        if (event === 'onDistributionPosted') this.openSuccessNotify('distribution', id, 30000)
        if (event === 'onDeveloperPosted') this.openSuccessNotify('developer', id, 30000)
        if (event === 'onSponsorAdded') this.openSuccessNotify('sponsor', id, 30000)

        if (event === 'onDistributionError') this.openFailureNotify('distribution', '', 10000)
        if (event === 'onDeveloperCatchError') this.openFailureNotify('developer', '', 10000)
        if (event === 'onSponsorAddedCatchError') this.openSuccessNotify('sponsor', id, 10000)
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

      switch (type) {
        case 'distribution':
          title = this.$t('success.profitSharingTxSuccess')
          break
        case 'developer':
          title = this.$t('success.developerTipTxSuccess')
          break
        case 'sponsor':
          title = this.$t('success.sponsorTxSuccess')
          break
        default:
          title = this.$t('success.txSuccess')
      }

      let message = this.$t('payment.txPosted')
      message = message.replace('{0}', `<a target="_blank" href="https://viewblock.io/arweave/tx/${id}" class="transaction-message-id">${id}</a>`)
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
        default:
          title = this.$t('failure.txFailed')
      }

      this.$notify({
        title: title,
        dangerouslyUseHTMLString: true,
        message: this.$t('failure.txFailMessage'),
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
    margin: 0 0 5px;
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
          color: @primary
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
  &-title {
    font-size: 15px;
    padding: 0;
    margin: 0 0 5px;
    font-weight: 500;
  }

  &-desp {
    font-size: 14px;
    padding: 0;
    margin: 0 0 5px;
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
  }

  .solution {
    border-radius: 6px;
    padding: 20px 16px;
    width: 100%;
    min-width: 87%;
    display: flex;
    flex-direction: column;
    margin: 0 5px;
    &-desp {
      flex: 1;
    }
  }
}
</style>
