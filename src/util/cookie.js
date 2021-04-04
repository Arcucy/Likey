import Cookies from 'js-cookie'

export function getCookie (key) {
  return Cookies.get(key)
}

export function setCookie (key, val, expires = 7) {
  return Cookies.set(key, val, { expires: expires })
}

export function removeCookie (key) {
  return Cookies.remove(key)
}

export function clearAllCookie () {
  // eslint-disable-next-line no-useless-escape
  const reg = new RegExp('[^ =;]+(?=\\=)', 'g')
  const keys = document.cookie.match(reg)
  if (keys) {
    for (let i = keys.length; i--;) { document.cookie = keys[i] + '=0;expires=' + new Date(0).toUTCString() }
  }
}

/**
 * 解析 JSON Web Token 中的原数据
 * @param {String} token JWT
 */
export function disassemble (token) {
  if (!token) return { iss: null, exp: 0, platform: null, id: null }
  let tokenPayload = token.substring(token.indexOf('.') + 1)
  tokenPayload = tokenPayload.substring(0, tokenPayload.indexOf('.'))
  return JSON.parse(atob(tokenPayload))
}
