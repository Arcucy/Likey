<template>
  <div class="flow">
    <h3>{{ $t("flow.flow") }}</h3>
    <div class="flow-container">
      <AudioUploader @audio-input="getAudioFiles" />
      <FileUploader @file-input="getFiles" />
    </div>
    <el-button
      @click="verifyUploads"
    >
      上传
    </el-button>
  </div>
</template>

<script>
import AudioUploader from '@/components/Uploader/Audio'
import FileUploader from '@/components/Uploader/File'

// import { getCookie } from '@/util/cookie'

export default {
  components: {
    AudioUploader,
    FileUploader
  },
  data () {
    return {
      audios: undefined,
      files: undefined
    }
  },
  mounted () {
  },
  methods: {
    // 获得音乐文件
    getAudioFiles (files) {
      console.log(files)
    },
    // 获得文件
    getFiles (files) {
      console.log(files)
    },
    verifyUploads () {

    }
  }
}
</script>

<style lang="less" scoped>
.flow-container {
  display: flex;
  justify-content: center;
}
</style>
