<template>
  <div>
    <el-dialog
      :title="$t('donation.pleaseInputDonationAmount')"
      :visible.sync="dialogVisible"
      :before-close="handleClose"
      width="380px"
      custom-class="donation-dialog"
    >
      <div class="donation-wrapper">
        <div class="donation-container">
          <el-input v-model="input" placeholder="请输入内容" />
          <el-button
            class="donation-confirm-button"
            type="primary"
            block
            :precision="0"
            :min="1"
            :max="9007199254740991"
            @click="step2"
          >
            {{ $t('payment.checkout') }}
          </el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  props: {
    value: {
      type: Boolean,
      required: true
    }
  },
  data () {
    return {
      dialogVisible: this.value,
      input: ''
    }
  },
  watch: {
    value (val) {
      this.dialogVisible = val
    },
    input (val) {
      this.input = String(val).replace(/[^\d]/g, '')
    }
  },
  methods: {
    step2 () {
      if (!this.input) {
        this.$message({
          showClose: true,
          message: this.$t('donation.donationAmountShouldnotBeNone'),
          type: 'error'
        })
      }
      this.$emit('confirm-donation', String(this.input))
    },
    handleClose (done) {
      this.dialogVisible = false
      this.input = ''
      this.$emit('donation-close', false)
      done()
    }
  }
}
</script>

<style lang="less" scoped>
.donation-wrapper {
  .donation-container {
    display: flex;
    flex-direction: column;

    .donation-confirm-button {
      margin-top: 20px
    }
  }
}

/deep/ .donation-dialog {
  border-radius: 6px;
}

@media screen and (max-width: 420px) {
  /deep/ .donation-dialog {
    width: 90% !important;
  }
}

</style>
