<template>
  <router-link
    class="cardunit-bg"
    :to="{ name: 'Status', params: { id: preview.id } }"
  >
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
      <!-- 卡片左侧 -->
      <div class="cardunit-l">
        <!-- 头像 -->
        <router-link
          :to="creatorUrl"
        >
          <Avatar size="49px" :src="avatarImg" />
        </router-link>
      </div>
      <!-- 卡片右侧 -->
      <div class="cardunit-r">
        <!-- 用户名称与发布时间 -->
        <div class="cardunit-r-header">
          <p class="cardunit-r-header-user">
            <router-link
              :to="creatorUrl"
            >
              <span class="cardunit-r-header-user-nickname">{{ nickname || $t('flowCard.nmaeLoading') }}</span>
              <span class="cardunit-r-header-user-shortname"> {{ shortname ? '@' + shortname : $t('flowCard.shortnameLoading') }}</span>
            </router-link>
          </p>
          <p class="cardunit-r-header-time">
            •
            {{ createTime }}
          </p>
        </div>
        <!-- 标题 -->
        <h4 v-if="title" class="cardunit-r-title">
          {{ title }}
        </h4>
        <!-- 预览卡片（未上锁时显示） -->
        <Summary
          v-if="!preview.lockContract && !details && !isShortContent"
          :preview="preview"
          @load-more="loadMore"
          :loading="detailsLoading"
        />
        <!-- 解锁卡片（上锁时显示） -->
        <Locked
          v-if="preview.lockContract && !details"
          :preview="preview"
          @load-more="loadMore"
          @locked-payment="startPayment"
          :loading="detailsLoading"
        />
        <!-- 正文 -->
        <mainText
          v-if="content"
          :text="content"
        />
        <!-- 图片 -->
        <router-link
          v-if="media && media.length > 0"
          class="jump-shield cardbtm10"
          :to="{}"
        >
          <photoAlbum
            :media="media"
            :is-encrypt="details.isLock"
          />
        </router-link>
        <!-- 音频 -->
        <router-link
          v-for="(item, index) of audio.slice(0,4)"
          class="jump-shield cardbtm10"
          :key="'audio-' + index"
          :to="{}"
        >
          <AudioCard :audio="item" :is-encrypt="details.isLock" />
        </router-link>
        <!-- 文件 -->
        <router-link
          v-for="(item, index) of files.slice(0,4)"
          class="jump-shield cardbtm10"
          :key="'files-' + index"
          :to="{}"
        >
          <FileCard :file="item" :is-encrypt="details.isLock" />
        </router-link>
        <!-- 动态交互 -->
        <div class="cardunit-r-flows">
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
  </router-link>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex'

import * as momentFun from '@/util/momentFun'
import decode from '@/util/decode'
import { decryptText } from '@/util/encrypt'

import Avatar from '@/components/User/Avatar'
import mainText from './MainText'
import photoAlbum from './PhotoAlbum'
import AudioCard from './AudioCard'
import FileCard from './FileCard'
import Summary from './Summary'
import Locked from './Locked'

