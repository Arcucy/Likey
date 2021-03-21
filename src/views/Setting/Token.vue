<template>
  <div
    class="setting"
    v-loading="initLoading || submitting"
    :element-loading-text="submitTips"
  >
    <div v-if="newAuthor" class="setting-header">
      <h3>
        2. {{ $t('setting.tokenSettings') }}
      </h3>
    </div>
    <SettingNav v-else />
    <div class="setting-creator">
      <!-- 名称 -->
      <div class="setting-creator-item">
        <h4>
          {{ $t('setting.inputName') }}
        </h4>
        <div class="setting-creator-item-input">
          <el-input v-model="name" :placeholder="$t('setting.inputNamePlaceholder')" :disabled="!newAuthor" />
        </div>
        <p class="setting-creator-item-desp">
          {{ $t('setting.canNotBeModified') }}
        </p>
      </div>
      <!-- 缩写 -->
      <div class="setting-creator-item">
        <h4>
          {{ $t('setting.ticker') }}
        </h4>
        <div class="setting-creator-item-input">
          <el-input v-model="tickerInput" :placeholder="$t('setting.tickerPlaceholder')" :disabled="!newAuthor" />
        </div>
        <p class="setting-creator-item-desp">
          {{ $t('setting.canNotBeModified') }}
        </p>
      </div>

      <!-- 解锁方案 -->
      <div class="setting-creator-item">
        <h4>
          {{ $t('setting.unlockPlan') + ` (${solutions.length}/${solutionMaximum})` }}
        </h4>
        <!-- 方案列表 -->
        <div class="setting-creator-item-plans">
          <div v-for="(item, index) of solutions" :key="index" class="plans-item">
            <!-- 方案预览模式 -->
            <div v-if="!item.editing" class="plans-item-show">
              <div class="plans-item-show-price">
                {{ $t('setting.ownBalance') }}
                <span class="plans-item-show-price-value">
                  {{ item.value }}
                </span>
                <span class="plans-item-show-price-suffix">
                  {{ ticker || 'PST' }}/{{ $t('setting.unlock') }}
                </span>
                <div class="plans-item-show-price-control">
                  <span class="mdi mdi-pencil" @click="item.editing = true" />
                  <span class="mdi mdi-close-thick" @click="removeSolution(index)" />
                </div>
              </div>
              <p class="plans-item-show-title">
                {{ item.title }}
              </p>
              <p class="plans-item-show-desp">
                {{ item.description }}
              </p>
            </div>
            <!-- 方案编辑模式 -->
            <div v-else class="plans-item-edit">
              <!-- 方案价格 -->
              <div class="plans-item-edit-price">
                {{ $t('setting.ownBalance') }}
                <el-input-number
                  class="plans-item-edit-price-input"
                  v-model="item.value"
                  controls-position="right"
                  size="small"
                  :precision="0"
                  :min="1"
                  :max="9007199254740991"
                />
                <span class="plans-item-edit-price-suffix">
                  {{ ticker || 'PST' }}/{{ $t('setting.unlock') }}
                </span>
                <div class="plans-item-edit-price-control">
                  <span class="mdi mdi-close-thick" @click="removeSolution(index)" />
                </div>
              </div>
              <!-- 方案名称 -->
              <div class="plans-item-edit-title">
                <el-input v-model="item.title" size="small" :placeholder="$t('setting.solutionName')" />
              </div>
              <!-- 方案介绍 -->
              <div class="plans-item-edit-desp">
                <el-input
                  v-model="item.description"
                  type="textarea"
                  size="small"
                  :autosize="{ minRows: 4, maxRows: 20 }"
                  :maxlength="400"
                  show-word-limit
                  :placeholder="$t('setting.solutionIntroduction')"
                />
              </div>
              <div class="plans-item-edit-btn">
                <el-button
                  type="primary"
                  size="medium"
                  :disabled="!!editCompletedCanClick(item)"
                  @click="editCompleted(item)"
                >
                  {{ $t('setting.endEdit') }}
                </el-button>
              </div>
            </div>
          </div>
          <div v-if="solutions.length < solutionMaximum" class="setting-creator-item-plans-add">
            <el-button @click="addSolution">
              {{ $t('setting.addSolution') }}
            </el-button>
          </div>
        </div>
      </div>
      <!-- 提交按钮 -->
      <div class="setting-creator-submit">
        <!-- 上一步 -->
        <el-button
          v-if="newAuthor"
          :disabled="initLoading || submitting"
          @click="previous"
        >
          {{ $t('setting.previous') }}
        </el-button>
        <!-- 保存 -->
        <el-button
          type="primary"
          :disabled="initLoading || submitting"
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

import SettingNav from '@/components/SettingNav'

