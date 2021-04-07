<template>
  <div>
    <SolutionPurchaseReceipt
      v-model="showReceipt"
      :receipt="paymentData.data"
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

import decode from '@/util/decode'

import PaymentKeyReader from '@/components/Common/PaymentKeyReader'
import SolutionPurchaseReceipt from '@/components/Common/SolutionPurchaseReceipt'
import { mapActions, mapGetters, mapMutations, mapState } from 'vuex'

export default {
  components: {
    SolutionPurchaseReceipt,
    PaymentKeyReader
  },
  props: {
    data: {
      type: Object,
      default: () => {
        return {
          type: '0',
          data: {
            unlock: {
              title: '',
              value: '0',
              number: '0'
            },
            status: {
              id: '',
              cursor: '',
              creator: '',
              timestamp: '',
              schemaVersion: '',
              title: '',
              summary: '',
              extra: {
                media: 0,
                audio: 0,
                file: 0
              },
              lockContract: '',
              lockValue: ''
            }
          }
        }
      }
    },
    value: {
      type: Boolean,
      required: true
    }
  },
  data () {
    return {
      showReceipt: false,
      showKeyReader: false,
      // import convertPstToWinston
      convertPstToWinston: decode.convertPstToWinston,
      receiptLoading: false,
      paymentData: {
        type: '0',
        data: {
          contract: '',
          value: new BigNumber('0'),
          creator: new BigNumber('0'),
          holder: new BigNumber('0'),
          developer: new BigNumber('0'),
          owner: '',
          item: {
            title: '',
            description: '',
            number: '',
            value: ''
          }
        }
      }
    }
  },
  computed: {
    ...mapState({
      creators: state => state.contract.creators,
      creatorPst: state => state.contract.creatorPst,
      owner: state => state.contract.owner,
      myAddress: state => state.user.myInfo.address,
      themeName: state => state.app.themeName
    }),
    ...mapGetters(['isLoggedIn'])
  },
  watch: {
    async value (val) {
      if (val) {
        this.paymentData.type = this.data.type
        await this.buyPst()
      }
    }
  },
  async mounted () {
  },
  methods: {
    ...mapMutations(['mSetPaymentInProgress', 'mSetDonationPaymentInProgress']),
    ...mapActions(['getPstContract', 'getCreatorInfo']),
    /** 购买解锁或者打赏 */
    async buyPst () {
      if (!this.isLoggedIn) {
        this.$message.warning(this.$t('login.pleaseLogInFirst'))
        this.$emit('input', false)
        return
      }
      if (this.data.data.status.creator === this.myAddress) {
        this.$message.warning(this.$t('failure.shouldnotSponsorYourSelf'))
        this.$emit('input', false)
        return
      }
      this.showReceipt = false
      this.setLoading(false)
      this.$nextTick(() => {
        this.showReceipt = true
      })

      // 换算为具体支付的金额
      this.receiptLoading = true
      const balance = await this.$api.ArweaveNative.wallets.getBalance(this.myAddress)
      let value
      let contract
      switch (this.data.type) {
        // 0 为解锁
        case '0':
          contract = await this.getPstContract(this.data.data.contract)
          if (!contract.ratio) {
            this.openFailureNotify('sponsor', 6000)
          }
          value = this.convertPstToWinston(this.data.data.unlock.value, contract.ratio)
          value = new BigNumber(value).toFixed(0)
          this.paymentData.data = { ...await this.$api.contract.distributeTokens(contract, value, undefined, false, this.myAddress) }
          this.paymentData.data.contract = this.data.data.status.lockContract
          this.paymentData.data.owner = this.data.data.status.creator
          this.paymentData.data.item = this.data.data.unlock
          this.paymentData.data.balance = balance
          break
        // 1 为打赏
        case '1':
          contract = await this.getPstContract(this.data.data.contract)
          if (!contract.ratio) {
            this.openFailureNotify('sponsor', 6000)
          }
          value = this.$api.ArweaveNative.ar.arToWinston(this.data.data.donation.value)
          this.paymentData.data = { ...await this.$api.contract.distributeTokens(contract, value, undefined, false, this.myAddress) }
          this.paymentData.data.contract = this.data.data.contract
          this.paymentData.data.owner = this.data.data.status.creator
          this.paymentData.data.item = {
            statusId: this.data.data.status.id,
            value: value
          }
          this.paymentData.data.balance = balance
          break
      }
      this.receiptLoading = false
    },
    /** 在确认费用后打开钱包 */
    openKeyReader () {
      this.showReceipt = false
      this.showKeyReader = false
      this.showKeyReader = true
    },
    /** 支付金额 */
    async payOrder (jwk) {
      if (!this.isLoggedIn) {
        this.$message.warning(this.$t('login.pleaseLogInFirst'))
        return
      }

      try {
        const myWalletAddress = await this.$api.ArweaveNative.wallets.getAddress(jwk)
        if (myWalletAddress === this.data.data.status.creator) {
          this.$message.warning(this.$t('failure.shouldnotSponsorYourSelf'))
          this.$emit('input', false)
          return
        }
        if (myWalletAddress !== this.myAddress) {
          this.$message.warning(this.$t('failure.youCanOnlyPayForYourSelf'))
          this.$emit('input', false)
          return
        }
      } catch (err) {
        this.$message.warning(this.$t('failure.fileFormatError'))
        this.$emit('input', false)
        return
      }

      this.showKeyReader = false
      this.setLoading(true)
      const callback = (event, id) => {
        if (event === 'onDistributionPosted') this.openSuccessNotify('distribution', id, 30000)
        if (event === 'onDeveloperPosted') this.openSuccessNotify('developer', id, 30000)
        if (event === 'onSponsorAdded') this.openSuccessNotify('sponsor', id, 30000)
        if (event === 'onDonationAdded') this.openSuccessNotify('donation', id, 30000)
        if (event === 'onUpdatedTicker') this.openSuccessNotify('update', '', 30000)

        if (event === 'onDistributionError') this.openFailureNotify('distribution', '', 30000)
        if (event === 'onDeveloperCatchError') this.openFailureNotify('developer', '', 30000)
        if (event === 'onSponsorAddedCatchError') this.openFailureNotify('sponsor', '', 30000)
        if (event === 'onDonationAddedCatchError') this.openFailureNotify('donation', '', 30000)
        if (event === 'onUpdatedTickerError') this.openFailureNotify('update', id, 30000)
      }
      this.openTransactionInProgressNotify()
      switch (this.paymentData.type) {
        case '0':
          await this.$api.contract.sponsorAdded(jwk,
            this.paymentData.data.contract,
            this.paymentData.data.total.toString(),
            this.paymentData.data.item, callback
          )
          break
        case '1':
          await this.$api.contract.donationAdded(jwk,
            this.paymentData.data.contract,
            this.paymentData.data.item.statusId,
            this.paymentData.data.total.toString(),
            this.paymentData.data.item.value, callback
          )
          break
      }
      this.setLoading(false)
      this.$emit('payment-close', false)
    },
    /** 关闭结算界面 */
    handleReceiptClose () {
      this.showReceipt = false
      this.setLoading(false)
      this.$emit('payment-close', false)
      this.$emit('input', false)
    },
    /** 打开钱包读取界面 */
    handleKeyReaderClose () {
      this.showKeyReader = false
      this.setLoading(false)
      this.$emit('payment-close', false)
      this.$emit('input', false)
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
    /** 打开成功通知 */
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
        case 'donation':
          title = this.$t('success.donateTxSuccess')
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
    /** 打开失败通知 */
    openFailureNotify (type, id, duration) {
      let title = ''
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
    },
    setLoading (status) {
      switch (this.data.type) {
        case '0':
          this.mSetPaymentInProgress(status)
          break
        case '1':
          this.mSetDonationPaymentInProgress(status)
          break
      }
    }
  }
}
</script>

<style lang="less" scoped>

</style>
