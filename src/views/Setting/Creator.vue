<template>
  <div class="setting" v-loading="initLoading">
    <div class="setting-header">
      <h3>
        {{ $t('setting.creatorSetting') }}
      </h3>
    </div>
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
          <el-input v-model="profileAddress" :placeholder="$t('setting.profileAddressPlaceholder')" />
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
        <el-button type="primary" :disabled="initLoading">
          {{ $t('setting.nextStep') }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import { getCookie } from '@/util/cookie'
import Avatar from '@/components/User/Avatar'
import CreationCategoryOptions from '@/data/CreationCategoryOptions'

export default {
  name: 'Home',
  components: {
    Avatar
  },
  data () {
    return {
      profileAddress: '',
      introduction: '',
      creationCategory: '',
      creationScale: '',
      creationScaleOptions: [{
        value: 'personal',
        label: 'setting.personal'
      }, {
        value: 'team',
        label: 'setting.team'
      }],
      creationCategoryOptions: CreationCategoryOptions
    }
  },
  computed: {
    ...mapGetters(['isLoggedIn']),
    ...mapState({
      myInfo: state => state.user.myInfo
    }),
    initLoading () {
      return !this.isLoggedIn
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
    /** 初始化表单数据 */
    initFormData () {
      console.log('myInfo:', this.myInfo)
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
        column-gap: 5px;
        color: @dark;

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
