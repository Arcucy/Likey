<template>
  <div class="solutions">
    <div v-for="(item, index) of items" class="solution" :key="index">
      <div class="solution-price">
        {{ $t('setting.ownBalance') }}
        <span class="solution-price-value">
          {{ item.value }}
        </span>
        <span class="solution-price-suffix">
          {{ ticker || 'PST' }}/{{ $t('setting.unlock') }}
        </span>
      </div>
      <p class="solution-title">
        {{ item.title }}
      </p>
      <p class="solution-desp">
        {{ item.description }}
      </p>
      <div class="solution-unlock">
        <span class="solution-unlock-status">
          <span class="mdi mdi-lock" />
          <span class="mdi mdi-lock-open" />
          Locked
        </span>
        <el-button class="solution-unlock-btn" type="primary" @click="buyUnlockSolution(item, index)">
          AR${{ item.value }}
        </el-button>
      </div>
    </div>

    <!-- 自定义购买量 -->
    <div class="solution">
      <div class="solution-price">
        <el-input-number
          class="solution-price-input"
          v-model="customPstInput"
          controls-position="right"
          size="small"
          :precision="0"
          :min="1"
          :max="9007199254740991"
        />
        <span class="solution-price-suffix">
          {{ ticker || 'PST' }}
        </span>
      </div>
      <p style="line-height: normal;" class="solution-title">
        自定义
      </p>
      <p class="solution-desp">
        本方案可自定义 PST 购买数量
      </p>
      <div class="solution-unlock">
        <span class="solution-unlock-status" />
        <el-button class="solution-unlock-btn" type="primary" @click="buyCustomSolution(customPstInput)">
          AR${{ customPstInput }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<script>
import Bignumber from 'bignumber.js'
import { mapState } from 'vuex'

export default {
  components: {
  },
  props: {
    address: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      customPstInput: 1,
      ratio: ''
    }
  },
  computed: {
    ...mapState({
      creators: state => state.contract.creators
    }),
    creator () {
      return this.creators ? this.creators[this.address] : null
    },
    ticker () {
      if (!this.creator) return ''
      return this.creator.ticker.ticker
    },
    name () {
      if (!this.creator) return ''
      return this.creator.ticker.name
    },
    items () {
      if (!this.creator) return []
      return [
        {
          title: '1',
          value: '100',
          description: 'This 1'
        }
      ]
    }
  },
  watch: {
  },
  async mounted () {
    this.initContractInfo()
  },
  methods: {
    buyUnlockSolution (item, index) {
      console.log('购买解锁方案', item, index)
    },
    buyCustomSolution (value) {
      console.log('购买自定义方案', value)
    },
    async initContractInfo () {
      this.convertPSTToAR()
      this.contractState = await this.$api.contract.readLikeyCreatorPSTContract(this.creator.ticker.contract)
      console.log(this.contractState)
    },
    convertPSTToAR (value) {
      console.log(this.getRatio('1:2'))
      return value
    },
    getRatio (ratio) {
      if (!/1:\d+\.?\d+(?!\d+)/.test(ratio)) {
        return { from: '1', to: '0' }
      }
      let from = 1
      let to = parseFloat(ratio.split(':').pop())
      let iteration = 0

      while (true) {
        if (!Number.isInteger(to)) {
          to = to * 10
          iteration++
          continue
        }
        break
      }

      for (let i = 0; i < iteration; i++) {
        from = Bignumber(from).multiplyBy(10)
      }
      to = Bignumber(to)
      return { from, to }
    }
  }
}
</script>

<style lang="less" scoped>
.solutions {
  display: flex;
  flex-direction: column;
}
.solution {
  overflow: hidden;
  background: @background;
  box-shadow: 0 0 2px 0 #0000001a;
  box-sizing: border-box;
  border-radius: 6px;
  padding: 20px;
  margin: 0 0 20px;

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

    &-input {
      margin: 0 5px 0 0;
      font-size: 15px;
      /deep/ input {
        font-size: 16px;
        border-radius: 6px;
        font-weight: 500;
        &:focus {
          color: @primary
        }
      }
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
    margin: 0 0 5px;
  }

  &-unlock {
    display: flex;
    align-items: center;
    user-select: none;
    margin: 10px 0 0;

    &-status {
      flex: 1;
      .mdi-lock-open {
        display: none;
      }
      .mdi-lock {
        display: inline;
      }
    }

    &-btn {
      min-width: 130px;
      border-radius: 6px;
    }

    &:hover {
      .solution-unlock-status {
        .mdi-lock-open {
          display: inline;
        }
        .mdi-lock {
          display: none;
        }
      }
    }
  }

}
</style>