<template>
  <div class="audiocard-bg">
    <span class="mdi mdi-close-thick audiocard-close" @click="$emit('remove-file')" />
    <aplayer
      v-if="music"
      :music="music"
      class="audiocard-player"
      :theme="primaryColor"
    />
  </div>
</template>

<script>
import { mapState } from 'vuex'

import FileUtil from '@/util/file'

import logo80px from '@/assets/img/default/audio.png'

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
      src: '',
      primaryColor: ''
    }
  },
  computed: {
    ...mapState({
      themeName: state => state.app.themeName
    }),
    fileSize () {
      if (!this.file) return ''
      return FileUtil.formatBytes(this.file.size, 2)
    },
    music () {
      if (!this.src) return ''
      return {
        src: this.src,
        title: this.file.name,
        artist: this.fileSize,
        pic: logo80px
      }
    }
  },
  watch: {
    file: {
      async handler (value) {
        console.log('res:', value.data, Buffer.from(value.data))
        if (value) this.src = await this.getBase64Url(value.data, value.type)
        console.log(this.src)
      },
      immediate: true
    },
    primaryColor (val) {
      console.log('primaryColor', val)
    },
    themeName: {
      handler () {
        this.primaryColor = getComputedStyle(document.getElementById('app')).getPropertyValue('--primary')
      },
      immediate: true
    }
  },
  methods: {
    /** 将资源加载到一个 url */
    getBase64Url (buffer, type) {
      return new Promise((resolve, reject) => {
        // 挂载音频到一个 URL，并指定给 audio.pic
        const reader = new FileReader()
        reader.readAsArrayBuffer(new Blob([new Uint8Array(buffer)], { type }))
        reader.onload = (event) => {
          const url = window.webkitURL.createObjectURL(new Blob([event.target.result], { type }))
          resolve(url)
        }
      })
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
  margin-bottom: 10px;
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
      }
      .aplayer-author {
        color: @gray3 !important;
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

  .audiocard-close {
    z-index: 1;
    position: absolute;
    top: 10px;
    right: 10px;
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
</style>
