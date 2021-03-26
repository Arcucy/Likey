<template>
  <el-dialog
    title="提示"
    :visible.sync="dialogVisible"
    width="30%"
    :before-close="handleClose"
  >
    <div class="solution-purchase">
      <div class="solution-purchase-container">
        <div class="solution-purchase-item">
          <span>Creator</span>
          <span>0.008 AR</span>
        </div>
        <div class="solution-purchase-item">
          <span>Developers (~5%)</span>
          <span>0.0005 AR</span>
        </div>
        <div class="solution-purchase-item">
          <span>Holders (~15%)</span>
          <span>0.0015 AR</span>
        </div>
        <div class="solution-purchase-item">
          <span>Fee</span>
          <span>0.0015 AR</span>
        </div>
        <el-divider />
        <div class="solution-purchase-item">
          <span>Total</span>
          <span>0.01 AR</span>
        </div>
      </div>
      <el-button
        type="primary"
        @click="dialogVisible = false"
      >
        确 定
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
export default {
  props: {
    value: {
      type: Boolean,
      default: true
    }
  },
  data () {
    return {
      dialogVisible: this.value
    }
  },
  methods: {
    handleClose () {
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
</style>
