<template>
  <div class="setting" v-loading="initLoading">
    <SettingNav />
    <div class="setting-creator">
      <!-- 名称 -->
      <div class="setting-creator-item">
        <h4>
          {{ $t('setting.inputName') }}
        </h4>
        <div class="setting-creator-item-input">
          <el-input v-model="name" :placeholder="$t('setting.inputNamePlaceholder')" />
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
          <el-input v-model="ticker" :placeholder="$t('setting.tickerPlaceholder')" />
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
        <!-- 保存 -->
        <el-button
          type="primary"
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
      // solutions: [
      //   {
      //     id: 1,
      //     title: '一个鱼罐头',
      //     value: '10',
      //     description: '给猫咪投喂一天的伙食，解锁养猫攻略和我的有声读物系列',
      //     editing: false
      //   },
      //   {
      //     id: 2,
      //     title: '一箱鱼罐头',
      //     value: '10000',
      //     description: '给猫咪投喂一月的伙食，解锁养猫攻略和我的有声读物系列',
      //     editing: false
      //   }
      // ]
      solutions: [
        {
          id: undefined,
          title: '',
          value: 1,
          description: '',
          editing: true
        }
      ]
    }
  },
  computed: {
    ...mapGetters(['isLoggedIn']),
    ...mapState({
      myInfo: state => state.user.myInfo
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
    ...mapActions(['getCreatorInfo']),
    /** 初始化表单数据 */
    async initFormData () {
      console.log('myInfo:', this.myInfo)
      const res = await this.getCreatorInfo(this.myInfo.address)
      console.log('res1:', res)
      this.authorInfoLoading = false
      if (!res) {
        this.newAuthor = true
        return
      }
      this.newAuthor = false
    },
    save () {
      if (this.validationForm()) return
      console.log('成功')
    },
    validationForm () {
      return 0
    },
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
    editCompleted (item) {
      if (this.editCompletedCanClick(item)) return
      item.editing = false
    },
    isCmptySolution (item) {
      return !(item.id || item.title.trim() || item.value !== 1 || item.description.trim())
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
          color: @dark;
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
