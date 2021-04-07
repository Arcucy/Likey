<template>
  <div class="status-detail">
    <div class="col-6">
      <div class="cardunit-bg" v-loading="detailsLoading">
        <!-- 置顶标签 -->
        <div v-if="isTop" class="cardunit-bg-retweeted">
          <div class="cardunit-bg-retweeted-l">
            <svg-icon icon-class="twitter-forward" />
          </div>
          <div class="cardunit-bg-retweeted-r">
            置顶
          </div>
        </div>
        <!-- 卡片主体 -->
        <div class="cardunit">
          <!-- 卡片右侧 -->
          <div class="cardunit-r">
            <!-- 用户名称与发布时间 -->
            <div class="cardunit-r-header">
              <!-- 头像 -->
              <router-link
                class="cardunit-r-header-avatar"
                :to="creatorUrl"
              >
                <Avatar size="49px" :src="avatarImg" />
              </router-link>
              <router-link
                class="cardunit-r-header-user"
                :to="creatorUrl"
              >
                <p class="cardunit-r-header-user-nickname">{{ nickname || $t('flowCard.nmaeLoading') }}</p>
                <p class="cardunit-r-header-user-shortname">{{ shortname ? '@' + shortname : $t('flowCard.shortnameLoading') }}</p>
              </router-link>
            </div>
            <!-- 标题 -->
            <h4 v-if="title" class="cardunit-r-title">
              {{ title }}
            </h4>
            <!-- 解锁卡片（上锁时显示） -->
            <Locked
              v-if="isLocked"
              :preview="preview"
              @load-more="unlock"
              @locked-payment="startPayment"
              :loading="detailsLoading"
            />
            <!-- 正文 -->
            <mainText
              v-if="content"
              class="cardunit-r-content"
              :text="content"
              :limit-lines="false"
            />
            <!-- 图片 -->
            <photoAlbum
              v-if="media && media.length > 0"
              class="cardbtm10"
              :media="media"
              :is-encrypt="details.isLock"
            />
            <!-- 音频 -->
            <AudioCard
              v-for="(item, index) of audio.slice(0,4)"
              class="cardbtm10"
              :key="'audio-' + index"
              :audio="item"
              :is-encrypt="details.isLock"
            />
            <!-- 文件 -->
            <FileCard
              v-for="(item, index) of files.slice(0,4)"
              class="cardbtm10"
              :key="'files-' + index"
              :file="item"
              :is-encrypt="details.isLock"
            />
            <!-- 动态交互 -->
            <div class="cardunit-r-flows">
              <p class="cardunit-r-flows-time">
                {{ createTime }}
              </p>
              <router-link class="cardunit-r-flows-list" :to="{}">
                <!-- 赞赏 -->
                <div class="cardunit-r-flows-list-item" @click="likeClick">
                  <span class="mdi mdi-currency-usd cardunit-r-flows-list-item-icon" />
                  <span class="cardunit-r-flows-list-item-text">
                    {{ donateBtnText }}
                  </span>
                </div>
                <!-- 分享 -->
                <div class="cardunit-r-flows-list-item" @click="copyCode(getShareLink())">
                  <span class="mdi mdi-export-variant cardunit-r-flows-list-item-icon" />
                  <span class="cardunit-r-flows-list-item-text">
                    {{ $t('flowCard.share') }}
                  </span>
                </div>
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="col-3">
      <SponsorStatistics v-if="creatorAdd" :address="creatorAdd" />
      <UnlockSolutionList v-if="creatorAdd" :address="creatorAdd" />
    </div>
    <Payment
      v-model="showPaymentDialog"
      :data="paymentData"
      @payment-close="paymentClose"
    />
    <DonationPurchase
      v-model="showDonationInput"
      @confirm-donation="confirmDonation"
      @donation-close="closeDonation"
    />
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'

