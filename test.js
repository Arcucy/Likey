const Arweave = require('arweave')
const SmartWeave = require('smartweave')
// console.log('SmartWeave:', SmartWeave)

const ar = Arweave.init({
  host: process.env.VUE_APP_ARWEAVE_NODE,
  port: 443,
  protocol: 'https',
  timeout: 20000,
  logging: false
})

async function readLikeyContract () {
  // console.log('SmartWeave:', SmartWeave)
  const state = await SmartWeave.readContract(ar, 'ztM2Ewn6gaptOskYbW35OyQD-MoZ86NckQWjkGxtXhA')
  console.log('state:', JSON.parse(state))
}

// export default {
//   /**
//    * 读取 Likey 主合约
//    */
//   async readLikeyContract () {
//     // console.log('SmartWeave:', SmartWeave)
//     const state = await SmartWeave.readContract(ar, 'ztM2Ewn6gaptOskYbW35OyQD-MoZ86NckQWjkGxtXhA')
//     console.log('state:', JSON.parse(state))
//   }
// }

readLikeyContract()
