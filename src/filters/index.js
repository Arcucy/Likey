import i18n from '../i18n'
// import API from '../api/api'
import BigNumber from 'bignumber.js'

const filters = {
  winstonToAr (val, showDecimals = false) {
    if (!val) return '0'
    val = new BigNumber(val).div(1000000000000)
    BigNumber.set({ EXPONENTIAL_AT: 16 })
    return showDecimals ? val.toFixed(12) : val.toString()
  },
  arToWinston (val) {
    if (!val) return '0'
    val = new BigNumber(val).multipliedBy(1000000000000)
    BigNumber.set({ EXPONENTIAL_AT: 16 })
    return val.toFixed(0)
  },
  finalize (val, loading) {
    if (loading) return i18n.tc('app.loading')
    if (!val) return '0 AR'
    return val + ' AR'
  },
  /** 数字换算为缩减版本 */
  abbreviateNumber (num, fixed = 4) {
    num = new BigNumber(num)
    if (num === null) { return '0' } // terminate early
    if (num === 0) { return '0' } // terminate early
    fixed = (!fixed || fixed < 0) ? 0 : fixed // number of decimal places to show
    var b = (num).toPrecision(2).split('e') // get power
    var k = b.length === 1 ? 0 : Math.floor(Math.min(b[1].slice(1), 14) / 3) // floor at decimals, ceiling at trillions
    var c = k < 1 ? num.toFixed(0 + fixed) : (num / Math.pow(10, k * 3)).toFixed(1 + fixed) // divide by power
    var d = c < 0 ? c : Math.abs(c) // enforce -0 is 0
    var e = d + ['', 'K', 'M', 'B', 'T'][k] // append power
    return e
  },
  unlocked (val, isUnlocked) {
    if (isUnlocked) return i18n.tc('flowCard.unlocked')
    return val
  }
}

export default filters
