<template>
  <div class="audio-input cursor-pointer" id="audio-input">
    <label
      for="audio-input-area"
    >
      <span class="mdi mdi-music-note-eighth mdicon cursor-pointer" />
    </label>
    <input
      class="audio-input-area"
      id="audio-input-area"
      type="file"
      accept="audio/mp3,audio/flac,audio/wave,audio/wav,audio/ogg,audio/mpeg"
      :multiple="multiple"
    >
  </div>
</template>

<script>
export default {
  props: {
    multiple: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      fileBuffer: []
    }
  },
  mounted () {
    /** 初始化文件输入监听器 */
    this.initFileInputEventListener()
  },
  methods: {
    initFileInputEventListener () {
      const fileInput = document.getElementById('audio-input-area')
      fileInput.addEventListener('change', () => {
        if (fileInput.files.length > 20) {
          console.error('Exceeded File Limits')
          return
        }

        fileInput.files.forEach(e => {
          const reader = new FileReader()
          reader.readAsArrayBuffer(e)
          reader.onload = (res) => {
            try {
              this.fileBuffer.push({ data: res.target.result, name: e.name, type: e.type, size: e.size })
            } catch (err) {
              this.fileBuffer.push({ data: null, name: '', type: '', size: 0, error: true })
              console.error('Read File Error')
            }
            if (fileInput.files.length === this.fileBuffer.length) this.done()
          }
        })
      })
    },
    done () {
      this.$emit('audio-input', this.fileBuffer)
      this.fileBuffer = []
    }
  }
}
</script>

<style lang="less" scoped>
.cursor-pointer {
  cursor: pointer;
}

.audio-input {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;

  &:hover {
    background-color: @primary-light;
    .mdicon {
      color: @primary;
    }
  }

  &:active {
    background-color: @primary-dark;
    .mdicon {
      color: @primary;
    }
  }

  .mdicon {
    display: block;
    margin-top: 2px;
    font-size: 22px;
    color: @gray3;
  }

  &-area {
    display: none;
  }
}
</style>
