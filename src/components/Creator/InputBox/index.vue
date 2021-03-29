<template>
  <div class="inputbox">
    <el-input
      class="inputbox-title"
      v-model="titleInput"
      :placeholder="$t('statusInput.titlePlaceholder')"
      maxlength="100"
    />
    <el-input
      class="inputbox-content"
      type="textarea"
      :autosize="{ minRows: 1, maxRows: 20 }"
      resize="none"
      :placeholder="$t('statusInput.contentPlaceholder')"
      v-model="contentInput"
    />
    <PhotoCards
      v-if="imageFiles && imageFiles.length"
      :files="imageFiles"
      @remove-file="removeImageFile"
    />
    <AudioCard
      v-for="(audioFile, index) of audioFiles"
      :key="'AudioCard-' + index"
      :file="audioFile"
      @remove-file="removeAudioFile(index)"
    />
    <FileCard
      v-for="(file, index) of files"
      :key="'FileCard-' + index"
      :file="file"
      @remove-file="removeFile(index)"
    />
    <div v-if="lockModeShow" class="inputbox-lockmode">
      <p>
        <span class="mdi mdi-lock-outline" />
        {{ lockModeShow.label }}
      </p>
      <span class="mdi mdi-close-thick inputbox-lockmode-btn" @click="lockMode = null" />
    </div>
    <div class="inputbox-func">
      <ImageUploader
        multiple
        @image-input="getImageFiles"
        :disabled="imageFiles.length >= imageFilesMaxLength"
      />
      <AudioUploader
        @audio-input="getAudioFiles"
        :disabled="audioFiles.length >= audioFilesMaxLength"
      />
      <FileUploader
        @file-input="getFiles"
        :disabled="files.length >= filesMaxLength"
      />
      <div class="inputbox-func-count">
        <p :class="content.length > contentMaxLength && 'overflow'">
          {{ content.length }}/{{ contentMaxLength }}
        </p>
      </div>
      <LockOption
        v-model="lockMode"
        :address="address"
      />
      <el-button
        class="inputbox-btn"
        type="primary"
        size="mini"
        @click="push"
        :disabled="disabledPush"
      >
        {{ $t('statusInput.push') }}
      </el-button>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'

import ImageUploader from '@/components/Uploader/Image'
import AudioUploader from '@/components/Uploader/Audio'
import FileUploader from '@/components/Uploader/File'

import PhotoCards from './PhotoCards'
import AudioCard from './AudioCard'
import FileCard from './FileCard'

import LockOption from './LockOption'

