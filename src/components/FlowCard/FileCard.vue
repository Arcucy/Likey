<template>
  <div class="filecard" :class="!loading && 'clickable'" @click="download">
    <div class="filecard-icon">
      <span v-if="!loading" class="mdi mdi-file-outline" />
      <span v-else class="mdi mdi-download" />
    </div>
    <div class="filecard-main">
      <div class="filecard-main-head">
        <p class="filecard-main-head-name">
          {{ file.name }}
        </p>
        <span v-if="loading" class="mdi mdi-close-thick filecard-main-head-close" @click.stop="close" />
      </div>
      <div v-if="!loading" class="filecard-main-info">
        <p class="filecard-main-info-size">
          {{ fileSize }}
        </p>
        <p class="filecard-main-info-download">
          {{ $t('statusInput.download') }}
        </p>
      </div>
      <div v-else class="filecard-main-info">
        <p>
          {{ $t('flowCard.downloading') }}
        </p>
        <p>
          {{ progress }}%
        </p>
      </div>
      <el-progress v-if="loading" :percentage="progress" :show-text="false" />
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import Axios from 'axios'
import FileUtil from '@/util/file'

export default {
  components: {
  },
  props: {
    file: {
      type: Object,
      required: true
    },
    isEncrypt: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      src: '',
      progress: 0,
      loading: false,
      cancelToken: null
    }
  },
  computed: {
    ...mapState({
      themeName: state => state.app.themeName
    }),
    fileSize () {
      if (!this.file) return ''
      return FileUtil.formatBytes(this.file.size, 2)
    }
  },
  watch: {
  },
  destroyed () {
    const url = window.URL || window.webkitURL
    url.revokeObjectURL(this.src)
  },
  methods: {
    async getFile () {
      if (this.loading) return ''
      this.loading = true
      this.progress = 0
      let res = ''
      try {
        this.cancelToken = Axios.CancelToken.source()
        res = await this.$api.gql.getFile(this.file.id, this.isEncrypt, this.cancelToken.token, pct => { this.progress = pct })
      } catch (err) {
        if (err.message !== 'closeDownload') {
          console.error(JSON.stringify(err))
          this.$message.error(this.$t('failure.download'))
        }
      }
      this.cancelToken = null
      this.loading = false
      return res
    },
    async download () {
      if (!this.src) {
        const src = await this.getFile()
        if (!src) return
        this.src = src
      }

      // 创建下载用的 a 标签
      const div = document.getElementById('app')
      const a = document.createElement('a')
      a.href = this.src
      a.download = this.file.name
      a.id = 'file-' + this.file.id
      div.appendChild(a)
      // 获取并点击创建的 a 标签
      const downloadA = document.getElementById('file-' + this.file.id)
      downloadA.click()
      // 删除 a 标签
      div.removeChild(a)
      // 提示下载成功
      this.$notify({
        duration: 6000,
        type: 'success',
        title: `${this.$t('flowCard.downloaded')}: ${this.file.name}`,
        dangerouslyUseHTMLString: true,
        message: `<span class="transaction-message-text">
        ${this.$t('flowCard.ifYourDownloadDidnotStarted')}
          <a
            class="${this.themeName}-theme transaction-message-id"
            href="${this.src}"
            download="${this.file.name}"
          >
            ${this.$t('flowCard.clickHere')}
          </a>
        <span>`
      })
    },
    async close () {
      if (this.cancelToken) {
        this.cancelToken.cancel('closeDownload')
        this.cancelToken = null
      }
    }
  }
}
</script>

<style lang="less" scoped>
.filecard {
  overflow: hidden;
  border: 1px solid @gray2;
  box-sizing: border-box;
  border-radius: 6px;
  height: 68px;
  display: flex;

  &-icon {
    @side-length: 66px;
    width: @side-length;
    height: @side-length;
    min-width: @side-length;
    min-height: @side-length;
    display: flex;
    justify-content: center;
    align-items: center;
    background: @primary-dark;

    span {
      font-size: 38px;
      color: @primary;
      height: @side-length;
      width: @side-length;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }

  &-main {
    padding: 8px 10px 0 10px;
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
        font-size: 14px;
        color: @gray3;
        margin: 0;
      }
    }
  }
  &.clickable {
    cursor: pointer;

    &:hover {
      .filecard{
        &-main {
          &-head {
            &-name {
              color: @primary;
            }
          }
        }
      }
    }
  }
}
</style>
