export default {
  /** 转译 HTML 标签的尖括号 */
  escapeHtml (html) {
    return html.replace(/</g, '&lt;').replace(/>/g, '&gt;')
  },

  urlAddATag (text) {
    var regexp = /(http:\/\/|https:\/\/)((\w|=|\?|\.|\/|&|%|@|-)+)/g
    return text.replace(regexp, function (url) {
      return `<router-link :to="{}" onclick="window.open('${url}', '_blank')" >${url}</router-link>`
    })
  }
}
