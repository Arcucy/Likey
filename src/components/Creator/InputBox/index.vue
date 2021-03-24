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
import ImageUploader from '@/components/Uploader/Image'
import AudioUploader from '@/components/Uploader/Audio'
import FileUploader from '@/components/Uploader/File'
import PhotoCards from './PhotoCards'
import AudioCard from './AudioCard'
import FileCard from './FileCard'

export default {
  components: {
    ImageUploader,
    AudioUploader,
    FileUploader,
    PhotoCards,
    AudioCard,
    FileCard
  },
  props: {
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
      filesMaxLength: 1
    }
  },
  computed: {
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
    }
  },
  watch: {
  },
  methods: {
    // 获得图片文件
    async getImageFiles (files) {
      files = [...files]
      console.log(files)
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
      console.log('发布！')
    },
    removeImageFile (index) {
      this.imageFiles.splice(index, 1)
    },
    removeAudioFile (index) {
      this.audioFiles.splice(index, 1)
    },
    removeFile (index) {
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
</style>
