import i18n from '../i18n'
import API from '../api/api'

const filters = {
  winstonToAr (val, showDecimals = false) {
    if (!val) return '0'
    val = API.ArweaveNative.ar.winstonToAr(val)
    return showDecimals ? val : parseFloat(val)
  },
  finalize (val, loading) {
    if (loading) return i18n.tc('app.loading')
    if (!val) return '0 AR'
    return val + ' AR'
  }
}

export default filters
