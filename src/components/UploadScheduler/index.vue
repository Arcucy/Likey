<template>
  <div v-if="processing" class="scheduler-bg">
    <div class="scheduler-ear">
      <div class="scheduler-ear-main">
        <p v-if="encrypting && !uploading" class="scheduler-ear-main-uploading">
          <span class="mdi mdi-lock" />
          {{ $t('progressText.encrypting') }}
        </p>
        <p v-else-if="!errorPause" class="scheduler-ear-main-uploading">
          <span class="mdi mdi-upload" />
          {{ progressText }}
        </p>
        <p v-else class="scheduler-ear-main-failed">
          <span class="mdi mdi-alert-circle-outline" />
          上传失败
          <span class="scheduler-ear-main-failed-retry" @click="retryClick">
            <span class="mdi mdi-refresh">
              重试
            </span>
          </span>
        </p>
      </div>
    </div>
    <el-progress
      v-if="uploading"
      class="scheduler-progress"
      :percentage="progress"
      :show-text="false"
    />
    <!-- <div class="scheduler">
    </div> -->
  </div>
</template>

<script>
import { encryptText, encryptBuffer } from '@/util/encrypt'
import { mapState, mapGetters, mapActions } from 'vuex'

export default {
  props: {
  },
  data () {
    return {
      subqueue: [],
      queueIndex: 0,
      progress: 0,
      key: null
    }
  },
  computed: {
    ...mapState({
      queue: state => state.uploader.queue,
      encrypting: state => state.uploader.encrypting,
      uploading: state => state.uploader.uploading,
      errorPause: state => state.uploader.errorPause,
      myJwk: state => state.user.myJwk
    }),
    ...mapGetters(['isLoggedIn']),
    processing () {
      return this.encrypting || this.uploading || this.errorPause
    },
    progressText () {
      const task = this.subqueue[this.queueIndex]
      let text = ''
      if (task) {
        switch (task.mode) {
          case 'file':
            switch (task.parameter.fileType) {
              case 'state-image':
                text = this.$t('progressText.media')
                break
              case 'state-audio':
                text = this.$t('progressText.audio')
                break
              case 'state-file':
                text = this.$t('progressText.file')
                break
            }
            break
          case 'status':
            text = this.$t('progressText.status')
            break
        }
      }
      return `${this.progress}% (${this.queueIndex + 1}/${this.subqueue.length}) - ${text}...`
    }
  },
  watch: {
    queue: {
      handler (val) {
        if (!this.processing && val && val.length) {
          console.log('发布！', val[0].extra.medias && val[0].extra.medias[0] && val[0].extra.medias[0].data)
          this.startUpload(val[0])
        }
      },
      immediate: true
    }
  },
  mounted () {
  },
  methods: {
    ...mapActions(['removeUploaderQueue', 'encryptingStateOn', 'setUploadingState', 'uploaderErrorPauseOn']),
    async startUpload (data) {
      if (!this.isLoggedIn || !this.myJwk) return
      this.key = JSON.parse(this.myJwk)
      this.startUploadingMessage(data)
      if (data.lock) {
        this.encryptingStateOn()
        await this.createEncryption(data)
      }
      this.setUploadingState(true)
      this.createSubqueue(data)
      this.queueIndex = 0
      this.progress = 0
      await this.executeUploadQueue(this.key)
    },
    /** 显示正在上传中的消息提示 */
    startUploadingMessage (data) {
      const text = (data.title || data.content || '').replace(/\s+/g, ' ')
      const maxCount = 20
      this.$notify({
        title: this.$t('statusInput.uploadingStatus'),
        message: text.length > maxCount ? text.slice(0, maxCount) + '...' : text
      })
    },
    /** 重试按钮 */
    retryClick () {
      if (!this.errorPause || this.uploading) return
      this.setUploadingState(true)
      this.progress = 0
      this.executeUploadQueue(this.key)
    },
    createEncryption (data) {
      return new Promise((resolve, reject) => {
        this.$nextTick(() => {
          setTimeout(() => {
            if (data.extra) {
              const { medias, audios, files } = data.extra
              // 图片
              if (medias) {
                for (let i = 0; i < medias.length; i++) {
                  try {
                    medias[i].data = encryptBuffer(new Uint8Array(medias[i].data))
                  } catch (err) {
                    this.encryptError(err)
                    reject(err)
                    return
                  }
                }
              }
              // 音乐
              if (audios) {
                for (let i = 0; i < audios.length; i++) {
                  try {
                    audios[i].data = encryptBuffer(new Uint8Array(audios[i].data))
                  } catch (err) {
                    this.encryptError(err)
                    reject(err)
                    return
                  }
                }
              }
              // 文件
              if (files) {
                for (let i = 0; i < files.length; i++) {
                  try {
                    files[i].data = encryptBuffer(new Uint8Array(files[i].data))
                  } catch (err) {
                    this.encryptError(err)
                    reject(err)
                    return
                  }
                }
              }
            }

            try {
              data.content = encryptText(data.content)
            } catch (err) {
              this.encryptError(err)
              reject(err)
              return
            }
            resolve()
          }, 2000)
        })
      })
    },
    /** 创建子上传队列 */
    createSubqueue (data) {
      this.subqueue = []
      // 附加内容
      if (data.extra) {
        const { medias, audios, files } = data.extra
        // 图片
        medias && medias.forEach(item => this.subqueue.push({
          mode: 'file',
          parameter: {
            file: item,
            fileType: 'state-image'
          },
          uploader: null,
          txId: ''
        }))
        // 音乐
        audios && audios.forEach(item => this.subqueue.push({
          mode: 'file',
          parameter: {
            file: item,
            fileType: 'state-audio'
          },
          uploader: null,
          txId: ''
        }))
        // 文件
        files && files.forEach(item => this.subqueue.push({
          mode: 'file',
          parameter: {
            file: item,
            fileType: 'state-file'
          },
          uploader: null,
          txId: ''
        }))
      }
      // 动态主体
      const { medias = [], audios = [], files = [] } = data.extra ? data.extra : {}
      this.subqueue.push({
        mode: 'status',
        parameter: {
          status: {
            title: data.title,
            content: data.content,
            summary: data.summary,
            isTop: data.isTop || false,
            isLock: data.isLock || false,
            lock: data.lock || null
          },
          extra: {
            medias: medias.map(item => {
              return {
                id: '',
                type: item.type,
                size: item.size
              }
            }),
            audios: audios.map(item => {
              return {
                id: '',
                name: item.name,
                type: item.type,
                size: item.size,
                duration: item.duration
              }
            }),
            files: files.map(item => {
              return {
                id: '',
                name: item.name,
                type: item.type,
                size: item.size
              }
            })
          }
        },
        uploader: null,
        txId: ''
      })
    },
    /** 执行子上传队列 */
    async executeUploadQueue (key) {
      const callback = (pctComplete, uploader, txId) => {
        console.log('进度：', pctComplete, { uploader, txId })
        this.progress = pctComplete
        this.subqueue[this.queueIndex].uploader = uploader
        this.subqueue[this.queueIndex].txId = txId
      }
      try {
        for (; this.queueIndex < this.subqueue.length; this.queueIndex++) {
          const task = this.subqueue[this.queueIndex]
          let res
          if (!task.uploader) {
            switch (task.mode) {
              case 'file':
                res = await this.createNewFile(task, key, callback)
                break
              case 'status':
                res = await this.createNewStatus(task, key, callback)
                break
            }
          } else {
            res = await this.resumeUpload(task, key, callback)
          }
          if (!res) throw new Error('Transaction address not obtained')
        }
        this.complete()
      } catch (err) {
        console.error('Status Upload Failed:', err)
        this.uploaderErrorPauseOn()
        this.$message.error(this.$t('failure.dynamicUploadFailed'))
      }
    },
    /** 文件上传 */
    async createNewFile (task, key, callback) {
      const { parameter } = task
      const res = await this.$api.tx.createNewFile(parameter.file, parameter.fileType, key, undefined, callback)
      if (res && (res.status.status === 202 || res.status.status === 200)) {
        task.txId = res.id
        task.uploader = null
        return res.id
      }
      return ''
    },
    /** 动态上传 */
    async createNewStatus (task, key, callback) {
      const { parameter } = task
      /** 给图片，音频和文件对象写入之前上传好的 txId */
      if (parameter.extra) {
        const { medias = [], audios = [], files = [] } = parameter.extra ? parameter.extra : {}

        const mediaTxIds = this.subqueue.filter(item => item.parameter.fileType === 'state-image').map(item => item.txId)
        console.log('mediaTxIds:', mediaTxIds)
        medias.forEach((media, index) => { media.id = mediaTxIds[index] })

        const audioTxIds = this.subqueue.filter(item => item.parameter.fileType === 'state-audio').map(item => item.txId)
        audios.forEach((audio, index) => { audio.id = audioTxIds[index] })

        const fileTxIds = this.subqueue.filter(item => item.parameter.fileType === 'state-file').map(item => item.txId)
        files.forEach((file, index) => { file.id = fileTxIds[index] })
      }

      const res = await this.$api.tx.createNewStatus(parameter.status, parameter.extra, key, callback)
      console.log('执行结果：', res)
      if (res && (res.status.status === 202 || res.status.status === 200)) {
        task.txId = res.id
        task.uploader = null
        return res.id
      }
      return ''
    },
    /** 重新连接并继续之前中断的上传 */
    async resumeUpload (task, key, callback) {
      const { parameter } = task
      let data
      switch (task.mode) {
        case 'file':
          data = parameter.file.data
          break
        case 'status':
          data = this.$api.tx.createStatusData(parameter.status, parameter.extra)
          break
      }
      const res = await this.$api.tx.resumeUpload(task.uploader, task.txId, data, callback)
      if (res && (res.status.status === 202 || res.status.status === 200)) {
        task.txId = res.id
        task.uploader = null
        return res.id
      }
      return ''
    },
    /** 完成 */
    complete () {
      // 暂停加载状态，从队列中移除完成的任务，弹出成功的消息
      this.setUploadingState(false)
      this.removeUploaderQueue(0)
      this.$message.success(this.$t('success.statusPublished'))
    },
    encryptError (err) {
      console.error('Status Upload Failed:', err)
      this.$message.error(this.$t('failure.dynamicEncryptFailed'))
      this.setUploadingState(false)
      this.removeUploaderQueue(0)
    }
  }
}
</script>

<style lang="less" scoped>
.scheduler-bg {
  z-index: 3000;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  box-shadow: 0 0 2px 0 #0000004d;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  .scheduler-ear {
    max-width: 1220px;
    width: 100%;
    padding: 0 10px 0;
    position: relative;
    box-sizing: border-box;

    &-main {
      position: absolute;
      background: @background;
      right: 10px;
      top: -33px;
      height: 34px;
      border-radius: 6px 6px 0 0;
      padding: 5px 10px;
      box-shadow: 0 0 2px 0 #0000004d;
      box-sizing: border-box;

      &-uploading {
        margin: 0;
        font-size: 15px;
        color: @primary;
        line-height: 24px;
        height: 24px;
      }

      &-failed {
        margin: 0;
        font-size: 15px;
        color: #F56C6C;
        line-height: 24px;
        height: 24px;

        &-retry {
          color: @primary;
          padding: 0 10px;
          cursor: pointer;

          &:hover {
            text-decoration: underline;
          }
        }
      }
    }
  }

  .scheduler-progress {
    width: 100%;
    /deep/ .el-progress-bar .el-progress-bar__outer {
      border-radius: 0;
    }
  }
}
</style>
