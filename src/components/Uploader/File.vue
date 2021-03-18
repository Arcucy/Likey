<template>
  <div class="file-input" id="file-input">
    <label
      for="file-input-area"
    >
      <span class="mdi mdi-file-outline mdicon" />
    </label>
    <input
      class="file-input-area"
      id="file-input-area"
      type="file"
      accept="*"
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
    const fileInput = document.getElementById('file-input-area')
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
            this.$emit('file-input', this.fileList)
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
.file-input {
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
