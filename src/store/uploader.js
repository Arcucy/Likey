export default {
  /** 是否开启命名空间 */
  namespaced: false,

  state: {
    queue: [],
    encrypting: false,
    uploading: false,
    errorPause: false
  },
  getters: {
  },
  mutations: {
    /** 向队列尾部添加上传任务 */
    mPushUploaderQueue (state, data) {
      state.queue.push(data)
    },
    /** 根据索引移除队列中的上传任务 */
    mRemoveUploaderQueue (state, index) {
      state.queue.splice(index, 1)
    },
    /** 打开加密状态 */
    mSetEncryptingStateOn (state) {
      state.encrypting = true
      state.errorPause = false
      state.uploading = false
    },
    /** 设置上传状态 */
    mSetUploadingState (state, data) {
      state.uploading = Boolean(data)
      state.errorPause = false
      state.encrypting = false
    },
    /** 打开错误暂停 */
    mUploaderErrorPauseOn (state) {
      state.errorPause = true
      state.uploading = false
      state.encrypting = false
    }
  },
  actions: {
    /** 根据索引移除队列中的上传任务 */
    removeUploaderQueue: ({ commit }, index) => commit('mRemoveUploaderQueue', index),
    /** 设定加密状态为 true */
    encryptingStateOn: ({ commit }) => commit('mSetEncryptingStateOn'),
    /** 设置上传状态 */
    setUploadingState: ({ commit }, data) => commit('mSetUploadingState', data),
    /** 打开错误暂停 */
    uploaderErrorPauseOn: ({ commit }) => commit('mUploaderErrorPauseOn'),

    /** 向队列尾部添加上传任务 */
    pushUploaderQueue ({ commit }, {
      title,
      content,
      summary,
      isTop = false,
      isLock = false,
      lock,
      extra
    }) {
      console.log('发布！', extra.medias && extra.medias[0] && extra.medias[0].data)
      commit('mPushUploaderQueue', {
        title,
        content,
        summary,
        isTop,
        isLock,
        lock,
        extra
      })
    }
  }
}
