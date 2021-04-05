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
              {{ this.convertPstToWinston(unlockPstValue, pstRatio) | winstonToAr | finalize(pstLoading) }}
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
  </div>
</template>

<script>
import BigNumber from 'bignumber.js'
import { mapState, mapActions, mapGetters } from 'vuex'

import decode from '@/util/decode'

export default {
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
      // import convertPstToWinston
      convertPstToWinston: decode.convertPstToWinston
    }
  },
  computed: {
    ...mapState({
      creators: state => state.contract.creators,
      creatorPst: state => state.contract.creatorPst,
      owner: state => state.contract.owner,
      myAddress: state => state.user.myInfo.address,
      paymentInProgress: state => state.app.paymentInProgress
    }),
    ...mapGetters(['isLoggedIn', 'isMe']),
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
      // 没登录，不解锁
      if (!this.isLoggedIn) return false
      // 是创作者本人，直接解锁
      if (this.isMe(this.preview.creator)) return true
      // 合约没有加载好，不解锁
      if (!this.contract) return false
      if (!this.contract.balances) return false
      // 没有余额，不解锁
      const balance = this.contract.balances[this.myAddress]
      if (!balance) return false
      // 如果是全部持有者解锁，则判断余额是否大于0
      const isAllValueUnlock = (!this.preview.lockValue || this.preview.lockValue === '0') && this.preview.lockContract
      const balanceBig = new BigNumber(balance).div(this.contract.divisibility)
      if (isAllValueUnlock && balanceBig.isGreaterThan(new BigNumber(0))) return true
      // 判断余额是否足够解锁
      const lockValue = new BigNumber(this.preview.lockValue)
      return Boolean(balanceBig.isGreaterThanOrEqualTo(lockValue))
    },
    unlockPstValue () {
      const isAllValueUnlock = (!this.preview.lockValue || this.preview.lockValue === '0') && this.preview.lockContract
      let returnValue = isAllValueUnlock ? '1' : this.preview.lockValue
      if (!isAllValueUnlock) {
        if (!this.contract) return returnValue
        if (!this.contract.balances) return returnValue
        const balance = this.contract.balances[this.myAddress]
        if (!balance) return returnValue
        const balanceBig = new BigNumber(balance).div(this.contract.divisibility)
        const requiredValue = new BigNumber(this.preview.lockValue)
        returnValue = requiredValue.minus(balanceBig).toString()
      }
      return returnValue
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
      if (!this.creator || !this.creatorPst) return null
      const contract = this.creatorPst[this.creator.ticker.contract]
      if (!contract) return null
      return contract.ticker ? contract : null
    }
  },
  watch: {
    paymentInProgress (val) {
      this.pstLoading = val
    }
  },
  async mounted () {
    this.pstLoading = true
    this.getPostStatus()
    if (!this.owner) await this.getCreatorInfo(this.preview.creator)
    if (!this.contract) await this.getPstContract(this.creator.ticker.contract)
    this.pstLoading = false
  },
  methods: {
    ...mapActions(['getPstContract', 'getCreatorInfo']),
    buyPst () {
      const matchedItem = {
        title: 'Custom',
        value: '1',
        number: '1'
      }
      if (this.contract.balances[this.myAddress]) {
        const balance = this.contract.balances[this.myAddress]
        BigNumber.set({ EXPONENTIAL_AT: 26 })
        const balanceBig = new BigNumber(balance).div(this.contract.divisibility)
        const requiredValue = new BigNumber(this.preview.lockValue)
        matchedItem.value = requiredValue.minus(balanceBig).toString()
      }
      this.$emit('locked-payment', {
        status: this.preview,
        unlock: matchedItem,
        contract: this.creator.ticker.contract
      })
    },
    loadMore () {
      this.$emit('load-more')
    },
    async getPostStatus () {
      if (!this.pstStatus) this.pstLoading = true
      try {
        await this.getPstContract(this.preview.lockContract)
        this.pstLoading = false
      } catch (err) {
        this.$message.error(this.$t('failure.failedToObtainContractStatus'))
        this.pstLoading = false
      }
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
    word-break: break-all;
    word-wrap: break-word;
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
        word-break: break-all;
        word-wrap: break-word;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        overflow: hidden;
        text-align: center;
      }

      P {
        margin: 0 0 10px;
        font-size: 15px;
        word-break: break-all;
        word-wrap: break-word;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 3;
        overflow: hidden;
        text-align: center;
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

        &-item {
          font-size: 12px;
          margin-right: 10px;

          &:last-child {
            margin-right: 0;
          }

          span {
            font-size: 15px;
          }
        }
      }
    }
  }
}
</style>
