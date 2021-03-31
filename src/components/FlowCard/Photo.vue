<template>
  <el-image
    v-if="src !== 'loading'"
    :src="src"
    alt="image"
    :preview-src-list="previewSrcList"
    fit="cover"
    lazy
  >
    <div slot="placeholder" class="image-slot">
      <i class="el-icon-loading" />
    </div>
    <div slot="error" class="image-slot">
      <span class="mdi mdi-image-off image-slot-icon" />
    </div>
  </el-image>
  <div v-else slot="placeholder" class="image-slot">
    <i class="el-icon-loading image-slot-loading" />
  </div>
</template>

<script>
// import decode from '@/util/decode'

export default {
  components: {
  },
  props: {
    // 图片
    src: {
      type: String,
      default: ''
    },
    previewSrcList: {
      type: Array,
      default: undefined
    }
  }
}
</script>

<style lang="less" scoped>
img {
  object-fit: cover;
  width: 100%;
  height: 100%;
}

.el-image {
  width: 100%;
  height: 100%;
}

.image-slot {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: @light;
  background: @background-dark;

  &-icon {
    font-size: 24px;
    height: 30px;
    width: 30px;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 5px;
  }

  &-loading {
    color: @light;
    font-size: 24px;
  }
}
</style>