export default {
  components: {
    Avatar,
    mainText,
    photoAlbum,
    AudioCard,
    FileCard,
    Summary,
    Locked
  },
  props: {
    // 卡片数据
    brief: {
      type: Object,
      required: true
    },
    user: {
      type: Object,
      default: () => {
        return {
          username: '',
          avatar: '',
          address: '',
          shortname: ''
        }
      }
    },
    noLoadUser: {
      type: Boolean,
      default: false
    }
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
      showDonationInput: false
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
      const tags = this.getTags(this.brief.node.tags)

      return {
        id: this.brief.node.id,
        cursor: this.brief.cursor,
        creator: this.brief.node.owner.address,
        timestamp: tags['Unix-Time'],
        schemaVersion: tags['Schema-Version'],
        title: tags.Title || '',
        summary: tags.Summary || '',
        extra: this.strToObj(tags.Extra),
        lockContract: tags['Lock-Contract'] || '',
        lockValue: tags['Lock-Value'] || 0
      }
    },
    /** 是短内容么，短内容将不显示查看更多按钮 */
    isShortContent () {
      const lessThanMaximum = this.preview.summary.length !== 100
      const { media, audio, file } = { ...this.preview.extra }
      const noMedia = !media && !audio && !file
      // 摘要未达到最大字数，没有媒体，没有上锁
      return lessThanMaximum && noMedia && !this.preview.lockContract
    },
    avatarImg () {
      return this.noLoadUser ? this.user.avatar : this.avatar
    },
    isTop () {
      return false
    },
    shortname () {
      return this.noLoadUser ? this.user.shortname : this.selfLoadShortname
    },
    nickname () {
      return this.noLoadUser ? this.user.username : this.username
    },
    createTime () {
      const time = this.$moment(Number(this.preview.timestamp)).locale(this.appLang)
      if (!momentFun.isNDaysAgo(2, time)) return time.fromNow()
      else if (!momentFun.isNDaysAgo(365, time)) return time.format('MMMDo')
      return time.format('YYYY MMMDo')
    },
    title () {
      if (this.details) return this.details.title
      return this.preview.title
    },
    content () {
      if (this.details) return this.details.content
      if (this.isShortContent) return this.preview.summary
      return ''
    },
    media () {
      if (!this.details || !this.details.extra || !this.details.extra.medias) return []
      return this.details.extra.medias
    },
    audio () {
      if (!this.details || !this.details.extra || !this.details.extra.audios) return []
      return this.details.extra.audios
    },
    files () {
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
    creatorUrl () {
      if (!this.shortname) return {}
      return { name: 'Creator', params: { shortname: this.shortname } }
    }
  },
  watch: {
    brief: {
      handler (val) {
        if (!this.noLoadUser && val) {
          this.getShortname()
          this.getUsername()
          this.getAvatar()
        }
      },
      immediate: true
    }
  },
  mounted () {
  },
  methods: {
    ...mapActions(['getCreatorInfo']),
    /** 获取头像 */
    async getAvatar () {
      try {
        const address = this.brief.node.owner.address
        const data = await this.$api.gql.getAvatarByAddress(address)
        this.avatar = data
      } catch (err) {
        // this.$message.error(this.$t('failure.gettingAvatarTimeout'))
        console.error('getAvatar error: ', err)
      }
    },
    /** 获取ID */
    async getUsername () {
      try {
        const address = this.brief.node.owner.address
        const data = await this.$api.gql.getIdByAddress(address)
        this.username = data.data
      } catch (err) {
        // this.$message.error(this.$t('failure.getUsername'))
        this.username = 'unknown'
        console.error('getUsername error: ', err)
      }
    },
    /** 获取短链用的名字 */
    async getShortname () {
      const address = this.brief.node.owner.address
      const data = await this.$store.dispatch('getCreatorInfo', address)
      if (!data) return console.error('无法获取 shortname，address:', address)
      this.selfLoadShortname = data.shortname
    },
    /** 加载更多 */
    async loadMore () {
      if (this.detailsLoading) return
      this.detailsLoading = true
      try {
        const transaction = await this.$api.gql.getTransactionDetail(this.preview.id)
        const data = JSON.parse(decode.uint8ArrayToString(transaction.data))
        if (data.isLock) data.content = this.decryptText(data.content)
        this.details = data
      } catch (err) {
        this.$message.error(this.$t('failure.getStatusDetails'))
        console.error('loadMore error: ', err)
      }
      this.detailsLoading = false
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
      if (!this.owner) {
        this.$message.info(this.$t('payment.dataLoadingPleaseTryLater'))
        await this.getCreatorInfo(this.preview.creator)
      }
      if (this.contract && this.contract.loading) {
        this.$message.info(this.$t('payment.dataLoadingPleaseTryLater'))
        return
      }
      this.$emit('status-donation', {
        status: this.preview,
        contract: this.creator.ticker.contract,
        donation: {
          value: ''
        }
      })
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
    getTags (tags) {
      const ret = {}
      tags.forEach(item => { ret[item.name] = item.value })
      return ret
    },
    strToObj (str) {
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
      this.$emit('locked-payment', data)
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

.cardunit-bg {
  display: block;
  background: @background;
  padding: 20px;
  border-radius: 10px;
  box-sizing: border-box;
  box-shadow: 0 0 2px 0 #0000001a;
  overflow: hidden;
  cursor: pointer;

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

  &-l {
    width: 49px;
    margin-right: 10px;
    display: flex;
    flex-direction: column;

    &-avatar {
      width: 49px;
      height: 49px;
    }
  }

  &-r {
    flex: 1;
    height: 100%;

    &-header {
      display: flex;
      margin-bottom: 5px;
      align-items: flex-start;

      &-user {
        height: 20px;
        line-height: 20px;
        font-size: 15px;
        color: @dark;
        font-weight: 700;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 1;
        overflow: hidden;
        word-break: break-all;
        &-nickname {
          font-size: 15px;
          color: @dark;
        }
        &-shortname {
          font-size: 15px;
          color: @gray3;
          font-weight: 400;
        }
        &:hover {
          .cardunit-r-header-user-nickname {
            color: @primary;
            text-decoration: underline;
          }
        }
      }

      &-time {
        height: 20px;
        margin-left: 5px;
        color: @gray3;
        font-size: 15px;
        font-weight: 400;
        line-height: 20px;
        white-space: nowrap;
        flex: 1;
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
      margin-bottom: 10px;
      overflow: hidden;
    }

    &-flows {
      display: flex;
      justify-content: flex-end;
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

@media screen and (max-width: 640px) {
  .cardunit-bg {
    margin-bottom: 1px;
    border-radius: 0;
    padding: 20px 16px;
  }
}
</style>
