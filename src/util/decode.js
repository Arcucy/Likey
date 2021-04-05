import BigNumber from 'bignumber.js'

const Decode = {
  /**
   * 将 Uint8Array 类型转换成 String
   * @param {Uint8Array} array 需要转换的数组
   */
  uint8ArrayToString: (function () {
    var charCache = new Array(128) // Preallocate the cache for the common single byte chars
    var charFromCodePt = String.fromCodePoint || String.fromCharCode
    var result = []

    return function (array) {
      var codePt, byte1
      var buffLen = array.length

      result.length = 0

      for (var i = 0; i < buffLen;) {
        byte1 = array[i++]

        if (byte1 <= 0x7F) {
          codePt = byte1
        } else if (byte1 <= 0xDF) {
          codePt = ((byte1 & 0x1F) << 6) | (array[i++] & 0x3F)
        } else if (byte1 <= 0xEF) {
          codePt = ((byte1 & 0x0F) << 12) | ((array[i++] & 0x3F) << 6) | (array[i++] & 0x3F)
        } else if (String.fromCodePoint) {
          codePt = ((byte1 & 0x07) << 18) | ((array[i++] & 0x3F) << 12) | ((array[i++] & 0x3F) << 6) | (array[i++] & 0x3F)
        } else {
          codePt = 63 // Cannot convert four byte code points, so use "?" instead
          i += 3
        }

        result.push(charCache[codePt] || (charCache[codePt] = charFromCodePt(codePt)))
      }

      return result.join('')
    }
  })(),

  /** 转换 PST 为 Winston */
  convertPstToWinston (value, ratio) {
    const { from, to } = Decode.getRatio(ratio)
    value = new BigNumber(String(value)).div(from).multipliedBy(to).multipliedBy(1000000000000)
    value = value.toFixed(12)

    if (value === 'Infinity' || value === 'NaN') {
      return '0'
    }
    return value
  },

  /** 拆分换算比率 */
  getRatio (ratio) {
    const regexp = new RegExp('^1:\\d*\\.?\\d*$')
    if (!regexp.test(ratio)) {
      return { from: '1', to: '0' }
    }
    let from = 1
    let to = new BigNumber(ratio.split(':').pop()).toFixed(12)
    let iteration = 0

    while (true) {
      if (!Number.isInteger(to)) {
        to = new BigNumber(to).multipliedBy(10).toNumber()
        iteration++
        continue
      }
      break
    }

    for (let i = 0; i < iteration; i++) {
      from = new BigNumber(from).multipliedBy(10)
    }
    to = BigNumber(to)
    return { from, to }
  }
}

export default Decode
