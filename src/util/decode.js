import BigNumber from 'bignumber.js'

const Decode = {
  /**
   * 将 Uint8Array 类型转换成 String
   * @param {Uint8Array} array 需要转换的数组
   */
  uint8ArrayToString (array) {
    var out, i, len, c
    var char2, char3
    out = ''
    len = array.length
    i = 0
    while (i < len) {
      c = array[i++]
      switch (c >> 4) {
        case 0: case 1: case 2: case 3: case 4: case 5: case 6: case 7:
          // 0xxxxxxx
          out += String.fromCharCode(c)
          break
        case 12: case 13:
          // 110x xxxx   10xx xxxx
          char2 = array[i++]
          out += String.fromCharCode(((c & 0x1F) << 6) | (char2 & 0x3F))
          break
        case 14:
          // 1110 xxxx  10xx xxxx  10xx xxxx
          char2 = array[i++]
          char3 = array[i++]
          out += String.fromCharCode(((c & 0x0F) << 12) |
            ((char2 & 0x3F) << 6) |
            ((char3 & 0x3F) << 0))
          break
      }
    }
    return out
  },

  /** 转换 PST 为 Winston */
  convertPstToWinston (value, ratio) {
    const { from, to } = Decode.getRatio(ratio)
    value = new BigNumber(String(value)).multipliedBy(to).div(from).multipliedBy(1000000000000)
    value = value.toFixed(12)

    if (value === 'Infinity' || value === 'NaN') {
      return '0'
    }
    return value
  },

  /** 拆分换算比率 */
  getRatio (ratio) {
    if (!/^1:\d*\.?\d*$/.test(ratio)) {
      return { from: '1', to: '0' }
    }
    let from = 1
    let to = parseFloat(parseFloat(ratio.split(':').pop()).toFixed(12))
    let iteration = 0

    while (true) {
      if (!Number.isInteger(to)) {
        to = to * 10
        iteration++
        continue
      }
      break
    }

    for (let i = 0; i < iteration; i++) {
      from = new BigNumber(from).multipliedBy(10)
    }
    to = BigNumber(to)
    return { from: new BigNumber(String(from)), to }
  }
}

export default Decode
