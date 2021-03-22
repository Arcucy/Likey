<template>
  <div class="flow">
    <h3>{{ $t("flow.flow") }}</h3>
    <div class="flow-container">
      <ImageUploader @image-input="getImageFiles" multiple />
      <AudioUploader @audio-input="getAudioFiles" />
      <FileUploader @file-input="getFiles" />
    </div>
    <img v-if="url" :src="url" class="preview">
    <el-button
      @click="verifyUploads"
    >
      上传
    </el-button>
  </div>
</template>

<script>
import Axios from 'axios'

import ImageUploader from '@/components/Uploader/Image'
import AudioUploader from '@/components/Uploader/Audio'
import FileUploader from '@/components/Uploader/File'

import { getCookie } from '@/util/cookie'

export default {
  components: {
    ImageUploader,
    AudioUploader,
    FileUploader
  },
  data () {
    return {
      url: '',
      images: undefined,
      audios: undefined,
      files: undefined
    }
  },
  async mounted () {
    const data = await Axios.get('https://arweave.arcucy.io/SKx7PHt3IXLSf_X4JK_Vret9jcO95ZGk8o0FUcAyuPc', { responseType: 'arraybuffer' })
    const array = new Uint8Array(data.data)
    const blob = new Blob([array], { type: 'image/png' })
    const url = window.URL || window.webkitURL
    this.url = url.createObjectURL(blob)
  },
  methods: {
    getImageFiles (files) {
      this.images = files
      const blob = new Blob([this.images[0].data], { type: this.images[0].type })
      const url = window.URL || window.webkitURL
      this.url = url.createObjectURL(blob)
    },
    // 获得音乐文件
    getAudioFiles (files) {
      console.log(files)
    },
    // 获得文件
    getFiles (files) {
      console.log(files)
    },
    async verifyUploads () {
      const key = JSON.parse(getCookie('arclight_userkey'))

      try {
        const result = await this.$api.tx.postImageQueue(this.images, key, (pct) => {
          console.log('upload progress: ', pct)
        })
        console.log(result)
      } catch (err) {
        console.error(err)
        this.$message.error({
          duration: 3000,
          message: err
        })
      }
    }
  }
}
</script>

<style lang="less" scoped>
.flow {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;

  .flow-container {
    display: flex;
    flex-direction: row;
  }

  .preview {
    width: 500px;
    height: 100%;
    object-fit: cover;
  }
}
</style>