export default {
  components: {
    ImageUploader,
    AudioUploader,
    FileUploader,
    PhotoCards,
    AudioCard,
    FileCard,
    LockOption
  },
  props: {
    address: {
      type: String,
      required: true
    }
  },
  data () {
    return {
      title: '',
      content: '',
      contentMaxLength: 1000,
      imageFiles: [],
      audioFiles: [],
      files: [],
      imageFilesMaxLength: 4,
      audioFilesMaxLength: 1,
      filesMaxLength: 1,
      lockMode: null
    }
  },
  computed: {
    ...mapState({
      creators: state => state.contract.creators
    }),
    creator () {
      return this.creators ? this.creators[this.address] : null
    },
    titleInput: {
      set (val) {
        /** 限制，开头不能有空白，空白字符不能连续超过两个 */
        this.title = val.replace(/((?<=\s\s)\s+)|(^\s+.*?)/g, '')
      },
      get () {
        return this.title
      }
    },
    contentInput: {
      set (val) {
        // 限制，开头不能有空白，空白字符不能连续超过两个
        // 为了避免打了两个空格后不能打回车造成的用户困惑，将这部分判断分离
        this.content = val.replace(/((?<=[\n\r]{2})[\n\r]+)|((?<= {2}) +)|(^\s+.*?)/g, '')
      },
      get () {
        return this.content
      }
    },
    disabledPush () {
      const noContent = this.content.length === 0
      const contentOverflow = this.content.length > this.contentMaxLength
      return noContent || contentOverflow
    },
    lockModeShow () {
      if (!this.lockMode) return null
      if (this.lockMode && this.lockMode.all) {
        return {
          label: this.$t('statusInput.allSponsors')
        }
      }
      const ticker = this.creator.ticker.ticker
      return {
        ...this.lockMode,
        label: `${this.$t('statusInput.ownNUnlock', [this.lockMode.value, ticker])} - ${this.lockMode.title}`
      }
    }
  },
  watch: {
  },
  async mounted () {
  },
  methods: {
    ...mapActions(['pushUploaderQueue']),
    // 获得图片文件
    async getImageFiles (files) {
      files = [...files]
      if (this.imageFiles.length + files.length > this.imageFilesMaxLength) {
        this.$message.warning(this.$t('statusInput.pictureSelectionLimitWarning', [this.imageFilesMaxLength]))
        return
      }

      for (let i = 0; i < files.length; i++) {
        const url = await this.getBase64Url(files[i].data, files[i].type)
        files[i] = { ...files[i], url }
      }

      this.imageFiles.push(...files)
    },
    // 获得音乐文件
    getAudioFiles (files) {
      this.audioFiles.push(...files)
    },
    // 获得文件
    getFiles (files) {
      this.files.push(...files)
    },
    /** 发布 */
    push () {
      let lock = null
      if (this.lockMode) {
        lock = {
          contract: this.creator.ticker.contract,
          value: this.lockMode.value || '0'
        }
      }

      const form = {
        title: this.title,
        content: this.content,
        summary: this.lockMode ? '' : this.content,
        isTop: this.isTop,
        isLock: Boolean(this.lockMode),
        lock: lock,
        extra: {
          medias: [...this.imageFiles],
          audios: [...this.audioFiles],
          files: [...this.files]
        }
      }
      this.pushUploaderQueue(form)
      this.clearForm()
    },
    /** 清空表单 */
    clearForm () {
      this.title = ''
      this.content = ''
      this.isTop = false
      this.lockMode = null
      this.imageFiles = []
      this.audioFiles = []
      this.files = []
    },
    removeImageFile (index) {
      // 释放内存占用
      const url = window.URL || window.webkitURL
      url.revokeObjectURL(this.imageFiles[index].url)

      this.imageFiles.splice(index, 1)
    },
    removeAudioFile (index) {
      // 释放内存占用
      const url = window.URL || window.webkitURL
      url.revokeObjectURL(this.audioFiles[index].objectUrl)

      this.audioFiles.splice(index, 1)
    },
    removeFile (index) {
      // 释放内存占用
      const url = window.URL || window.webkitURL
      url.revokeObjectURL(this.files[index].objectUrl)

      this.files.splice(index, 1)
    },
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
    },
    copy (data) {
      return data && typeof data === 'object' ? JSON.parse(JSON.stringify(data)) : data
    }
  }
}
</script>

<style lang="less" scoped>
.inputbox {
  overflow: hidden;
  background: @background;
  box-shadow: 0 0 2px 0 #0000001a;
  box-sizing: border-box;
  border-radius: 6px;
  padding: 20px;
  margin: 0 0 20px;

  min-height: 100px;

  &-title {
    margin-bottom: 10px;
    /deep/ input {
      border: none;
      padding: 0;
      font-size: 20px;
      line-height: 24px;
      height: 24px;
      background-color: @background;
    }
  }
  &-content {
    margin-bottom: 10px;
    /deep/ textarea {
      border: none;
      padding: 0;
      font-size: 15px;
      line-height: 20px;
      background-color: @background;
    }
  }

  &-lockmode {
    display: flex;
    align-items: center;
    margin-bottom: 10px;

    p {
      margin: 0;
      font-size: 15px;
      color: @gray3;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 1;
      overflow: hidden;
      word-break: break-all;
      white-space: normal;
    }

    &-btn {
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

  &-func {
    display: flex;
    column-gap: 5px;
    align-items: center;

    &-count {
      flex: 1;
      display: flex;
      justify-content: flex-end;
      border-right: 1px solid var(--gray2);
      padding: 0 5px 0 0;

      p {
        color: @gray3;
        font-size: 15px;
        margin: 0;
        font-weight: 500;

        &.overflow {
          color: #F56C6C;
        }
      }
    }
  }

  &-btn {
    border-radius: 6px;
    min-width: 80px;
  }
}

@media screen and (max-width: 640px) {
  .inputbox {
    margin-bottom: 20px;
    border-radius: 0;
    padding: 20px 16px;
  }
}
</style>
