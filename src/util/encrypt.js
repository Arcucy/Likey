const crypto = require('crypto')

const passcode = require('../../secrets/encrypt.json')

const algorithm = 'aes-256-ctr'

const key = passcode.code
let iv = passcode.iv

/**
 * 加密文本
 * @param {String} text 被加密的文本
 */
function encryptText (text) {
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv)
  let encrypted = cipher.update(text)
  encrypted = Buffer.concat([encrypted, cipher.final()])
  return encrypted.toString('hex')
}

/**
 * 解密文本
 * @param {String} text 被解密的文本
 */
function decryptText (text) {
  iv = Buffer.from(iv)
  const encryptedText = Buffer.from(text, 'hex')
  const decipher = crypto.createDecipheriv(algorithm, Buffer.from(key), iv)
  let decrypted = decipher.update(encryptedText)
  decrypted = Buffer.concat([decrypted, decipher.final()])
  return decrypted.toString()
}

/**
 * 加密缓冲区
 * @param {Uint8Array} uint8Array 被加密的缓冲区
 */
function encryptBuffer (uint8Array) {
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv)
  let encrypted = cipher.update(uint8Array)
  encrypted = Buffer.concat([encrypted, cipher.final()])
  return encrypted
}

/**
 * 解密缓冲区
 * @param {Uint8Array} uint8Array 被解密的缓冲区
 */
function decryptBuffer (uint8Array) {
  iv = Buffer.from(iv)
  const encryptedContent = uint8Array
  const decipher = crypto.createDecipheriv(algorithm, Buffer.from(key), iv)
  let decrypted = decipher.update(encryptedContent)
  decrypted = Buffer.concat([decrypted, decipher.final()])
  return decrypted
}

module.exports = {
  encryptText,
  decryptText,
  encryptBuffer,
  decryptBuffer
}
