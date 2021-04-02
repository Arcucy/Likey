<template>
  <el-dialog
    :title="$t('payment.purchase')"
    :visible.sync="dialogVisible"
    width="380px"
    :before-close="handleClose"
    custom-class="receipt-dialog"
  >
    <div class="solution-purchase">
      <div class="solution-purchase-container">
        <div class="solution-purchase-item">
          <span>{{ $t('payment.creator') }}</span>
          <span>{{ creatorValue | winstonToAr | finalize(loading) }}</span>
        </div>
        <div class="solution-purchase-item">
          <span>{{ $t('payment.developer') }} (~5%)</span>
          <span>{{ developerValue | winstonToAr | finalize(loading) }}</span>
        </div>
        <div class="solution-purchase-item" v-if="receipt.selected">
          <span>{{ $t('payment.holder') }} (~15%)</span>
          <span>{{ holdersValue | winstonToAr | finalize(loading) }}</span>
        </div>
        <div class="solution-purchase-item">
          <span>{{ $t('payment.fee') }}</span>
          <span>{{ feeValue | winstonToAr | finalize(loading) }}</span>
        </div>
        <el-divider />
        <div class="solution-purchase-item">
          <span>{{ $t('payment.total') }}</span>
          <span>{{ totalValue | winstonToAr | finalize(loading) }}</span>
        </div>
      </div>
      <el-button
        type="primary"
        :disabled="loading"
        @click="confirm"
      >
        {{ $t('payment.checkout') }}
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
import BigNumber from 'bignumber.js'

export default {
  props: {
    value: {
      type: Boolean,
      default: false
    },
    receipt: {
      type: Object,
      default: () => {
        return {
          creator: '',
          holders: '',
          developer: '',
          fee: '',
          total: '',
          owner: '',
          selected: ''
        }
      }
    },
    loading: {
      type: Boolean,
      required: true
    }
  },
  data () {
    return {
      dialogVisible: this.value
    }
  },
  computed: {
    creatorValue () {
      if (!this.receipt.creator) return new BigNumber('0')
      return this.receipt.creator.toString()
    },
    holdersValue () {
      if (!this.receipt.holders) return new BigNumber('0')
      if (this.receipt.holders.toString() < 1) return '0'
      return this.receipt.holders.toString()
    },
    developerValue () {
      if (!this.receipt.developer) return new BigNumber('0')
      if (this.receipt.developer.toString() < 1) return '0'
      return this.receipt.developer.toString()
    },
    feeValue () {
      if (!this.receipt.fee) return new BigNumber('0')
      return this.receipt.fee.toString()
    },
    totalValue () {
      if (!this.receipt.total) return new BigNumber('0')
      return this.receipt.total.plus(this.receipt.fee).toString()
    }
  },
  watch: {
    value (val) {
      this.dialogVisible = val
    }
  },
  methods: {
    handleClose (done) {
      this.dialogVisible = false
      this.$emit('input', false)
      this.$emit('dialog-close', true)
      done()
    },
    confirm () {
      this.$emit('confirm', true)
      this.$emit('input', false)
      this.dialogVisible = false
    }
  }
}
</script>

<style lang="less" scoped>
.solution-purchase {
  display: flex;
  flex-direction: column;
  justify-content: center;
  color: @dark;

  &-container {
    margin: 0px 0px 30px;
    display: flex;
    flex-direction: column;
    row-gap: 5px;

    .solution-purchase-item {
      display: flex;
      justify-content: space-between;
    }
  }
}

/deep/ .receipt-dialog {
  border-radius: 6px;
}
</style>
