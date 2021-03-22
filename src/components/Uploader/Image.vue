<template>
  <div class="image-input cursor-pointer" id="image-input">
    <label
      for="image-input-area"
    >
      <span class="mdi mdi-image-multiple mdicon cursor-pointer" />
    </label>
    <input
      class="image-input-area"
      id="image-input-area"
      type="file"
      accept="image/*"
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
      const fileInput = document.getElementById('image-input-area')
      fileInput.addEventListener('change', () => {
        if (fileInput.files.length > 4) {
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
      this.$emit('image-input', this.fileBuffer)
      this.fileBuffer = []
    }
  }
}
</script>

<style lang="less" scoped>
.cursor-pointer {
  cursor: pointer;
}

.image-input {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;

  &:hover {
    background-color: @gray2;
  }

  &:active {
    background-color: @gray3;
  }

  .mdicon {
    display: block;
    margin-top: 2px;
    font-size: 25px;
  }

  &-area {
    display: none;
  }
}
</style>
