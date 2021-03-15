<template>
  <div class="user-header" v-loading="loading">
    <!-- 封面图 -->
    <div class="user-header-cover">
      <!-- 自适应宽高比 -->
      <div class="user-header-cover-pillar" />
      <!-- 图片主体 -->
      <div class="user-header-cover-main">
        <img src="@/assets/img/default/myProfileCover.jpg" alt="cover">
      </div>
    </div>
    <!-- 用户信息 -->
    <div class="user-header-info">
      <div class="user-header-info-avatar">
        <div class="avatar-ring">
          <Avatar size="120px" :src="basicInfo.avatar" />
        </div>
      </div>
      <div class="user-header-info-text">
        <h3>
          {{ basicInfo.username }}
        </h3>
        <p>
          {{ creatorInfo.introduction || $t('userProfile.noIntroductionYet') }}
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import Avatar from '@/components/User/Avatar'

export default {
  components: {
    Avatar
  },
  inject: ['routerRefresh'],
  data () {
    return {
      loading: true,
      basicInfo: {
        username: '',
        avatar: '',
        address: ''
      },
      creatorInfo: {
        introduction: ''
      }
    }
  },
  computed: {
    ...mapState({
      myInfo: state => state.user.myInfo
    }),
    ...mapGetters(['isMe'])
  },
  watch: {
  },
  mounted () {
    const address = this.$route.params.id
    this.initBasicInfo(address)
    this.initAvatar(address)
  },
  methods: {
    /** 初始化用户的基础信息 */
    async initBasicInfo (address) {
      if (this.isMe(address)) {
        this.basicInfo.address = address
        this.basicInfo.username = this.myInfo.username
        this.basicInfo.avatar = this.myInfo.avatar
        this.loading = false
        this.pushBasicInfo()
        return
      }
      try {
        const res = await this.$api.gql.getIdByAddress(address)
        this.basicInfo.username = res.data
        this.basicInfo.address = address
        this.loading = false
        this.pushBasicInfo()
      } catch (err) {
        // 错误处理
        if (err.message.startsWith('timeout')) {
          // 获取用户名超时
          this.$message.error(this.$t('failure.connectionTimedOut'))
          return false
        }
        // 其他错误
        console.warn('uncaught error: ' + err)
        this.$message.error(this.$t('failure.unknownErrorCausedLoadingFailure'))
      }
    },
    /** 初始化获取头像 */
    async initAvatar (address) {
      try {
        const data = await this.$api.gql.getAvatarByAddress(address)
        this.basicInfo.avatar = data
        this.pushBasicInfo()
      } catch (err) {
        if (err.message.startsWith('timeout')) {
          this.$message.error(this.$t('failure.gettingAvatarTimeout'))
          return
        }
        console.warn('uncaught error: ' + err)
        this.$message.error(this.$t('failure.unknownErrorCausedLoadingFailure'))
      }
    },
    pushBasicInfo () {
      this.$emit('basic-info', this.basicInfo)
    }
  }
}
</script>

<style lang="less" scoped>
.user-header {
  &-cover {
    position: relative;
    width: 100%;

    &-pillar {
      padding-bottom: 22.18%;
    }

    &-main {
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
      overflow: hidden;
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
  }

  &-info {
    width: 100%;
    background: @background;
    padding: 0 10px 40px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    align-items: center;
    box-shadow: 0 0 2px 0 #0000001a;
    &-avatar {
      margin-top: -64px;
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1;

      .avatar-ring {
        background: @background;
        border-radius: 50%;
        width: 128px;
        height: 128px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid @primary;
        box-sizing: border-box;
      }
    }
    &-text {
      h3 {
        font-size: 24px;
        font-weight: 700;
        color: @dark;
        margin: 20px 0 0;
        padding: 0;
        text-align: center;
      }
      p {
        font-size: 18px;
        font-weight: 500;
        color: @dark;
        padding: 0;
        margin: 20px 0 0;
        text-align: center;
      }
    }
  }
}

@media screen and (max-width: 640px) {
  .user-header {
    &-cover {
      &-pillar {
        padding-bottom: 42.85%;
      }
    }
  }
}
</style>