import decode from '@/util/decode'
import { decryptText } from '@/util/encrypt'
// left
import Avatar from '@/components/User/Avatar'
import mainText from '@/components/FlowCard/MainText'
import photoAlbum from '@/components/FlowCard/PhotoAlbum'
import AudioCard from '@/components/FlowCard/AudioCard'
import FileCard from '@/components/FlowCard/FileCard'
import Locked from '@/components/FlowCard/Locked'
// right
import SponsorStatistics from '@/components/Creator/SponsorStatistics'
import UnlockSolutionList from '@/components/Creator/UnlockSolutionList'
// hide
import Payment from '@/components/Common/Payment'
import DonationPurchase from '@/components/Common/DonationPurchase'

export default {
  components: {
    // left
    Avatar,
    mainText,
    photoAlbum,
    AudioCard,
    FileCard,
    Locked,
    // right
    SponsorStatistics,
    UnlockSolutionList,
    // hide
    Payment,
    DonationPurchase
  },
  data () {
    return {
      showHiddenContent: false,
      likeIt: false,
      likeLoading: false,
      avatar: '',
      username: '',
      selfLoadShortname: '',
      details: null,
      detailsLoading: false,
      creatorAdd: '',
      txTags: null,
      isUnlocked: false,
      showPaymentDialog: false,
      showDonationInput: false,
      donateData: {
        contract: {},
        status: {},
        donation: {
          value: ''
        }
      },
      paymentData: {
        type: '0',
        data: {}
      }
    }
  },
  computed: {
    ...mapState({
      appLang: state => state.app.appLang,
      creators: state => state.contract.creators,
      creatorPst: state => state.contract.creatorPst,
      owner: state => state.contract.owner,
      myAddress: state => state.user.myInfo.address,
      donationPaymentInProgress: state => state.app.donationPaymentInProgress
    }),
    ...mapGetters(['isLoggedIn']),
    likeIconClass () {
      return {
        'like-touch': !this.likeLoading,
        active: !!this.flows.idonated
      }
    },
    preview () {
      const tags = { ...this.txTags }
      return {
        id: this.$route.params.id,
        cursor: '',
        creator: this.creatorAdd,
        timestamp: tags['Unix-Time'],
        schemaVersion: tags['Schema-Version'],
        title: tags.Title || '',
        summary: tags.Summary || '',
        extra: this.strToObj(tags.Extra),
        lockContract: tags['Lock-Contract'] || '',
        lockValue: tags['Lock-Value'] || 0
      }
    },
    avatarImg () {
      return this.avatar
    },
    isTop () {
      return false
    },
    shortname () {
      return this.selfLoadShortname
    },
    nickname () {
      return this.username
    },
    createTime () {
      if (!this.preview.timestamp) return ''
      const time = this.$moment(Number(this.preview.timestamp)).locale(this.appLang)
      const year = this.appLang === 'zh-CN' ? '年' : ''
      return time.format(`YYYY${year} MMM Do`)
    },
    title () {
      return this.preview.title
    },
    content () {
      if (this.isLocked) return ''
      if (this.details) return this.details.content
      return ''
    },
    media () {
      if (this.isLocked) return []
      if (!this.details || !this.details.extra || !this.details.extra.medias) return []
      return this.details.extra.medias
    },
    audio () {
      if (this.isLocked) return []
      if (!this.details || !this.details.extra || !this.details.extra.audios) return []
      return this.details.extra.audios
    },
    files () {
      if (this.isLocked) return []
      if (!this.details || !this.details.extra || !this.details.extra.files) return []
      return this.details.extra.files
    },
    flows () {
      return {
        idonated: false,
        donate: 0
      }
    },
    creator () {
      return this.creators ? this.creators[this.preview.creator] : null
    },
    contract () {
      if (!this.creator) return {}
      return this.creatorPst[this.creator.ticker.contract]
    },
    donateBtnText () {
      return this.likeLoading ? this.$t('app.loading') : this.$t('flowCard.donate')
    },
    isLocked () {
      const lock = this.details && this.details.isLock
      return lock && !this.isUnlocked
    },
    creatorUrl () {
      if (!this.shortname) return {}
      return { name: 'Creator', params: { shortname: this.shortname } }
    }
  },
  watch: {
  },
  mounted () {
    this.initData()
  },
  methods: {
    /** 获取头像 */
    async getAvatar () {
      try {
        const address = this.creatorAdd
        const data = await this.$api.gql.getAvatarByAddress(address)
        this.avatar = data
      } catch (err) {
        this.$message.error(this.$t('failure.gettingAvatarTimeout'))
        console.error('getAvatar error: ', err)
      }
    },
    /** 获取ID */
    async getUsername () {
      try {
        const address = this.creatorAdd
        const data = await this.$api.gql.getIdByAddress(address)
        this.username = data.data
      } catch (err) {
        this.$message.error(this.$t('failure.getUsername'))
        console.error('getUsername error: ', err)
      }
    },
    /** 获取短链用的名字 */
    async getShortname () {
      const address = this.creatorAdd
      const data = await this.$store.dispatch('getCreatorInfo', address)
      this.selfLoadShortname = data.shortname
    },
    /** 初始化数据 */
    async initData () {
      this.detailsLoading = true
      try {
        const transaction = await this.$api.gql.getTransactionDetail(this.preview.id)
        this.creatorAdd = await this.$api.gql.getAddressByOwner(transaction.owner)
        this.txTags = this.$api.gql.getTagsByTransaction(transaction)
        const data = JSON.parse(decode.uint8ArrayToString(transaction.data))
        if (data.isLock) data.content = this.decryptText(data.content)
        this.details = data
        this.getAvatar()
        this.getUsername()
        this.getShortname()
      } catch (err) {
        this.$message.error(this.$t('failure.getStatusDetails'))
        console.error('loadMore error: ', err)
      }
      this.detailsLoading = false
    },
    unlock () {
      this.isUnlocked = true
    },
    /** 推荐 */
    async likeClick () {
      if (!this.isLoggedIn) {
        this.$message.warning(this.$t('login.pleaseLogInFirst'))
        return
      }
      if (this.preview.creator === this.myAddress) {
        this.$message.warning(this.$t('failure.shouldnotSponsorYourSelf'))
        return
      }
      if (!this.owner) await this.getCreatorInfo(this.preview.creator)
      if (this.contract && this.contract.loading) {
        this.$message.info(this.$t('payment.dataLoadingPleaseTryLater'))
        return
      }

      this.showDonationInput = true
      this.donateData = {
        status: this.preview,
        contract: this.contract,
        donation: {
          value: ''
        }
      }
    },
    // 获取分享链接
    getShareLink () {
      return window.location.origin + '/#/status/' + this.preview.id
    },
    /** 拷贝 */
    copyCode (code) {
      this.$copyText(code).then(
        () => {
          this.$message({
            showClose: true,
            message: this.$t('home.sharedLinkHasBeenCopiedToTheClipboard'),
            type: 'success'
          })
        },
        () => {
          this.$message({ showClose: true, message: this.$t('error.copy'), type: 'error' })
        }
      )
    },
    strToObj (str) {
      if (!str) return null
      try {
        return JSON.parse(str)
      } catch (err) {
        console.error(err)
        return null
      }
    },
    decryptText (text) {
      if (text) return decryptText(text)
      return ''
    },
    startPayment (data) {
      this.paymentData.type = '0'
      this.paymentData.data = data
      this.showPaymentDialog = true
    },
    async confirmDonation (val) {
      if (!this.donateData.status.creator || !this.creators || !this.creators[this.donateData.status.creator]) return
      this.donateData.contract = this.creators[this.donateData.status.creator].ticker.contract
      this.showDonationInput = false
      this.donateData.donation.value = val
      this.paymentData.type = '1'
      this.paymentData.data = this.donateData
      this.showPaymentDialog = true
    },
    paymentClose () {
      this.showPaymentDialog = false
    },
    closeDonation () {
      this.showDonationInput = false
    }
  }
}
</script>

