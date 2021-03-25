<template>
  <el-dropdown trigger="click" placement="bottom" @command="data => $emit('input', data)">
    <div :class="{ disabled }" class="lock-option-unfold">
      <span v-if="!value" class="mdi mdi-lock-open-outline mdicon" />
      <span v-else class="mdi mdi-lock-outline mdicon" />
    </div>
    <el-dropdown-menu slot="dropdown">
      <!-- 所有人可见 -->
      <el-dropdown-item
        class="lock-option-item"
        :class="!value && 'active'"
        :command="null"
      >
        {{ $t('statusInput.everyoneCanSee') }}
      </el-dropdown-item>
      <!-- 所有持仓者可见 -->
      <el-dropdown-item
        class="lock-option-item"
        :class="value && value.all && 'active'"
        :command="{ all: true }"
      >
        {{ $t('statusInput.allSponsors') }}
      </el-dropdown-item>
      <!-- 解锁档位列表 -->
      <el-dropdown-item
        v-for="(item, index) of optionList"
        :key="index"
        class="lock-option-item"
        :class="value && value.id === item.id && 'active'"
        :command="{ ...item }"
      >
        {{ item.label }}
      </el-dropdown-item>
    </el-dropdown-menu>
  </el-dropdown>
</template>

<script>
import { mapState } from 'vuex'

export default {
  props: {
    value: {
      type: Object,
      default: null
    },
    /** 禁用 */
    disabled: {
      type: Boolean,
      default: false
    },
    address: {
      type: String,
      required: true
    }
  },
  data () {
    return {
    }
  },
  computed: {
    ...mapState({
      creators: state => state.contract.creators
    }),
    creator () {
      return this.creators ? this.creators[this.address] : null
    },
    optionList () {
      if (!this.creator) return []
      const ticker = this.creator.ticker.ticker
      return this.creator.items.map(item => {
        return {
          ...item,
          label: `${this.$t('statusInput.ownNUnlock', [item.value, ticker])} - ${item.title}`
        }
      })
    }
  },
  mounted () {
  },
  methods: {
  }
}
</script>

<style lang="less" scoped>
.lock-option-unfold {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  cursor: pointer;

  .mdicon {
    display: block;
    margin-top: 2px;
    font-size: 22px;
    color: @gray3;
    cursor: pointer;
  }

  &:hover {
    background-color: @primary-light;
    .mdicon { color: @primary; }
  }

  &:active {
    background-color: @primary-dark;
    .mdicon { color: @primary; }
  }

  &.disabled {
    background-color: #00000000;
    cursor: not-allowed;

    .mdicon {
      color: @gray2;
      cursor: not-allowed;
    }
  }
}

.lock-option-item {
  max-width: 270px;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  overflow: hidden;
  word-break: break-all;
  white-space: normal;

  &.active {
    background: #f5f7fa;
    color: #23a1d7;
  }
}
</style>
