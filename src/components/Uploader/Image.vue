<template>
  <div :class="{ disabled }" class="image-input" id="image-input">
    <label
      for="image-input-area"
    >
      <span class="mdi mdi-image-outline mdicon" />
    </label>
    <input
      class="image-input-area"
      id="image-input-area"
      type="file"
      accept="image/*"
      :multiple="multiple"
      :disabled="disabled"
    >
  </div>
</template>

<script>
import Compressor from 'compressorjs'

export default {
  props: {
    /** 多选 */
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
      fileBuffer: [],
      /** 图片裁切尺寸 */
      cropSize: 1000,
      quality: 0.8,
      /** 图片 MIME 类型 */
      mimeType: 'image/jpeg',
      /** 最大文件尺寸，单位 MB */
      maxFileSize: 1,
      repeatPromptLimiter: false
    }
  },
  mounted () {
    /** 初始化文件输入监听器 */
    this.initFileInputEventListener()
  },
  methods: {
    /** 初始化文件输入事件监听器 */
    initFileInputEventListener () {
      const fileInput = document.getElementById('image-input-area')

      fileInput.addEventListener('change', () => {
        if (fileInput.files.length > 20) {
          console.error('Exceeded File Limits')
          return
        }

        this.fileBuffer = []
        // 对选中的文件进行预处理
        fileInput.files.forEach((e) => this.picturePreprocessing(fileInput, e))
      })
    },
    /** 图片文件预处理流程 */
    async picturePreprocessing (fileInput, e) {
      /** 是否全部完成 */
      const isAllDone = () => {
        if (fileInput.files.length === this.fileBuffer.length) {
          this.done()
          fileInput.value = null
        }
      }
      // 压缩图片
      const imgFile = await this.compressorFunc(e, this.cropSize, this.mimeType)
      if (!imgFile) {
        this.fileBuffer.push({ data: null, name: '', type: '', size: 0, error: true })
        return isAllDone()
      }
      if (this.isExceedMaxSize(imgFile, this.maxFileSize)) {
        this.fileBuffer.push({ data: null, name: '', type: '', size: 0, error: true })
        return isAllDone()
      }
      const reader = new FileReader()
      reader.readAsArrayBuffer(imgFile)
      reader.onload = (res) => {
        try {
          this.fileBuffer.push({ data: res.target.result, name: imgFile.name, type: imgFile.type, size: imgFile.size })
        } catch (err) {
          this.fileBuffer.push({ data: null, name: '', type: '', size: 0, error: true })
          console.error('Read File Error')
        }
        isAllDone()
      }
    },
    /** 预处理完成，通过 image-input 事件返回结果 */
    done () {
      this.$emit('image-input', this.fileBuffer.filter(item => !item.error))
      this.fileBuffer = []
      this.repeatPromptLimiter = false
    },

    /** 图片压缩 */
    compressorFunc (file, cropSize, mimeType = 'auto') {
      return new Promise((resolve) => {
        const thumbnailConfig = cropSize
          ? {
              maxHeight: cropSize,
              maxWidth: cropSize
            }
          : {}
        // eslint-disable-next-line no-new
        new Compressor(file, {
          ...thumbnailConfig,
          quality: this.quality,
          strict: true,
          convertSize: 1024 * 1024 * this.imgSize,
          mimeType,
          success: (newfile) => {
            const file = new File([newfile], newfile.name, { type: newfile.type, lastModified: Date.now() })
            resolve(file)
          },
          error: (err) => {
            console.error(err)
            if (!this.repeatPromptLimiter) this.$message.error(this.$t('failure.autoCompressionFail'))
            this.repeatPromptLimiter = true
            resolve(null)
          }
        })
      })
    },

    // 限定最大字节
    isExceedMaxSize (file, size) {
      if (file.size >= 0 && file.size > 1024 * 1024 * size) {
        console.warn('Image too large, file name:', file.name)
        if (!this.repeatPromptLimiter) this.$message.warning(this.$t('failure.imgVeryBIg'))
        this.repeatPromptLimiter = true
        return true
      }
      return false
    }
  }
}
</script>

<style lang="less" scoped>
.image-input {
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
    &::before {
      cursor: pointer;
    }
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
