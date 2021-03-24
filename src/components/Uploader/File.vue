<template>
  <div :class="{ disabled }" class="file-input" id="file-input">
    <label
      for="file-input-area"
    >
      <span class="mdi mdi-file-outline mdicon" />
    </label>
    <input
      class="file-input-area"
      id="file-input-area"
      type="file"
      accept="*"
      :multiple="multiple"
      :disabled="disabled"
    >
  </div>
</template>

<script>
export default {
  props: {
    /** 开启多选 */
    multiple: {
      type: Boolean,
      default: false
    },
    /** 禁用 */
    disabled: {
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
      const fileInput = document.getElementById('file-input-area')
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
            if (fileInput.files.length === this.fileBuffer.length) {
              this.done()
              fileInput.value = null
            }
          }
        })
      })
    },
    done () {
      this.$emit('file-input', this.fileBuffer)
      this.fileBuffer = []
    }
  }
}
</script>

<style lang="less" scoped>
.file-input {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  cursor: pointer;

  label {
    width: 100%;
    text-align: center;
  }

  .mdicon {
    display: block;
    margin-top: 2px;
    font-size: 22px;
    color: @gray3;
    cursor: pointer;
  }

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

  &.disabled {
    background-color: #00000000;
    cursor: not-allowed;

    .mdicon {
      color: @gray2;
      cursor: not-allowed;
    }
  }

  &-area {
    display: none;
  }
}
</style>
