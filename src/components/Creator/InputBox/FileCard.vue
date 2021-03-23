<template>
  <div class="filecard">
    <div class="filecard-icon">
      <span class="mdi mdi-file-outline" />
    </div>
    <div class="filecard-main">
      <div class="filecard-main-head">
        <p class="filecard-main-head-name">
          {{ file.name }}
        </p>
        <span class="mdi mdi-close-thick filecard-main-head-close" @click="$emit('remove-file')" />
      </div>
      <div class="filecard-main-info">
        <p class="filecard-main-info-size">
          {{ fileSize }}
        </p>
        <p class="filecard-main-info-download">
          {{ $t('statusInput.download') }}
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import FileUtil from '@/util/file'

export default {
  components: {
  },
  props: {
    file: {
      type: Object,
      default: () => {
        return {
          data: null,
          name: '',
          size: 0,
          type: ''
        }
      }
    }
  },
  data () {
    return {
    }
  },
  computed: {
    fileSize () {
      if (!this.file) return ''
      return FileUtil.formatBytes(this.file.size, 2)
    }
  },
  watch: {
  },
  methods: {
  }
}
</script>

<style lang="less" scoped>
.filecard {
  overflow: hidden;
  border: 1px solid @gray2;
  box-sizing: border-box;
  border-radius: 6px;
  padding: 10px;
  display: flex;
  margin-bottom: 10px;

  &-icon {
    @side-length: 42px;
    width: @side-length;
    height: @side-length;
    min-width: @side-length;
    min-height: @side-length;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-right: 10px;

    span {
      font-size: 38px;
      color: @dark;
      height: @side-length;
      width: @side-length;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }

  &-main {
    flex: 1;

    &-head {
      display: flex;
      margin: 0 0 5px;

      &-name {
        flex: 1;
        font-size: 15px;
        color: @dark;
        margin: 0;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 1;
        overflow: hidden;
        word-break: break-all;
      }

      &-close {
        font-size: 18px;
        color: @gray3;
        width: 20px;
        height: 20px;
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 6px;
        margin: 0 0 0 5px;
        cursor: pointer;

        &:hover {
          color: @primary;
          background: @primary-light;
        }

        &:active {
          color: @primary;
          background: @primary-dark;
        }
      }
    }

    &-info {
      display: flex;
      justify-content: space-between;

      p {
        font-size: 12px;
        color: @gray3;
        margin: 0;
      }
    }
  }
}
</style>
