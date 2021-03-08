<template>
  <div>
    <el-dialog
      width="30%"
      :title="$t('insertYourKey')"
      :visible.sync="dialogVisible"
      :before-close="handleClose"
    >
      <div>
        <div class="keyreader">
          <div class="file-input-area" id="file-input-area">
            <span v-if="!file" ><svgIcon icon-class="mdi-plus" /></span>
            <span v-else >{{ fileName }}</span>
            <input class="file-input" id="file-input" type="file" accept="application/json">
          </div>
          <p class="keyreader-content">
            {{ $t('pleaseInsertYourWalletKey') }}
          </p>
          <el-button class="wallet-upload-button" type="primary" :disabled="disallowStep2" block @click="step2">
            Upload key
          </el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import svgIcon from '@/components/SvgIcon'

export default {
  components: {
    svgIcon
  },
  props: {
    value: {
      type: Boolean,
      required: true
    }
  },
  data () {
    return {
      file: '',
      fileName: '',
      dialogVisible: this.value,
      disallowStep2: true
    }
  },
  computed: {
  },
  watch: {
    value (val) {
      this.dialogVisible = val
    },
    dialogVisible (val) {
      this.setShowStatus(val)
      if (val) {
        setTimeout(() => {
          const fileInput = document.getElementById('file-input')
          const droparea = document.getElementById('file-input-area')

          fileInput.addEventListener('dragenter', () => {
            this.addClass(droparea, 'is-active')
          })
          fileInput.addEventListener('click', () => {
            this.addClass(droparea, 'is-active')
          })
          fileInput.addEventListener('focus', () => {
            this.addClass(droparea, 'is-active')
          })

          fileInput.addEventListener('dragleave', () => {
            this.removeClass(droparea, 'is-active')
          })
          fileInput.addEventListener('blur', () => {
            this.removeClass(droparea, 'is-active')
          })
          fileInput.addEventListener('drop', () => {
            this.removeClass(droparea, 'is-active')
          })

          fileInput.addEventListener('change', () => {
            this.disAllowStep2 = true
            this.file = fileInput.files[0]
            const reader = new FileReader()
            reader.readAsText(this.file)
            reader.onload = async (e) => {
              try {
                this.keyFileContent = JSON.parse(e.target.result)
                this.fileName = this.file.name
                this.disallowStep2 = false
              } catch (err) {
              }
            }
          })
        }, 100)
      }
    }
  },
  methods: {
    addClass (elem, className) {
      elem.classList.add(className)
    },
    removeClass (elem, className) {
      elem.classList.remove(className)
    },
    handleClose (done) {
      const fileInput = document.getElementById('file-input')
      const droparea = document.getElementById('file-input-area')
      fileInput.removeEventListener('dragenter', () => {})
      fileInput.removeEventListener('click', () => {})
      fileInput.removeEventListener('focus', () => {})
      fileInput.removeEventListener('dragleave', () => {})
      fileInput.removeEventListener('blur', () => {})
      fileInput.removeEventListener('drop', () => {})
      fileInput.removeEventListener('change', () => {})
      if (fileInput) {
        this.removeClass(droparea, 'is-active')
      }

      this.dialogVisible = false
      done()
    },
    step2 () {
      this.$emit('key-file', this.keyFileContent)
      this.dialogVisible = false
    },
    setShowStatus (val) {
      this.$emit('input', val)
    }
  }
}
</script>

<style lang="less" scoped>
.keyreader {
  display: flex;
  flex-direction: column;
  justify-content: center;

  &-content {
    margin-top: 24px;
    margin-bottom: 24px;
    text-align: left;
    word-break: break-word;
  }
}

#file-input-area {
  margin: 0 auto;
  height: 120px;
  width: 100%;
  border-radius: 4px;
  border: 2px dashed #B2B2B2;
  display: flex;
  justify-content: center;
  align-items: center;
  &.is-active {
    background-color: @gray1;
  }
  .file-input {
    position: absolute;
    z-index: 22;
    height: 120px;
    width: calc(100% - 40px);
    cursor: pointer;
    opacity: 0;
    &:focus {
      outline: none;
    }
  }
}

</style>
