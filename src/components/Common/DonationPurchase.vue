<template>
  <div>
    <el-dialog
      :title="$t('donation.donateToCreator')"
      :visible.sync="dialogVisible"
      :before-close="handleClose"
      width="380px"
      custom-class="donation-dialog"
    >
      <div class="donation-wrapper">
        <div class="donation-container">
          <div class="donation-container-input">
            <el-input v-model="arInput" class="donation-container-input-input" :placeholder="$t('donation.pleaseInputDonationAmount')" />
            <span class="donation-container-input-ar"> AR</span>
          </div>
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
  computed: {
    arInput: {
      /** 输入过滤 */
      set (val) {
        // 过滤 不是数字或小数点 或者 正常小数结构结束后的小数点和数字 或者 连续重复出现的小数点 的结果
        this.input = val.replace(/([^0-9.])|((?<=(\d+)?\.\d+)\.+(.+)?)|((?<=\.)\.+)/g, '')
      },
      get () {
        return this.input
      }
    }
  },
  watch: {
    value (val) {
      this.dialogVisible = val
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
        return
      }
      if (!/^[0-9]+(\.[0-9]{0,11})?$/.test(this.input)) {
        this.$message({
          showClose: true,
          message: this.$t('donation.pleaseInputValidDonationAmount'),
          type: 'error'
        })
        return
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

    &-input {
      display: flex;
      align-items: center;
      &-ar {
        margin-left: 20px;
        font-size: 18px;
        font-weight: 500;
        white-space: nowrap;
      }
    }

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
