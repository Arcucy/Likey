import API from '@/api/api'

class FileUtil {
  // 检查是否是Arweave的key文件
  static async isValidKeyFile (content) {
    let shouldContinue = true
    await API.arql.getAddress(content).catch(() => { // 提前检查是否是Arweave的key
      shouldContinue = false
    })
    return shouldContinue
  }

  static formatBytes (bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes'

    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
  }
}

export default FileUtil
