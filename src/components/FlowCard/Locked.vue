<template>
  <div class="flow-locked">
    <!-- 摘要文本 -->
    <p v-if="preview.summary" class="flow-locked-text">
      {{ text }}
    </p>
    <router-link :to="{}">
      <div class="flow-locked-boxbg">
        <div class="flow-locked-boxbg-pillar" />
        <div class="flow-locked-box">
          <!-- 未解锁 -->
          <div v-if="!isUnlocked" class="flow-locked-box-content">
            <h4>
              {{ $t('flowCard.ownNUnlock', [preview.lockValue === '0' ? '' : preview.lockValue, pstTicker]) }}
            </h4>
            <p>
              {{ $t('flowCard.needToMeetTheAboveUnlockConditions') }}
            </p>
            <el-button
              class="flow-locked-box-content-btn"
              type="primary"
              :disabled="!pstStatus || pstLoading"
              :loading="pstLoading"
              @click="buyPst"
            >
              {{ unlockPstValue | winstonToAr | finalize(pstLoading) }}
            </el-button>
          </div>
          <!-- 已解锁 -->
          <div v-else class="flow-locked-box-content">
            <h4>
              {{ $t('flowCard.unlocked') }}
            </h4>
            <p>
              {{ $t('flowCard.ownNUnlock', [preview.lockValue === '0' ? '' : preview.lockValue, pstTicker]) }}
            </p>
            <el-button
              class="flow-locked-box-content-btn"
              type="primary"
              :disabled="pstLoading || loading"
              :loading="pstLoading || loading"
              @click="loadMore"
            >
              {{ $t(pstLoading || loading ? 'app.loading' : 'flowCard.displayContent') }}
            </el-button>
          </div>
          <div v-if="isShowExtraBox" class="flow-locked-box-extra">
            <div v-if="extra.media" class="flow-locked-box-extra-item">
              <span class="mdi mdi-image-size-select-actual" />
              {{ extra.media }}
            </div>
            <div v-if="extra.audio" class="flow-locked-box-extra-item">
              <span class="mdi mdi-music-circle" />
            </div>
            <div v-if="extra.file" class="flow-locked-box-extra-item">
              <span class="mdi mdi-file" />
            </div>
          </div>
        </div>
      </div>
    </router-link>
    <router-link :to="{}">
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
    </router-link>
  </div>
</template>

<script>
import BigNumber from 'bignumber.js'
import { mapState, mapActions, mapGetters } from 'vuex'

import decode from '@/util/decode'

import PaymentKeyReader from '@/components/Common/PaymentKeyReader'
import SolutionPurchaseReceipt from '@/components/Common/SolutionPurchaseReceipt'

