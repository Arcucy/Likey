<template>
  <div class="audiocard-bg">
    <aplayer
      v-if="music"
      :music="music"
      class="audiocard-player"
      :theme="primaryColor"
      autoplay
    />
    <div
      v-else
      class="preview"
      :class="!loading && 'clickable'"
      @click="getAudio"
    >
      <div class="preview-r">
        <img src="@/assets/img/default/audio.png" alt="audio">
        <span v-if="!loading" class="mdi mdi-play-circle-outline preview-r-start" />
        <span v-else class="preview-r-loading">
          <i class="el-icon-loading" />
        </span>
      </div>
      <div class="preview-l">
        <h4>
          {{ audioName }}
        </h4>
        <div v-if="!loading" class="preview-l-data">
          <span>
            {{ duration }}
          </span>
          <span>
            {{ fileSize }}
          </span>
        </div>
        <div v-else class="preview-l-data">
          <span>
            {{ $t('app.loading') }}
          </span>
          <span>
            {{ progress }}%
          </span>
        </div>
        <el-progress v-if="loading" :percentage="progress" :show-text="false" />
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

import FileUtil from '@/util/file'

import audioIcon from '@/assets/img/default/audio.png'

export default {
  components: {
  },
  props: {
    audio: {
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
      primaryColor: '',
      progress: 0,
      loading: false
    }
  },
  computed: {
    ...mapState({
      themeName: state => state.app.themeName
    }),
    music () {
      if (!this.src) return ''
      return {
        src: this.src,
        title: this.audioName,
        artist: '',
        pic: audioIcon
      }
    },
    audioName () {
      // 去掉文件的后缀名
      return this.audio.name.substring(0, this.audio.name.lastIndexOf('.'))
    },
    duration () {
      const duration = parseInt(this.audio.duration / 1000)
      const s = Math.ceil(duration % 60)
      const m = parseInt((duration % 3600) / 60)
      const h = parseInt(duration / 3600)
      return (h ? `${this.prefixZero(h)}:` : '') + `${this.prefixZero(m)}:${this.prefixZero(s)}`
    },
    fileSize () {
      if (!this.audio) return ''
      return FileUtil.formatBytes(this.audio.size, 2)
    }
  },
  watch: {
    themeName: {
      handler () {
        this.primaryColor = getComputedStyle(document.getElementById('app')).getPropertyValue('--primary')
      },
      immediate: true
    }
  },
  destroyed () {
    const url = window.URL || window.webkitURL
    url.revokeObjectURL(this.src)
  },
  methods: {
    async getAudio () {
      if (this.loading) return
      this.loading = true
      try {
        const res = await this.$api.gql.getAudio(this.audio.id, this.isEncrypt, undefined, pct => { this.progress = pct })
        this.src = res
      } catch (err) {
        console.error(err)
        this.$message.error('failure.load')
      }
      this.loading = false
    },
    /** 数字前缀加 0，用于音频时常的显示 */
    prefixZero (num) {
      if (num.toString().length > 2) return num
      return ('00' + num).slice(-2)
    }
  }
}
</script>

<style lang="less" scoped>
.audiocard-bg {
  overflow: hidden;
  border: 1px solid @gray2;
  box-sizing: border-box;
  border-radius: 6px;
  display: flex;
  position: relative;

  .audiocard-player {
    width: 100%;
    box-shadow: none;
    border-radius: 0;
    background-color: #fff0;
    margin: 0;
    /deep/ .aplayer-body {
      .aplayer-title {
        color: @dark;
        padding-bottom: 2px;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 1;
        overflow: hidden;
        word-break: break-all;
        white-space: normal;
      }
      .aplayer-author {
        display: none;
      }
      .aplayer-time-inner {
        color: @gray3;
      }
      .aplayer-time {
        .aplayer-icon-mode  {
          display: none;
        }
        .aplayer-volume-wrap {
          display: none;
        }
      }
      .aplayer-info {
        padding: 14px 10px 10px 10px;
      }
    }
  }

  .preview {
    display: flex;
    width: 100%;
    &-r {
      width: 66px;
      height: 66px;
      min-width: 66px;
      min-height: 66px;
      background: @primary;
      position: relative;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .preview-icon-basis {
        position: absolute;
        right: 0;
        bottom: 0;
        top: 0;
        left: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        color: white;
        background: rgba(0,0,0,.2);
        opacity: 0.8;
        font-size: 34px;
      }

      &-start {
        .preview-icon-basis();
        cursor: pointer;
        &:hover {
          opacity: 1;
        }
      }
      &-loading {
        .preview-icon-basis();
        opacity: 1;
        font-size: 32px;
      }
    }

    &-l {
      flex: 1;
      padding: 8px 10px 0 10px;
      h4 {
        font-size: 15px;
        margin: 0 0 5px;
        font-weight: 400;
        color: @dark;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 1;
        overflow: hidden;
        word-break: break-all;
      }

      &-data {
        font-size: 14px;
        color: @gray3;
        display: flex;
        justify-content:space-between;
        align-items: center;
      }
    }

    &.clickable {
      cursor: pointer;

      &:hover {

        .preview-l {
          h4 {
            color: @primary;
          }
        }
      }
    }
  }
}
</style>
