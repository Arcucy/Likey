<template>
  <div>
    <SolutionPurchaseReceipt
      v-model="showReceipt"
      :receipt="paymentData"
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
    ...mapState({
      creators: state => state.contract.creators,
      creatorPst: state => state.contract.creatorPst,
      owner: state => state.contract.owner,
      myAddress: state => state.user.myInfo.address
    }),
    ...mapGetters(['isLoggedIn'])
  },
  watch: {
    async value (val) {
      if (val) {
        this.mSetPaymentInProgress(true)
        await this.buyPst()
      }
    }
  },
  async mounted () {
  },
  methods: {
    ...mapMutations(['mSetPaymentInProgress']),
    ...mapActions(['getPstContract', 'getCreatorInfo']),
    async buyPst () {
      if (!this.isLoggedIn) {
        this.$message.warning(this.$t('login.pleaseLogInFirst'))
        this.mSetPaymentInProgress(false)
        return
      }
      if (this.data.status.creator === this.myAddress) {
        this.$message.warning(this.$t('failure.shouldnotSponsorYourSelf'))
        this.mSetPaymentInProgress(false)
        return ''
      }
      this.showReceipt = false

      // 换算为具体支付的金额
      let value = this.convertPstToWinston(this.data.unlock.value, this.data.contract.ratio)
      value = new BigNumber(value).toFixed(0)

      this.paymentData = { ...await this.$api.contract.distributeTokens(this.data.contract, value, undefined, false) }
      this.paymentData.contract = this.data.status.lockContract
      this.paymentData.owner = this.data.status.creator
      this.paymentData.item = this.data.unlock

      this.showReceipt = true
    },
    /** 在确认费用后打开钱包 */
    openKeyReader () {
      this.showKeyReader = false
      this.showKeyReader = true
      this.pstLoading = false
    },
    /** 支付金额 */
    async payOrder (jwk) {
      if (!this.isLoggedIn) {
        this.$message.warning(this.$t('login.pleaseLogInFirst'))
        return
      }

      try {
        const myWalletAddress = await this.$api.ArweaveNative.wallets.getAddress(jwk)
        if (myWalletAddress === this.data.status.creator) {
          this.$message.warning(this.$t('failure.shouldnotSponsorYourSelf'))
          return
        }
        if (myWalletAddress !== this.myAddress) {
          this.$message.warning(this.$t('failure.youCanOnlyPayForYourSelf'))
          return
        }
      } catch (err) {
        this.$message.warning(this.$t('failure.fileFormatError'))
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
      await this.$api.contract.sponsorAdded(jwk, this.data.status.lockContract, this.paymentData.total, this.paymentData.item, callback)
      this.mSetPaymentInProgress(false)
    },
    /** 关闭结算界面 */
    handleReceiptClose () {
      this.showReceipt = false
      this.$emit('payment-close', false)
      this.mSetPaymentInProgress(false)
    },
    /** 打开钱包读取界面 */
    handleKeyReaderClose () {
      this.showKeyReader = false
      this.$emit('payment-close', false)
      this.mSetPaymentInProgress(false)
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
    openFailureNotify (type, duration) {
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

</style>
