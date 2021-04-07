<template>
  <div class="setting" v-loading="initLoading">
    <div v-if="newAuthor" class="setting-header">
      <h3>
        1. {{ $t('setting.creatorSetting') }}
      </h3>
    </div>
    <SettingNav v-else />
    <div class="setting-creator">
      <!-- 头像 -->
      <div class="setting-creator-item">
        <h4>
          {{ $t('setting.avatar') }}
        </h4>
        <div class="setting-creator-item-input">
          <Avatar size="100px" :src="myInfo.avatar" />
        </div>
        <p class="setting-creator-item-desp">
          {{ $t('setting.avatarSettingDesp') }}
          <a href="https://arweave.net/d9SXf_N32hAm3cygt1btmPC-7Dg460VhQEtW8I-cfvU" target="_blank">
            Arweave Avatar
          </a>
        </p>
      </div>
      <!-- 用户名 -->
      <div class="setting-creator-item">
        <h4>
          {{ $t('setting.username') }}
        </h4>
        <h4>
          {{ myInfo.username }}
        </h4>
        <p class="setting-creator-item-desp">
          {{ $t('setting.usernameSettingDesp') }}
          <a href="https://arweave.net/fGUdNmXFmflBMGI2f9vD7KzsrAc1s1USQgQLgAVT0W0" target="_blank">
            Arweave ID
          </a>
        </p>
      </div>
      <!-- 个人主页地址 -->
      <div class="setting-creator-item">
        <h4>
          {{ $t('setting.profileAddress') }}
        </h4>
        <div class="setting-creator-item-input">
          https://likey.arcucy.io/@
          <el-input
            class="address-input"
            v-model="profileAddress"
            :placeholder="$t('setting.profileAddressPlaceholder')"
            :disabled="!newAuthor"
          />
        </div>
        <p class="setting-creator-item-desp">
          {{ $t('setting.canNotBeModified') }}
        </p>
      </div>
      <!-- 简介 -->
      <div class="setting-creator-item">
        <h4>
          {{ $t('setting.introduction') }}
        </h4>
        <div class="setting-creator-item-input">
          <el-input v-model="introduction" :placeholder="$t('setting.introductionPlaceholder')" />
        </div>
      </div>
      <!-- 创作分类 -->
      <div class="setting-creator-item">
        <h4>
          {{ $t('setting.creationCategory') }}
        </h4>
        <div class="setting-creator-item-input">
          <el-select v-model="creationCategory" :placeholder="$t('setting.creationCategoryPlaceholder')">
            <el-option
              v-for="item in creationCategoryOptions"
              :key="item.value"
              :label="$t(item.label)"
              :value="item.value"
            />
          </el-select>
        </div>
      </div>
      <!-- 创作规模 -->
      <div class="setting-creator-item">
        <h4>
          {{ $t('setting.creationScale') }}
        </h4>
        <div class="setting-creator-item-input">
          <el-select v-model="creationScale" :placeholder="$t('setting.creationScalePlaceholder')">
            <el-option
              v-for="item in creationScaleOptions"
              :key="item.value"
              :label="$t(item.label)"
              :value="item.value"
            />
          </el-select>
        </div>
      </div>
      <!-- 提交按钮 -->
      <div class="setting-creator-submit">
        <!-- 下一步 -->
        <el-button
          v-if="newAuthor"
          type="primary"
          :disabled="initLoading"
          @click="nextStep"
        >
          {{ $t('setting.nextStep') }}
        </el-button>
        <!-- 保存 -->
        <el-button
          v-else
          type="primary"
          :loading="submitting"
          :disabled="initLoading"
          @click="save"
        >
          {{ $t('setting.save') }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapState, mapActions } from 'vuex'
import { getCookie } from '@/util/cookie'

import Avatar from '@/components/User/Avatar'
import SettingNav from '@/components/SettingNav'

import CreationCategoryOptions from '@/data/CreationCategoryOptions'

