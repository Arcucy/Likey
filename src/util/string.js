import blockList from '../config/blocked.json'

export default class StringUtil {
  /**
   * 计算 Utf8 字符串的体积
   * @param {String} str 需要计算的字符串
   */
  static lengthInUtf8Bytes (str) {
    const regexp = new RegExp('%[89ABab]', 'g')
    const m = encodeURIComponent(str).match(regexp)
    return str.length + (m ? m.length : 0)
  }

  static toPlainString (num) {
    const regexp = new RegExp('(-?)(\\d*)\\.?(\\d+)e([+-]\\d+)')
    return ('' + num).replace(regexp,
      function (a, b, c, d, e) {
        return e < 0
          ? b + '0.' + Array(1 - e - c.length).join(0) + c + d
          : b + c + d + Array(e - d.length + 1).join(0)
      })
  }

  static getBlockedArray (array, type) {
    let res = []
    const filterList = [...blockList[type]]
    res = array.filter(item => !filterList.find(elem => elem === item))

    return res
  }
}
