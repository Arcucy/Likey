import API from '../api/api'

const filters = {
  winstonToAr (val, showDecimals = false) {
    if (!val) return '0'
    val = API.ArweaveNative.ar.winstonToAr(val)
    return showDecimals ? val : parseFloat(val)
  }
}

export default filters
