<template>
  <div class="user-header" v-loading="loading">
    <!-- 封面图 -->
    <div class="user-header-cover">
      <!-- 自适应宽高比 -->
      <div class="user-header-cover-pillar" />
      <!-- 图片主体 -->
      <div :style="{ backgroundImage: banner }" class="user-header-cover-main">
        <!-- 更换封面图片 -->
        <!-- <div class="user-header-cover-main-setting">
          <el-tooltip
            class="item"
            effect="dark"
            :content="$t('userProfile.changeBanner')"
            placement="bottom-end"
          >
            <div class="user-header-cover-main-setting-icon" v-if="isMe" @click="updateBanner">
              <span class="mdi mdi-image-area" />
            </div>
          </el-tooltip>
        </div> -->
        <!-- <img :src="banner" alt="cover"> -->
      </div>
      <!-- <ImageUpload
        :aspect-ratio="4"
        :img-upload-done="imgUploadDone"
        :update-type="'album'"
        class="app-icon"
        @done-image-upload="updateBanner"
      /> -->
    </div>
    <!-- 用户信息 -->
    <div class="user-header-info-bg">
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
            {{ creatorInfo.intro || $t('userProfile.noIntroductionYet') }}
          </p>
        </div>
        <div v-if="isMe(address) && isCreator" class="user-header-info-edit">
          <router-link :to="{ name: 'Setting-Creator' }">
            <span class="mdi mdi-cog-outline" />
            {{ $t('setting.settings') }}
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex'
import GeoPattern from 'geopattern'

import Avatar from '@/components/User/Avatar'
// import ImageUpload from '@/components/imgUpload/imgUpload'
import defaultBanner from '@/assets/img/default/myProfileCover.jpg'

export default {
  components: {
    Avatar
    // ImageUpload
  },
  inject: ['routerRefresh'],
  data () {
    return {
      basicLoading: true,
      creatorLoading: true,
      address: '',
      basicInfo: {
        username: '',
        avatar: '',
        address: ''
      },
      creatorInfo: {
        shortname: '',
        intro: '',
        category: '',
        scale: '',
        ticker: {
          name: '',
          ticker: '',
          contract: ''
        },
        items: []
      },
      imgUploadDone: 0,
      banner: defaultBanner,
      primaryColor: ''
    }
  },
  computed: {
    ...mapState({
      myInfo: state => state.user.myInfo,
      themeName: state => state.app.themeName
    }),
    ...mapGetters(['isMe']),
    loading () {
      return this.basicLoading || this.creatorLoading
    },
    isCreator () {
      return Boolean(this.creatorInfo.shortname)
    }
  },
  watch: {
    themeName: {
      handler () {
        this.primaryColor = getComputedStyle(document.getElementById('app')).getPropertyValue('--primary')
      },
      immediate: true
    }
  },
  async mounted () {
    this.initBanner('Likey')
    this.address = await this.getAddress()
    this.initBanner(this.address)
    this.initBasicInfo(this.address)
    this.initAvatar(this.address)
    this.initCreatorInfo(this.address)
  },
  methods: {
    ...mapActions(['getCreatorInfo', 'getAddressByShortname']),
    /** 初始化用户的基础信息 */
    async initBasicInfo (address) {
      if (this.isMe(address)) {
        this.basicInfo.address = address
        this.basicInfo.username = this.myInfo.username
        this.basicInfo.avatar = this.myInfo.avatar
        this.basicLoading = false
        this.pushBasicInfo()
        return
      }
      try {
        const res = await this.$api.gql.getIdByAddress(address)
        this.basicInfo.username = res.data
        this.basicInfo.address = address
        this.basicLoading = false
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
    initBanner (address) {
      const banner = GeoPattern.generate(address).toDataUrl()
      this.banner = banner
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
    async getAddress () {
      if (this.$route.name !== 'User') {
        return await this.getAddressByShortname(this.$route.params.shortname)
      }
      return this.$route.params.id
    },
    async initCreatorInfo (address) {
      this.creatorLoading = true
      try {
        const res = await this.getCreatorInfo(address)
        if (res) this.creatorInfo = res
      } catch (err) {
        console.error('Failed to obtain creator information', err)
        this.$message.error(this.$t('failure.failedToObtainContractStatus'))
      }
      this.creatorLoading = false
    },
    pushBasicInfo () {
      this.$emit('basic-info', this.basicInfo)
    },
    async updateBanner (data) {
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
      display: flex;
      justify-content: center;
      background-size: 35%;

      &-setting {
        margin-top: 15px;
        max-width: 1200px;
        position: absolute;
        box-sizing: border-box;
        width: 100%;
        display: flex;
        justify-content: flex-end;
        padding: 0px 10px;
        &-icon {
          width: fit-content;
          font-size: 16px;
          display: flex;
          align-items: center;
          color: @primary;
          transition: all 0.2s ease;
          border-radius: 6px;
          background-color: #ffffffcd;
          padding: 5px 5px;
          cursor: pointer;
          outline: none;

          &:hover {
            background-color: #ffffff;
          }

          &:active {
            background-color: #ffffff86;
          }

          span {
            font-size: 16px;
            display: flex;
            align-items: center;
            cursor: pointer;
          }
        }
      }

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        user-select: none;
      }
    }
  }

  &-info-bg {
    box-shadow: 0 0 2px 0 #0000001a;
    background: @background;
    width: 100%;
    box-sizing: border-box;
    display: flex;
    justify-content: center;
  }

  &-info {
    width: 100%;
    max-width: 1220px;
    padding: 0 10px 40px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
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
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 1;
        overflow: hidden;
        word-break: break-all;
      }
      p {
        font-size: 18px;
        font-weight: 500;
        color: @dark;
        padding: 0;
        margin: 20px 0 0;
        text-align: center;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 3;
        overflow: hidden;

        overflow-wrap: break-word;
        word-wrap: break-word;
        -ms-word-break: break-all;
        word-break: break-word;
      }
    }

    &-edit  {
      position: absolute;
      right: 20px;
      top: 15px;
      a {
        font-size: 14px;
        text-decoration: none;
        color: @dark;

        &:hover {
          color: @primary;
        }
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

    &-info {
      &-edit  {
        a {
          font-size: 12px;
        }
      }
    }
  }
}
</style>
