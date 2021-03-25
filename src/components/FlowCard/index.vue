<template>
  <router-link
    class="cardunit-bg"
    :to="{}"
  >
    <!-- 转发标签 -->
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
        <!-- 正文 -->
        <mainText
          class="cardunit-r-content"
          :card="card"
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
import Avatar from '@/components/User/Avatar'
import mainText from './MainText'
import photoAlbum from './PhotoAlbum'

export default {
  components: {
    Avatar,
    mainText,
    photoAlbum
  },
  props: {
    // 卡片数据
    data: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      showHiddenContent: false,
      likeIt: false,
      likeLoading: false
    }
  },
  computed: {
    likeIconClass () {
      return {
        'like-touch': !this.likeLoading,
        active: !!this.flows.idonated
      }
    },
    isTop () {
      return false
    },
    shortname () {
      return 'shortname'
    },
    card () {
      return this.data
    },
    avatarImg () {
      return ''
    },
    nickname () {
      return 'nickname'
    },
    createTime () {
      // if (!this.card) return ''
      // const time = this.moment(this.card.create_time)
      // if (!this.$utils.isNDaysAgo(2, time)) return time.fromNow()
      // else if (!this.$utils.isNDaysAgo(365, time)) return time.format('MMMDo')
      // return time.format('YYYY MMMDo')
      return '16小时前'
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
  methods: {
    /** 推荐 */
    async likeClick () {
      console.log('推荐')
    },
    // 获取分享链接
    getShareLink () {
      return 'test'
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
</style>