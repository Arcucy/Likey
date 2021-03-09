import send from './http'

const backend = {
  /**
   * 使用 JWK 签名登录
   * @param {*} pub 公钥（n 字段）
   * @param {*} signature 签名
   * @param {*} data 被签名的数据
   */
  arJwkSignLogin (pub, signature, data) { return send.post('/auth/ar-jwk-sign', { pub, signature, data }) }
}

export default backend