<style lang="less" scoped>
a {
  color: @dark;
  text-decoration: none;
  -webkit-tap-highlight-color: transparent;
  -ms-touch-action: manipulation;
  touch-action: manipulation;
}
p {
  margin: 0;
  padding: 0;
}

span {
  margin: 0;
  padding: 0;
}

.status-detail {
  max-width: 1220px;
  width: 100%;
  margin: 20px auto 100px;
  padding-bottom: 40px;
  &::after {
    content: "";
    display: block;
    width: 0;
    height: 0;
    clear: both;
  }
  .col-6 {
    width: 66.666%;
    padding: 0 10px;
    float: left;
    box-sizing: border-box;
  }
  .col-3 {
    width: 33.333%;
    padding: 0 10px;
    float: left;
    box-sizing: border-box;
  }
}

.cardunit-bg {
  display: block;
  background: @background;
  padding: 20px;
  border-radius: 10px;
  box-sizing: border-box;
  box-shadow: 0 0 2px 0 #0000001a;
  overflow: hidden;

  &:active {
    background-color: @background;
  }
  &:hover {
    background-color: @background;
  }

  &-retweeted {
    display: block;
    display: flex;
    margin-bottom: 5px;
    &-l {
      width: 49px;
      margin-right: 10px;
      display: flex;
      justify-content: flex-end;
      svg {
        height: 18px;
        width: 18px;
        color: @gray3;
      }
    }
    &-r {
      flex: 1;
      font-size: 13px;
      font-weight: 700;
      line-height: 17px;
      color: @gray3;
    }
  }
  .jump-shield {
    cursor: default;
    display: block;
  }
}

