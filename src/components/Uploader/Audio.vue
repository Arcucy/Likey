<template>
  <div class="audio-input" id="audio-input">
    <label
      for="audio-input-area"
    >
      <span class="mdi mdi-music-note-eighth mdicon" />
    </label>
    <input
      class="audio-input-area"
      id="audio-input-area"
      type="file"
      accept="audio/mp3,audio/flac,audio/wave,audio/wav,audio/ogg,audio/mpeg"
      multiple
    >
  </div>
</template>

<script>
export default {
  data () {
    return {
      file: [],
      fileList: []
    }
  },
  mounted () {
    const fileInput = document.getElementById('audio-input-area')
    fileInput.addEventListener('change', () => {
      console.log('changed')
      this.file = fileInput.files

      if (fileInput.files.length > 20) {
        console.error('Exceeded File Limits')
        return
      }

      this.file.forEach(e => {
        const reader = new FileReader()
        reader.readAsArrayBuffer(e)
        reader.onload = async (res) => {
          try {
            this.fileList.push({ data: res.target.result, name: e.name, type: e.type, size: e.size })
            this.$emit('audio-input', this.fileList)
          } catch (err) {
            console.error('Read File Error')
          }
        }
      })
    })
  }
}
</script>

<style lang="less" scoped>
.audio-input {
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