export default {
  name: 'Home',
  components: {
    Avatar,
    SettingNav
  },
  data () {
    return {
      submitting: false,
      profileAddress: '',
      introduction: '',
      creationCategory: '',
      creationScale: '',
      newAuthor: true,
      authorInfoLoading: true,
      creationScaleOptions: [{
        value: 'Personal',
        label: 'setting.personal'
      }, {
        value: 'Team',
        label: 'setting.team'
      }],
      creationCategoryOptions: CreationCategoryOptions
    }
  },
  computed: {
    ...mapGetters(['isLoggedIn']),
    ...mapState({
      myInfo: state => state.user.myInfo,
      myJwk: state => state.user.myJwk,
      creatorFormBackup: state => state.user.creatorFormBackup
    }),
    initLoading () {
      return !this.isLoggedIn || this.authorInfoLoading
    }
  },
  watch: {
    isLoggedIn: {
      handler (val) {
        if (val) this.initFormData()
        else {
          // 对于没有登录的用户，检查 Cookie 中是否有 key，
          // 如果有的话，等待登录完成，没有则直接退回主页。
          const jwk = getCookie('arclight_userkey')
          if (!jwk) {
            this.$message.warning(this.$t('failure.noPermissionToAccessPage'))
            this.$router.push({ name: 'Home' })
          }
        }
      },
      immediate: true
    }
  },
  mounted () {
  },
  methods: {
    ...mapActions(['getCreatorInfo', 'setCreatorFormBackup']),
    /** 初始化表单数据 */
    async initFormData () {
      const res = await this.getCreatorInfo(this.myInfo.address)
      this.authorInfoLoading = false
      if (!res) {
        this.newAuthor = true
        if (this.creatorFormBackup) this.setFormDate(this.creatorFormBackup)
        return
      }
      this.setFormDate(res)
      this.newAuthor = false
    },
    setFormDate (data) {
      this.profileAddress = data.shortname
      this.introduction = data.intro
      this.creationCategory = data.category
      this.creationScale = data.scale
    },
    async save () {
      if (this.validationForm()) return
      this.submitting = true
      const info = await this.getCreatorInfo(this.myInfo.address)
      if (!(info.category === this.creationCategory && info.scale === this.creationScale && info.intro === this.introduction)) {
        const jwk = JSON.parse(this.myJwk)
        await this.$api.contract.updateCreator(jwk, {
          shortname: this.profileAddress,
          intro: this.introduction,
          category: this.creationCategory,
          scale: this.creationScale
        })
      }
      this.$message.success(this.$t('success.success'))
      this.submitting = false
    },
    nextStep () {
      if (this.validationForm()) return
      this.setCreatorFormBackup({
        shortname: this.profileAddress,
        intro: this.introduction,
        category: this.creationCategory,
        scale: this.creationScale
      })
      this.$router.push({ name: 'Setting-Token' })
    },
    validationForm () {
      // 没有登录
      if (!this.myInfo.address) {
        this.$message.warning(this.$t('login.pleaseLogInFirst'))
        return 1
      }

      // 没有头像
      if (!this.myInfo.avatar) {
        this.$message.warning(this.$t('setting.missingAvatar'))
        return 2
      }

      // 没有用户名
      if (!this.myInfo.type || this.myInfo.type === 'Guest' || !this.myInfo.username.trim()) {
        this.$message.warning(this.$t('setting.usernameCanNotBeEmpty'))
        return 8
      }

      // 没有填写主页地址
      if (!this.profileAddress.trim()) {
        this.$message.warning(this.$t('setting.pleaseFillInTheProfileAddress'))
        return 3
      }

      // 主页地址格式错误
      const profileAddressRegular = new RegExp('^[a-zA-Z][a-zA-Z0-9]{4,41}$')
      if (!profileAddressRegular.test(this.profileAddress)) {
        this.$message.warning(this.$t('setting.profileAddressFormatError'))
        return 4
      }

      // 没有填写简介
      if (!this.introduction) {
        this.$message.warning(this.$t('setting.pleaseFillInTheIntroduction'))
        return 5
      }

      // 简介过长
      if (this.introduction.length > 100) {
        this.$message.warning(this.$t('setting.introductionIsTooLong'))
        return 6
      }

      /** 创作类别错误 */
      if (!this.creationCategoryOptions.find(item => item.value === this.creationCategory)) {
        this.$message.warning(this.$t('setting.pleaseSelectACreationCategory'))
        return 7
      }

      /** 创作规模错误 */
      if (!this.creationScaleOptions.find(item => item.value === this.creationScale)) {
        this.$message.warning(this.$t('setting.pleaseSelectACreationScale'))
        return 8
      }

      return 0
    }
  }
}
</script>

<style lang="less" scoped>
.setting {
  margin: 20px auto 60px;
  width: 100%;
  max-width: 820px;
  box-sizing: border-box;
  padding: 0 10px;

  &-header {
    h3 {
      color: @dark;
      margin: 0 0 20px;
      font-size: 18px;
    }
  }

  &-creator {
    background: @background;
    box-shadow: 0 0 2px 0 #0000001a;
    box-sizing: border-box;
    padding: 20px;
    border-radius: 6px;
    overflow: hidden;

    &-item {
      margin: 0 0 40px;

      h4 {
        color: @dark;
        padding: 0;
        margin: 0 0 5px;
        font-size: 16px;
      }

      &-input {
        margin: 0 0 5px;
        font-size: 15px;
        display: flex;
        align-items: center;
        color: @dark;

        .address-input {
          margin-left: 5px;
        }

        /deep/ .el-select {
          display: block;
          flex: 1;
        }
      }

      &-desp {
        color: @gray3;
        padding: 0;
        margin: 0;
        font-size: 14px;
        font-weight: 400;
      }

      a {
        color: @primary;
        cursor: pointer;
        text-decoration: none;
        font-weight: 500;
      }
    }

    &-submit {
      display: flex;
      justify-content: center;
      margin: 0 0 20px;
      button {
        min-width: 130px;
      }
    }
  }
}
</style>
