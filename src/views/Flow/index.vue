<template>
  <div class="flow">
    <h3>{{ $t("flow.flow") }}</h3>
    <div class="flow-container">
      <AudioUploader @audio-list="getAudioFiles" />
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
    // const jwk = getCookie('arclight_userkey')
    // this.$api.contract.announceCreator(JSON.parse(jwk),
    //   { scale: 'Personal', category: 'writing', shortname: 'ayakaneko', intro: 'Hi' },
    //   { name: 'Ayaka Neko Coin', ticker: 'ANC', contract: 'mGjKEbZnNXkxIXIJNkzMZi_jBADXC9QGlovd2fGmQas' },
    //   []
    // )
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
