export default {
  /** 转译 HTML 标签的尖括号 */
  escapeHtml (html) {
    const arr = html.split('')
    for (let i = 0; i < arr.length; i++) {
      switch (arr[i]) {
        case '<': arr[i] = '&lt;'; break
        case '>': arr[i] = '&gt;'; break
        case '"': arr[i] = '&quot;'; break
        // case `'${''}`: arr[i] = '&#x27;'; break
        // case '/': arr[i] = '&#x2F;'; break
        // case '&': arr[i] = '&amp;'; break
      }
    }
    return arr.join('')
  },

  urlAddATag (text) {
    const regexp = new RegExp('(https?):\\/\\/[-A-Za-z0-9+&@#/%?=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|]', 'g')
    return text.replace(regexp, function (url) {
      if (text.toLowerCase().includes('javascript:')) return text
      return `<router-link :to="{}" onclick="window.open('${url}', '_blank')" >${url}</router-link>&nbsp;`
    })
  }
}