.cardunit {
  background: @background;
  display: flex;

  &-r {
    flex: 1;
    height: 100%;

    &-header {
      display: flex;
      margin-bottom: 15px;
      align-items: flex-start;

      &-avatar {
        width: 49px;
        height: 49px;
        margin-right: 10px;
      }

      &-user {
        line-height: 20px;
        font-size: 15px;
        color: @dark;
        display: block;

        &-nickname {
          font-size: 15px;
          font-weight: 700;
          color: @dark;
          margin: 0 0 5px;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 1;
          overflow: hidden;
          word-break: break-all;
        }
        &-shortname {
          font-size: 15px;
          color: @gray3;
          margin: 0;
          font-weight: 400;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 1;
          overflow: hidden;
          word-break: break-all;
        }
        &:hover {
          .cardunit-r-header-user-nickname {
            color: @primary;
            text-decoration: underline;
          }
        }
      }

      &-logo {
        font-size: 20px;
        color: @primary;
        margin: 0 0 0 5px;
        transition: all ease-in 0.1s;
        display: inherit;
        &:hover {
          transform: scale(1.2);
        }
      }
    }

    &-title {
      color: @dark;
      font-size: 22px;
      font-weight: 700;
      padding: 0;
      margin: 0 0 5px;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      overflow: hidden;
      word-break: break-all;
    }

    .cardbtm10 {
      margin: 10px 0;
      overflow: hidden;
    }

    &-flows {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 15px;
      padding-top: 10px;
      border-top: solid 1px @gray2;

      &-time {
        height: 20px;
        margin-right: 10px;
        color: @gray3;
        font-size: 15px;
        font-weight: 400;
        line-height: 20px;
        white-space: nowrap;
      }

      &-list {
        display: flex;
        user-select: none;
        &-item {
          display: flex;
          align-items: center;
          margin-right: 20px;
          color: @gray3;
          border-radius: 6px;
          padding: 5px 8px 5px 6px;

          &:last-child {
            margin-right: 0;
          }

          &-icon {
            font-size: 18px;
            height: 20px;
            display: flex;
            justify-content: center;
            align-items: center;
          }

          &-text {
            font-size: 14px;
            margin: 0 0 0 5px;
          }

          &:hover {
            color: @primary;
            background: @primary-light;
          }

          &:active {
            color: @primary;
            background: @primary-dark;
          }
        }
      }
    }
  }
}

@media screen and (max-width: 799px) {
  .status-detail {
    display: flex;
    flex-direction: column;
    .col-6, .col-3 {
      width: 100%;
    }
  }
  .cardunit-bg {
    margin-bottom: 40px;
  }
}

@media screen and (max-width: 640px) {
  .status-detail {
    .col-6, .col-3 {
      padding: 0;
      margin-bottom: 20px;
    }
  }

  .cardunit-bg {
    border-radius: 0;
    padding: 20px 16px;
  }

  .status-detail {
    padding: 0;
  }
}
</style>
