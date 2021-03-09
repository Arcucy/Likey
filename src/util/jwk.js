const crypto = require('js-crypto-rsa')

// 字符串转换为 Uint8Array
const encoder = new TextEncoder()
const hashAlgorithm = 'SHA-256'

/**
 * 用来签名的小工具
 */
class JwkUtil {
  /**
   * 对数据签名，输入私钥，客户端
   * @param {String} key - jwk 格式私钥
   * @param {String} data - 需要签名的数据
   */
  static async signMessage (key, data) {
    const sign = await crypto.sign(encoder.encode(data), key, hashAlgorithm)
    return Buffer.from(sign).toString('hex')
  }

  /**
   * 验证签名，输入公钥，服务端验证
   * @param {String} pub - 公钥
   * @param {String} signature - signMessage 获得的签名数据
   * @param {String} data - 之前签名的数据
   */
  static async verifyMessage (pub, signature, data) {
    const verify = await crypto.verify(data, signature, pub, 'SHA-256')
    return verify
  }

  /**
   * 从 JWK n 字段构建 JWK
   * @param {*} n  - JWK 公钥字段 n
   */
  static async buildPubJWK (n) {
    return {
      kty: 'RSA',
      e: 'AQAB',
      n: n
    }
  }
}

module.exports = JwkUtil
