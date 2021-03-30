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
          :to="{name: 'Creator', params: { shortname }}"
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
              :to="{name: 'Creator', params: { shortname }}"
            >
              <span class="cardunit-r-header-user-nickname">{{ nickname }}</span>
              <span class="cardunit-r-header-user-shortname"> @{{ shortname }}</span>
            </router-link>
          </p>
          <p class="cardunit-r-header-time">
            •
            {{ createTime }}
          </p>
        </div>
        <!-- 标题 -->
        <h4 class="cardunit-r-title">
          {{ title }}
        </h4>
        <Summary
          v-if="!preview.lockContract && !details"
          :preview="preview"
          @load-more="loadMore"
          :loading="detailsLoading"
        />
        <Locked
          v-else-if="!details"
          :preview="preview"
          @load-more="loadMore"
          :loading="detailsLoading"
        />
        <!-- 正文 -->
        <mainText
          v-if="details"
          class="cardunit-r-content"
          :card="details"
        />
        <!-- 图片 -->
        <a
          v-if="media && media.length > 0"
          class="jump-shield cardtop10"
          href="javascript:;"
        >
          <photoAlbum
            :media="media"
          />
        </a>
        <!-- 统计数据 -->
        <a class="jump-shield" href="javascript:;">
          <div class="cardunit-r-flows">
            <!-- 喜欢 -->
            <div class="cardunit-r-flows-like">
              <i v-if="likeLoading" class="el-icon-loading" />
              <span
                v-else
                class="mdi mdi-currency-usd dynamic-good"
                :class="likeIconClass"
                @click="likeClick"
              />
              <span v-if="flows.donate">
                {{ flows.donate }}
              </span>
              <span v-else>
                赞赏
              </span>
            </div>
            <!-- 分享 -->
            <div class="cardunit-r-flows-share">
              <span
                class="mdi mdi-export-variant dynamic-share"
                @click="copyCode(getShareLink())"
              />
              <span>
                分享
              </span>
            </div>
          </div>
        </a>
      </div>
    </div>
  </router-link>
</template>

<script>
import { mapState } from 'vuex'

import * as momentFun from '@/util/momentFun'
import decode from '@/util/decode'
import { decryptText } from '@/util/encrypt'

import Avatar from '@/components/User/Avatar'
import mainText from './MainText'
import photoAlbum from './PhotoAlbum'
import Summary from './Summary'
import Locked from './Locked'

export default {
  components: {
    Avatar,
    mainText,
    photoAlbum,
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
      detailsLoading: false
    }
  },
  computed: {
    ...mapState({
      appLang: state => state.app.appLang
    }),
    likeIconClass () {
      return {
        'like-touch': !this.likeLoading,
        active: !!this.flows.idonated
      }
    },
    preview () {
      const tags = this.getTags(this.brief.node.tags)
      console.log('tags:', this.brief.node.id, tags)

      return {
        id: this.brief.node.id,
        cursor: this.brief.cursor,
        creator: this.brief.node.owner.address,
        timestamp: tags['Unix-Time'],
        schemaVersion: tags['Schema-Version'],
        title: tags.Title,
        summary: tags.Summary,
        extra: this.strToObj(tags.Extra),
        lockContract: tags['Lock-Contract'] || '',
        lockValue: tags['Lock-Value'] || 0
      }
    },
    card () {
      return null
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
      if (this.card) return this.card.title
      return this.preview.title
    },
    media () {
      return []
      // if (!this.card) return []
      // return this.card.extra.media
    },
    flows () {
      return {
        idonated: false,
        donate: 0
      }
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
  methods: {
    /** 获取头像 */
    async getAvatar () {
      try {
        const address = this.brief.node.owner.address
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
        const address = this.brief.node.owner.address
        const data = await this.$api.gql.getIdByAddress(address)
        this.username = data.data
      } catch (err) {
        this.$message.error(this.$t('failure.getUsername'))
        console.error('getUsername error: ', err)
      }
    },
    /** 获取短链用的名字 */
    async getShortname () {
      const address = this.brief.node.owner.address
      const data = await this.$store.dispatch('getCreatorInfo', address)
      this.selfLoadShortname = data.shortname
    },
    /** 加载更多 */
    async loadMore () {
      if (this.detailsLoading) return
      this.detailsLoading = true
      console.log('开始获取动态详情')
      try {
        const transaction = await this.$api.gql.getTransactionDetail(this.preview.id)
        const data = JSON.parse(decode.uint8ArrayToString(transaction.data))
        if (data.isLock) data.content = this.decryptText(data.content)
        this.details = data
        console.log('动态详情：', this.details)
      } catch (err) {
        this.$message.error(this.$t('failure.getStatusDetails'))
        console.error('loadMore error: ', err)
      }
      this.detailsLoading = false
    },
    /** 推荐 */
    async likeClick () {
      console.log('推荐')
    },
    // 获取分享链接
    getShareLink () {
      return window.location.origin + '/status/' + this.preview.id
    },
    /** 拷贝 */
    copyCode (code) {
      console.log(code)
      this.$copyText(code).then(
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
    }
  }
}
</script>

<style lang="less" scoped>
a {
  color: @dark;
  text-decoration: none;
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

    &-content {
      color: @dark;
      font-size: 15px;
      font-weight: 400;
      line-height: 20px;
      white-space: pre-line;
    }

    .cardtop10 {
      margin-top: 10px;
      overflow: hidden;
    }

    &-flows {
      display: flex;
      justify-content: flex-end;
      margin: 10px 0 0;
      .flow-default {
        font-size: 18px;
        svg {
          height: 18px;
          width: 18px;
          color: @gray3;
          -moz-user-select:none;
          -webkit-user-select:none;
          user-select:none;
        }
        span {
          margin:  0 0 0 5px;
          font-size: 15px;
        }
      }
      .default-hover {
        transition: all ease-in 0.05s;
        cursor: pointer;

        &:hover {
          transform: scale(1.2);
        }

        &:active {
          transform: scale(1);
        }
      }

      &-like {
        .flow-default();
        min-width: 100px;

        svg {
          width: 20px;
        }

        .like-touch {
          -moz-user-select:none;
          -webkit-user-select:none;
          user-select:none;
          transition: all ease-in 0.05s;
          cursor: pointer;

          &:hover {
            transform: scale(1.2);
          }

          &:active {
            transform: scale(1);
          }

          &.active {
            color: #ca8f04;
            transform: scale(1);
            cursor: default;
          }
        }
      }

      &-share {
        .flow-default();
        margin-right: 5px;

        svg {
          .default-hover();
          width: 17px;
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
