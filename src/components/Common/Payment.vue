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
        this.setLoading(true)
        await this.buyPst()
      }
    }
  },
  async mounted () {
  },
  methods: {
    ...mapMutations(['mSetPaymentInProgress', 'mSetDonationPaymentInProgress']),
    ...mapActions(['getPstContract', 'getCreatorInfo']),
    async buyPst () {
      if (!this.isLoggedIn) {
        this.$message.warning(this.$t('login.pleaseLogInFirst'))
        this.setLoading(false)
        this.$emit('input', false)
        return
      }
      console.log('this.data.data.status.creator', this.data.data.status.creator, this.myAddress)
      if (this.data.data.status.creator === this.myAddress) {
        this.$message.warning(this.$t('failure.shouldnotSponsorYourSelf'))
        this.setLoading(false)
        this.$emit('input', false)
        return
      }
      this.showReceipt = false
      this.setLoading(true)
      this.showReceipt = true

      // 换算为具体支付的金额
      this.receiptLoading = true
      let value
      switch (this.data.type) {
        // 0 为解锁
        case '0':
          value = this.convertPstToWinston(this.data.data.unlock.value, this.data.data.contract.ratio)
          value = new BigNumber(value).toFixed(0)

          this.paymentData.data = { ...await this.$api.contract.distributeTokens(this.data.data.contract, value, undefined, false) }
          this.paymentData.data.contract = this.data.data.status.lockContract
          this.paymentData.data.owner = this.data.data.status.creator
          this.paymentData.data.item = this.data.data.unlock
          break
        // 1 为打赏
        case '1':
          value = this.$api.ArweaveNative.ar.arToWinston(this.data.data.donation.value)
          this.paymentData.data = { ...await this.$api.contract.distributeTokens(this.data.data.contract, value, undefined, false) }
          this.paymentData.data.contract = this.data.data.contract
          this.paymentData.data.owner = this.data.data.status.creator
          this.paymentData.data.item = {
            statusId: this.data.data.status.id,
            value: value
          }
          break
      }
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

      try {
        const myWalletAddress = await this.$api.ArweaveNative.wallets.getAddress(jwk)
        if (myWalletAddress === this.data.data.status.creator) {
          this.$message.warning(this.$t('failure.shouldnotSponsorYourSelf'))
          this.setLoading(false)
          return
        }
        if (myWalletAddress !== this.myAddress) {
          this.$message.warning(this.$t('failure.youCanOnlyPayForYourSelf'))
          this.setLoading(false)
          return
        }
      } catch (err) {
        this.$message.warning(this.$t('failure.fileFormatError'))
        this.setLoading(false)
        return
      }

      this.showKeyReader = false
      this.setLoading(true)
      const callback = (event, id) => {
        if (event === 'onDistributionPosted') this.openSuccessNotify('distribution', id, 30000)
        if (event === 'onDeveloperPosted') this.openSuccessNotify('developer', id, 30000)
        if (event === 'onSponsorAdded') this.openSuccessNotify('sponsor', id, 30000)
        if (event === 'onDonationAdded') this.openSuccessNotify('donation', id, 30000)

        if (event === 'onDistributionError') this.openFailureNotify('distribution', '', 10000)
        if (event === 'onDeveloperCatchError') this.openFailureNotify('developer', '', 10000)
        if (event === 'onSponsorAddedCatchError') this.openFailureNotify('sponsor', id, 10000)
        if (event === 'onDonationAddedCatchError') this.openFailureNotify('donation', id, 10000)
      }
      switch (this.paymentData.type) {
        case '0':
          await this.$api.contract.sponsorAdded(jwk, this.data.data.status.lockContract, this.paymentData.data.total, this.paymentData.data.item, callback)
          break
        case '1':
          await this.$api.contract.donationAdded(jwk, this.data.data.status.lockContract, this.paymentData.data.item.statusId, this.paymentData.data.total, this.paymentData.data.item.value, callback)
          break
      }
      this.setLoading(false)
      this.$emit('payment-close', false)
    },
    /** 关闭结算界面 */
    handleReceiptClose () {
      this.showReceipt = false
      this.$emit('payment-close', false)
      this.setLoading(false)
    },
    /** 打开钱包读取界面 */
    handleKeyReaderClose () {
      this.showKeyReader = false
      this.$emit('payment-close', false)
      this.setLoading(false)
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
        case 'donation':
          title = this.$t('success.donateTxSuccess')
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
