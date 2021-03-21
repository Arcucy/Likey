<template>
  <div class="flow">
    <h3>{{ $t("flow.flow") }}</h3>
    <div class="flow-container">
      <AudioUploader @audio-input="getAudioFiles" />
      <FileUploader @file-input="getFiles" />
    </div>
  </div>
</template>

<script>
import AudioUploader from '@/components/Uploader/Audio'
import FileUploader from '@/components/Uploader/File'

export default {
  components: {
    AudioUploader,
    FileUploader
  },
  data () {
    return {}
  },
  mounted () {
    this.$api.tx.createNewStatus(undefined, undefined, (e) => {
      console.log(e)
    })
  },
  methods: {
    // 获得音乐文件
    getAudioFiles (files) {
      console.log(files)
    },
    // 获得文件
    getFiles (files) {
      console.log(files)
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
