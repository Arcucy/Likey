<template>
  <div class="flow">
    <!-- <h3>{{ $t("flow.flow") }}</h3>
    <div class="flow-container">
      <ImageUploader @image-input="getImageFiles" multiple />
      <AudioUploader @audio-input="getAudioFiles" />
      <FileUploader @file-input="getFiles" />
    </div> -->
    <img v-if="url" :src="url" class="preview">
    <el-button>
      上传
    </el-button> -->
    <span class="mdi mdi-arrow-up-bold uploading-indicator" />
  </div>
</template>

<script>
import Axios from 'axios'

export default {
  components: {
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
    const data = await Axios.get('https://arweave.arcucy.io/JIck1dl0H56YxSMb_fnrnWZOP6SdJJ4He_n9g-P4FVk', { responseType: 'arraybuffer' })
    this.url = 'data:image/jpeg;base64,' + btoa(String.fromCharCode.apply(null, new Uint8Array(data.data)))
    // const url = window.URL || window.webkitURL
    // this.url = url.createObjectURL(data.data)
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
    },
    // 获得文件
    getFiles (files) {
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

  margin-top: 100px;

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

.uploading-indicator {
  font-size: 50px;
  color: @primary;

  animation: uploading 1.2s infinite ease;
}

@keyframes uploading {
  0% {
    opacity: 50%;
  }

  35% {
    opacity: 100%;
  }

  100% {
    margin-top: -20px;
    opacity: 0%;
  }
}
</style>