export default {
  name: 'Home',
  components: {
    SettingNav
  },
  data () {
    return {
      newAuthor: true,
      authorInfoLoading: true,
      name: '',
      ticker: '',
      solutionMaximum: 20,
      solutions: [
        {
          id: undefined,
          title: '',
          value: 1,
          description: '',
          editing: true
        }
      ],
      submitting: false
    }
  },
  computed: {
    ...mapGetters(['isLoggedIn']),
    ...mapState({
      myInfo: state => state.user.myInfo,
      myJwk: state => state.user.myJwk,
      creatorFormBackup: state => state.user.creatorFormBackup,
      tokenFormBackup: state => state.user.tokenFormBackup
    }),
    initLoading () {
      return !this.isLoggedIn || this.authorInfoLoading
    },
    tickerInput: {
      /** 输入过滤 */
      set (val) {
        this.ticker = val.replace(/[^a-zA-Z]/g, '').toUpperCase()
      },
      get () {
        return this.ticker
      }
    },
    submitTips () {
      return this.submitting ? this.$t('setting.submittingPleaseDoNotCloseThePage') : ''
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
    ...mapActions(['getCreatorInfo', 'setTokenFormBackup']),
    /** 初始化表单数据 */
    async initFormData () {
      const res = await this.getCreatorInfo(this.myInfo.address)
      console.log('res1:', res)
      this.authorInfoLoading = false
      if (!res) {
        this.newAuthor = true
        if (this.tokenFormBackup) {
          this.name = this.tokenFormBackup.name
          this.ticker = this.tokenFormBackup.ticker
          this.solutions = this.tokenFormBackup.items
        }
        return
      }
      this.name = res.ticker.name
      this.ticker = res.ticker.ticker
      if (res.items && res.items.length > 0) {
        this.solutions = res.items.map(item => {
          return {
            ...item,
            editing: false
          }
        })
      }
      this.newAuthor = false
    },
    /** 保存表单 */
    save () {
      if (!this.isLoggedIn) return
      if (this.validationForm()) return
      // 新来的调用创建创作者方法，已经是创作者的调用编辑方法
      this.submitting = true
      if (this.newAuthor) this.cceateCreator()
      else this.editCreator()
    },
    /** 编辑创作者 */
    editCreator () {
      console.log('编辑')
      this.submitting = false
    },
    /** 创建创作者 */
    async cceateCreator () {
      console.log('创建')
      if (!this.creatorFormBackup) {
        this.$message.warning(this.$t('setting.pleaseReturnToThePreviousStepToFillInTheCreatorForm'))
        return false
      }
      const jwk = JSON.parse(this.myJwk)
      const pstAddress = 'A4LCIVue3lxOR1ua_P2zMs_0B9Evsaypk3iNjsft8m0'
      // 上传表单。依次为：创作者表单，代币名称和简写，解锁方案列表
      try {
        const res = await this.$api.contract.announceCreator(jwk, {
          ...this.creatorFormBackup
        }, {
          name: this.name,
          ticker: this.ticker,
          contract: pstAddress
        }, this.solutions.filter(item => !item.editor).map(item => {
          return {
            title: item.title,
            value: String(item.value),
            description: item.description
          }
        }))
        this.submitting = false
        console.log('创建创作者完成：', res)
        if (res.type !== 'ok') {
          console.error('Save failed, res:', res)
          this.$message.warning(this.$t('failure.saveFailed'))
        } else {
          this.$alert(this.$t('setting.createSuccessfulAlertContent'), this.$t('success.created'), {
            confirmButtonText: this.$t('setting.ok'),
            callback: () => {
              this.$router.push({ name: 'User', params: { id: this.myInfo.address } })
            }
          })
        }
      } catch (err) {
        console.error('Save failed, error:', err)
        this.submitting = false
        this.$message.warning(this.$t('failure.saveFailed'))
      }
    },
    /** 表单校验 */
    validationForm () {
      if (!this.name) {
        this.$message.warning(this.$t('setting.nameShouldNotBeEmpty'))
        return 1
      }
      if (!this.name.length >= 100) {
        this.$message.warning(this.$t('setting.theLengthOfThisNameIsTooLong'))
        return 2
      }
      if (!this.ticker) {
        this.$message.warning(this.$t('setting.tickerShouldNotBeEmpty'))
        return 3
      }
      if (!this.ticker.length >= 20) {
        this.$message.warning(this.$t('setting.tickerShouldNotBeEmpty'))
        return 4
      }
      if (this.solutions.find(item => item.editing && !this.isCmptySolution(item))) {
        this.$message.warning(this.$t('setting.solutionEditingHasNotCompletedYet'))
        return 5
      }
      return 0
    },
    /** 添加一个解锁方案 */
    addSolution () {
      if (this.solutions.length >= this.solutionMaximum) return
      this.solutions.push({
        id: undefined,
        title: '',
        value: 0,
        description: '',
        editing: true
      })
    },
    /** 移除一个解锁方案 */
    removeSolution (index) {
      if (this.isCmptySolution(this.solutions[index] || {})) {
        this.solutions.splice(index, 1)
        return
      }

      this.$confirm(this.$t('setting.areYouSureYouWantToDelete'), this.$t('setting.warning'), {
        confirmButtonText: this.$t('setting.ok'),
        cancelButtonText: this.$t('setting.cancel'),
        type: 'warning'
      }).then(() => {
        this.solutions.splice(index, 1)
      })
    },
    /** 解锁方案子表单校验 */
    editCompletedCanClick (item) {
      // 没有标题
      if (!item.title.trim()) {
        return 1
      }
      // 标题太长
      if (item.title.trim().length > 100) {
        return 2
      }
      // PST 数量不合法
      if (item.value <= 0 || isNaN(item.value)) {
        return 3
      }
      // 没有介绍
      if (!item.description.trim()) {
        return 4
      }
      // 介绍太长
      if (!item.description.trim().length > 400) {
        return 5
      }
      return 0
    },
    /** 编辑完成 */
    editCompleted (item) {
      if (this.editCompletedCanClick(item)) return
      item.editing = false
    },
    /** 是空的解锁方案表单 */
    isCmptySolution (item) {
      return !(item.id || item.title.trim() || item.value !== 1 || item.description.trim())
    },
    /** 返回上一步 */
    previous () {
      this.setTokenFormBackup({
        name: this.name,
        ticker: this.ticker,
        items: this.solutions
      })
      this.$router.push({ name: 'Setting-Creator' })
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

      &-plans {
        margin: 0 0 0;

        &-add {
          button {
            display: block;
            width: 100%;
            border-color: @gray2;
          }
        }
      }
    }

    &-submit {
      display: flex;
      justify-content: center;
      margin: 0 0 20px;
      column-gap: 20px;
      button {
        min-width: 130px;
      }
    }
  }

  .plans-item {
    border: 1px solid @gray2;
    box-sizing: border-box;
    overflow: hidden;
    border-radius: 6px;
    padding: 10px;
    margin: 0 0 10px;
    &-show {
      &-price {
        font-size: 24px;
        font-weight: 500;
        color: @gray3;
        padding: 0;
        margin: 0 0 5px;
        display: flex;
        align-items: flex-start;
        white-space:nowrap;
        &-value {
          color: @primary;
          padding: 0;
          margin: 0 5px 0 5px;
          white-space: normal;
          word-break: break-all;
        }
        &-suffix {
          color: @gray3;
          font-size: 14px;
          line-height: 29px;
          padding: 0;
          margin: 0;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 1;
          overflow: hidden;
          word-break: break-all;
          white-space: normal;
          align-self: flex-end;
          flex: 1;
        }

        &-control {
          display: flex;
          justify-content: flex-end;
          column-gap: 5px;
          span {
            font-size: 24px;
            color: @gray3;
            display: inline-flex;
            width: 34px;
            height: 34px;
            min-width: 34px;
            min-height: 34px;
            justify-content: center;
            align-items: center;
            cursor: pointer;
            overflow: hidden;
            border-radius: 6px;
            background: @background;
            &:hover {
              color: @primary;
              background: @gray1;
            }
          }
        }
      }

      &-title {
        font-size: 15px;
        padding: 0;
        margin: 0 0 5px;
        font-weight: 500;
      }

      &-desp {
        font-size: 14px;
        padding: 0;
        margin: 0;
      }
    }

    &-edit {

      &-price {
        font-size: 24px;
        font-weight: 500;
        color: @gray3;
        padding: 0;
        margin: 0 0 5px;
        display: flex;
        align-items: flex-start;
        white-space:nowrap;
        &-input {
          margin: 0 5px 0 5px;
        }
        &-suffix {
          color: @gray3;
          font-size: 14px;
          line-height: 29px;
          padding: 0;
          margin: 0;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 1;
          overflow: hidden;
          word-break: break-all;
          white-space: normal;
          align-self: flex-end;
          flex: 1;
        }

        &-control {
          display: flex;
          justify-content: flex-end;
          column-gap: 5px;
          span {
            font-size: 24px;
            color: @gray3;
            display: inline-flex;
            width: 34px;
            height: 34px;
            min-width: 34px;
            min-height: 34px;
            justify-content: center;
            align-items: center;
            cursor: pointer;
            overflow: hidden;
            border-radius: 6px;
            background: @background;
            &:hover {
              color: @primary;
              background: @gray1;
            }
          }
        }
      }

      &-title {
        margin: 0 0 5px;
      }

      &-desp {
        margin: 0 0 10px;
      }

      &-btn {
        margin: 0;
      }
    }
  }
}
</style>