export default {
  components: {
    SolutionPurchaseReceipt,
    PaymentKeyReader

  },
  props: {
    // 预览数据
    preview: {
      type: Object,
      required: true
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      pstLoading: false,
      showReceipt: false,
      showKeyReader: false,
      paymentData: {
        contract: '',
        value: new BigNumber('0'),
        creator: new BigNumber('0'),
        holder: new BigNumber('0'),
        developer: new BigNumber('0'),
        owner: ''
      },

      // import convertPstToWinston
      convertPstToWinston: decode.convertPstToWinston
    }
  },
  computed: {
    ...mapState({
      creators: state => state.contract.creators,
      creatorPst: state => state.contract.creatorPst,
      owner: state => state.contract.owner,
      myAddress: state => state.user.myInfo.address
    }),
    ...mapGetters(['isLoggedIn']),
    text () {
      return this.preview.summary + (this.preview.summary.length >= 100 ? '...' : '')
    },
    extra () {
      if (!this.preview.extra) {
        return {
          media: 0,
          audio: 0,
          file: 0
        }
      }
      return {
        media: this.preview.extra.media || 0,
        audio: this.preview.extra.audio || 0,
        file: this.preview.extra.file || 0
      }
    },
    isShowExtraBox () {
      return this.preview.extra && (this.preview.extra.media || this.preview.extra.audio || this.preview.extra.file)
    },
    pstStatus () {
      if (!this.creatorPst) return null
      const pst = this.creatorPst[this.preview.lockContract]
      if (!pst || !pst.ticker) return null
      return pst
    },
    pstRatio () {
      return this.pstStatus ? this.pstStatus.ratio : ''
    },
    pstTicker () {
      return this.pstStatus ? this.pstStatus.ticker : 'PST'
    },
    /** 是否解锁 */
    isUnlocked () {
      // 请把是否解锁的逻辑判断写在这里
      return false
    },
    unlockPstValue () {
      let returnValue = '1'
      if (this.preview.lockValue === '0') {
        for (let i = 0; i < this.pstItems.length; i++) {
          const item = this.pstItems[i]
          const value = new BigNumber(item.value)
          if (value.isGreaterThanOrEqualTo(this.preview.lockValue)) {
            returnValue = item.value
            break
          }
        }
      }
      return this.convertPstToWinston(returnValue, this.pstRatio)
    },
    creator () {
      return this.creators ? this.creators[this.preview.creator] : null
    },
    pstInfo () {
      if (!this.creator) return ''
      return this.creator.ticker
    },
    pstItems () {
      if (!this.creator) return []
      return this.creator.items
    },
    contract () {
      if (!this.creator) return {}
      return this.creatorPst[this.creator.ticker.contract]
    }
  },
  async mounted () {
    this.getPostStatus()
    if (!this.owner) await this.getCreatorInfo(this.preview.creator)
  },
  methods: {
    ...mapActions(['getPstContract', 'getCreatorInfo']),
    loadMore () {
      this.$emit('load-more')
    },
    async buyPst () {
      if (!this.isLoggedIn) {
        this.$message.warning(this.$t('login.pleaseLogInFirst'))
        return
      }
      if (this.preview.creator === this.myAddress) {
        this.$message.warning(this.$t('failure.shouldnotSponsorYourSelf'))
        return ''
      }

      let matchedItem = {
        title: 'Custom',
        value: '1',
        number: '1'
      }
      console.log(this.contract)
      for (let i = 0; i < this.pstItems.length; i++) {
        const item = this.pstItems[i]
        const value = new BigNumber(item.value)
        if (value.isGreaterThan(this.preview.lockValue)) {
          matchedItem = item
          break
        }
      }
      this.showReceipt = false
      this.pstLoading = true
      this.paymentType = 0

      // 换算为具体支付的金额
      let value = this.convertPstToWinston(matchedItem.value)
      value = new BigNumber(value).toFixed(0)

      this.paymentData = { ...await this.$api.contract.distributeTokens(this.contract, value, undefined, false) }
      console.log(this.paymentData.developer.toString())
      this.paymentData.contract = this.creator.ticker.contract
      this.paymentData.owner = this.address
      this.paymentData.item = {
        title: matchedItem.title,
        value: matchedItem.value,
        number: matchedItem.number
      }

      this.showReceipt = true
    },
    async getPostStatus () {
      if (!this.pstStatus) this.pstLoading = true
      try {
        await this.getPstContract(this.preview.lockContract)
        this.pstLoading = false
      } catch (err) {
        console.error(err)
        this.$message.error(this.$t('failure.failedToObtainContractStatus'))
        this.pstLoading = false
      }
    },
    /** 在确认费用后打开钱包 */
    openKeyReader () {
      this.showKeyReader = false
      this.showKeyReader = true
      this.pstLoading = false
    },
    /** 支付金额 */
    async payOrder (jwk) {
      // if (!this.isLoggedIn) {
      //   this.$message.warning(this.$t('login.pleaseLogInFirst'))
      //   return
      // }

      // const myWalletAddress = await this.$api.ArweaveNative.wallets.getAddress(jwk)
      // if (myWalletAddress === this.address) {
      //   this.$message.warning(this.$t('failure.shouldnotSponsorYourSelf'))
      //   return
      // }
      // if (myWalletAddress !== this.myAddress) {
      //   this.$message.warning(this.$t('failure.youCanOnlyPayForYourSelf'))
      //   return
      // }

      // this.showKeyReader = false
      // const callback = (event, id) => {
      //   if (event === 'onDistributionPosted') this.openSuccessNotify('distribution', id, 30000)
      //   if (event === 'onDeveloperPosted') this.openSuccessNotify('developer', id, 30000)
      //   if (event === 'onSponsorAdded') this.openSuccessNotify('sponsor', id, 30000)

      //   if (event === 'onDistributionError') this.openFailureNotify('distribution', '', 10000)
      //   if (event === 'onDeveloperCatchError') this.openFailureNotify('developer', '', 10000)
      //   if (event === 'onSponsorAddedCatchError') this.openSuccessNotify('sponsor', id, 10000)
      // }
      // switch (this.paymentType) {
      //   case 0:
      //     // 执行合约
      //     await this.$api.contract.sponsorAdded(jwk, this.creator.ticker.contract, this.paymentData.total, this.paymentData.item, callback)
      //     this.pstLoading = false
      //     break
      //   case 1:
      //     await this.$api.contract.sponsorAdded(jwk, this.creator.ticker.contract, this.paymentData.total, this.paymentData.item, callback)
      //     this.pstLoading = false
      //     break
      // }
    },
    /** 关闭结算界面 */
    handleReceiptClose () {
      this.showReceipt = false
      this.pstLoading = false
    },
    /** 打开钱包读取界面 */
    handleKeyReaderClose () {
      this.showKeyReader = false
      this.pstLoading = false
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
a {
  text-decoration: none;
  color: @dark;
}
.flow-locked {

  &-text {
    font-size: 15px;
    line-height: 1.5;
    color: @dark;
    margin: 0 0 5px;
    padding: 0;
    max-width: 100%;
  }

  &-boxbg {
    position: relative;
    width: 100%;
    margin: 0 0 10px;
    min-height: 148px;

    &-pillar {
      padding-bottom: 35%;
    }
  }
  &-box {
    background: @gray1;
    border-radius: 6px;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    color: @gray3;
    border: 1px solid #fff0;
    user-select: none;
    overflow: hidden;
    cursor: default;

    &-content {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;

      h4 {
        font-size: 20px;
        color: @dark;
        margin: 0 0 5px;
      }

      P {
        margin: 0 0 10px;
        font-size: 15px;
      }

      &-btn {
        min-width: 130px;
      }
    }

    &-extra {
      position: absolute;
      top: 0;
      left: 0;
      padding: 10px 10px 0;
      &-item {
        color: @gray3;
        font-size: 15px;
        span {
          font-size: 18px;
        }
      }
    }
  }
}

@media screen and (max-width: 640px) {
  .flow-locked {
    &-boxbg {
      min-height: 158px;
    }
    &-box {
      &-content {
        h4 {
          font-size: 15px;
          padding: 0 10px;
        }
        p {
          font-size: 12px;
          padding: 0 10px;
        }
        &-btn {
          min-width: 100px;
          font-size: 12px;
          padding: 10px 10px;
        }
      }
      &-extra {
        display: flex;
        flex-direction: row;
        right: 0;
        padding: 5px 5px 0;
        column-gap: 10px;
        &-item {
        font-size: 12px;
        span {
          font-size: 15px;
        }
      }
      }
    }
  }
}
</style>
