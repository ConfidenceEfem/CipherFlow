// /**
//  * fhevm.js — Zama FHE service layer (@zama-fhe/relayer-sdk v0.4.2)
//  */

// // FIX: removed `resetInstance` — it is NOT exported by the SDK.
// // Importing a non-existent named export causes a SyntaxError that crashes
// // the entire module before any code runs, giving a white screen.
// import { initSDK, createInstance, SepoliaConfig } from '@zama-fhe/relayer-sdk/web'

// let _instance = null
// let _sdkInitialized = false

// export async function getFhevmInstance() {
//   if (_instance) return _instance

//   try {
//     if (!_sdkInitialized) {
//       await initSDK({
//         tfheParams: '/tfhe_bg.wasm',
//         kmsParams:  '/kms_lib_bg.wasm',
//       })
//       _sdkInitialized = true
//       console.log('[fhevm] WASM initialized')
//     }

//     _instance = await createInstance({
//       ...SepoliaConfig,
//       network: window.ethereum,
//     })

//     console.log('[fhevm] ✅ instance ready')
//     return _instance

//   } catch (e) {
//     console.error('[fhevm] INIT FAILED:', e)
//     _instance = null
//     return null
//   }
// }

// export async function encryptAmount(amount, contractAddress, userAddress) {
//   const instance = await getFhevmInstance()

//   if (!instance) {
//     throw new Error(
//       'Zama FHE could not initialise. Make sure your wallet is connected and on Sepolia.'
//     )
//   }

//   try {
//     const input = instance.createEncryptedInput(contractAddress, userAddress)
//     const bigAmount = typeof amount === 'bigint' ? amount : BigInt(Math.round(amount))
//     input.add64(bigAmount)
//     const result = await input.encrypt()
//     return {
//       handle:     result.handles[0],
//       inputProof: result.inputProof,
//     }
//   } catch (e) {
//     console.error('[fhevm] encrypt failed:', e)
//     throw new Error('FHE encryption failed: ' + (e.message || 'unknown error'))
//   }
// }

// export async function decryptBalance(contractAddress, userAddress, handle, signFn) {
//   const instance = await getFhevmInstance()
//   if (!instance) return null

//   try {
//     const { publicKey, privateKey } = instance.generateKeypair()
//     const eip712    = instance.createEIP712(publicKey, contractAddress, userAddress)
//     const signature = await signFn(eip712)
//     return await instance.userDecrypt(
//       handle, privateKey, publicKey,
//       signature, contractAddress, userAddress,
//     )
//   } catch (e) {
//     console.warn('[fhevm] decryptBalance failed:', e.message)
//     return null
//   }
// }

// export function resetInstance() {
//   _instance = null
//   _sdkInitialized = false
// }


/**
 * fhevm.js — Zama FHE service layer (@zama-fhe/relayer-sdk v0.4.2)
 *
 * Uses the OLD fhevm v0.6.2 addresses that match the deployed contracts.
 * SepoliaConfig from the SDK uses DIFFERENT addresses (newer environment)
 * that don't exist on Sepolia — using those causes "Invalid index" errors.
 */
// import { initSDK, createInstance } from '@zama-fhe/relayer-sdk/web'

// // These addresses match fhevm v0.6.2 / SepoliaZamaFHEVMConfig in the contracts
// const FHEVM_CONFIG = {
//   aclContractAddress:                        '0xFee8407e2f5e3Ee68ad77cAE98c434e637f516e5',
//   kmsContractAddress:                        '0x9D6891A6240D6130c54ae243d8005063D05fE14b',
//   inputVerifierContractAddress:              '0x687408aB54661ba0b4aeF3a44156c616c6955E07',
//   verifyingContractAddressDecryption:        '0x9D6891A6240D6130c54ae243d8005063D05fE14b',
//   verifyingContractAddressInputVerification: '0x687408aB54661ba0b4aeF3a44156c616c6955E07',
//   chainId:        11155111,
//   gatewayChainId: 11155111,
//   relayerUrl:     'https://relayer.testnet.zama.org',
//   network:        null, // filled in at runtime
// }

// let _instance = null
// let _sdkInitialized = false

// export async function getFhevmInstance() {
//   if (_instance) return _instance

//   try {
//     if (!_sdkInitialized) {
//       await initSDK({
//         tfheParams: '/tfhe_bg.wasm',
//         kmsParams:  '/kms_lib_bg.wasm',
//       })
//       _sdkInitialized = true
//       console.log('[fhevm] WASM initialized')
//     }

//     _instance = await createInstance({
//       ...FHEVM_CONFIG,
//       network: window.ethereum,
//     })

//     console.log('[fhevm] ✅ instance ready')
//     return _instance

//   } catch (e) {
//     console.error('[fhevm] INIT FAILED:', e)
//     _instance = null
//     return null
//   }
// }

// export async function encryptAmount(amount, contractAddress, userAddress) {
//   const instance = await getFhevmInstance()
//   if (!instance) throw new Error('Zama FHE could not initialise.')

//   try {
//     const input = instance.createEncryptedInput(contractAddress, userAddress)
//     const bigAmount = typeof amount === 'bigint' ? amount : BigInt(Math.round(amount))
//     input.add64(bigAmount)
//     const result = await input.encrypt()
//     return {
//       handle:     result.handles[0],
//       inputProof: result.inputProof,
//     }
//   } catch (e) {
//     console.error('[fhevm] encrypt failed:', e)
//     throw new Error('FHE encryption failed: ' + (e.message || 'unknown error'))
//   }
// }

// export async function decryptBalance(contractAddress, userAddress, handle, signFn) {
//   const instance = await getFhevmInstance()
//   if (!instance) return null
//   try {
//     const { publicKey, privateKey } = instance.generateKeypair()
//     const eip712    = instance.createEIP712(publicKey, contractAddress, userAddress)
//     const signature = await signFn(eip712)
//     return await instance.userDecrypt(
//       handle, privateKey, publicKey,
//       signature, contractAddress, userAddress,
//     )
//   } catch (e) {
//     console.warn('[fhevm] decryptBalance failed:', e.message)
//     return null
//   }
// }

// export function resetInstance() {
//   _instance = null
//   _sdkInitialized = false
// }


/**
 * fhevm.js — Zama FHE service layer (@zama-fhe/relayer-sdk v0.4.2)
 */
// import { initSDK, createInstance, SepoliaConfig } from '@zama-fhe/relayer-sdk/web'

// let _instance = null
// let _sdkInitialized = false

// /**
//  * Wraps a promise with a timeout. Rejects with a clear message if
//  * the promise doesn't resolve within `ms` milliseconds.
//  */
// function withTimeout(promise, ms, label) {
//   return new Promise((resolve, reject) => {
//     const timer = setTimeout(
//       () => reject(new Error(`[fhevm] Timeout after ${ms}ms at: ${label}`)),
//       ms
//     )
//     promise
//       .then(v => { clearTimeout(timer); resolve(v) })
//       .catch(e => { clearTimeout(timer); reject(e) })
//   })
// }

// export async function getFhevmInstance() {
//   if (_instance) return _instance

//   try {
//     // Step 1: Load WASM
//     if (!_sdkInitialized) {
//       console.log('[fhevm] loading WASM…')
//       await withTimeout(
//         initSDK({ tfheParams: '/tfhe_bg.wasm', kmsParams: '/kms_lib_bg.wasm' }),
//         30_000,
//         'initSDK'
//       )
//       _sdkInitialized = true
//       console.log('[fhevm] WASM initialized')
//     }

//     // Step 2: Connect to relayer and fetch public keys
//     // Uses SepoliaConfig which has the correct relayer URL + addresses
//     // that the relayer at relayer.testnet.zama.org actually serves.
//     console.log('[fhevm] connecting to relayer…')
//     _instance = await withTimeout(
//       createInstance({ ...SepoliaConfig, network: window.ethereum }),
//       60_000,
//       'createInstance / relayer fetch'
//     )

//     console.log('[fhevm] ✅ instance ready')
//     return _instance

//   } catch (e) {
//     console.error('[fhevm] INIT FAILED:', e.message)
//     _instance = null
//     return null
//   }
// }

// export async function encryptAmount(amount, contractAddress, userAddress) {
//   const instance = await getFhevmInstance()
//   if (!instance) throw new Error('Zama FHE could not initialise.')

//   try {
//     const input = instance.createEncryptedInput(contractAddress, userAddress)
//     const bigAmount = typeof amount === 'bigint' ? amount : BigInt(Math.round(amount))
//     input.add64(bigAmount)
//     const result = await input.encrypt()
//     return {
//       handle:     result.handles[0],
//       inputProof: result.inputProof,
//     }
//   } catch (e) {
//     console.error('[fhevm] encrypt failed:', e)
//     throw new Error('FHE encryption failed: ' + (e.message || 'unknown error'))
//   }
// }

// export async function decryptBalance(contractAddress, userAddress, handle, signFn) {
//   const instance = await getFhevmInstance()
//   if (!instance) return null
//   try {
//     const { publicKey, privateKey } = instance.generateKeypair()
//     const eip712    = instance.createEIP712(publicKey, contractAddress, userAddress)
//     const signature = await signFn(eip712)
//     return await instance.userDecrypt(
//       handle, privateKey, publicKey,
//       signature, contractAddress, userAddress,
//     )
//   } catch (e) {
//     console.warn('[fhevm] decryptBalance failed:', e.message)
//     return null
//   }
// }

// export function resetInstance() {
//   _instance = null
//   _sdkInitialized = false
// }


/**
 * fhevm.js — Zama FHE service layer (@zama-fhe/relayer-sdk v0.4.2)
 */
import { initSDK, createInstance, SepoliaConfig } from '@zama-fhe/relayer-sdk/web'

let _instance = null
let _sdkInitialized = false

function withTimeout(promise, ms, label) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`Timeout after ${ms}ms at: ${label}`)),
      ms
    )
    promise
      .then(v => { clearTimeout(timer); resolve(v) })
      .catch(e => { clearTimeout(timer); reject(e) })
  })
}

export async function getFhevmInstance() {
  if (_instance) return _instance

  try {
    if (!_sdkInitialized) {
      console.log('[fhevm] loading WASM…')
      await withTimeout(
        initSDK({
          tfheParams: '/tfhe_bg.wasm',
          kmsParams:  '/kms_lib_bg.wasm',
          // FIX: Force single-threaded mode.
          // thread: 0 skips initThreadPool entirely.
          // Without COEP headers, SharedArrayBuffer is unreliable — the thread
          // pool init hangs indefinitely instead of falling back gracefully.
          thread: 0,
        }),
        45_000,
        'initSDK'
      )
      _sdkInitialized = true
      console.log('[fhevm] WASM initialized')
    }

    console.log('[fhevm] connecting to relayer…')
    _instance = await withTimeout(
      createInstance({ ...SepoliaConfig, network: window.ethereum }),
      60_000,
      'createInstance'
    )

    console.log('[fhevm] ✅ instance ready')
    return _instance

  } catch (e) {
    console.error('[fhevm] INIT FAILED:', e.message)
    _instance = null
    return null
  }
}

export async function encryptAmount(amount, contractAddress, userAddress) {
  const instance = await getFhevmInstance()
  if (!instance) throw new Error('Zama FHE could not initialise.')

  try {
    console.log("before creating encrypted input")
    const input = instance.createEncryptedInput(contractAddress, userAddress)
    console.log("big amount")
    const bigAmount = typeof amount === 'bigint' ? amount : BigInt(Math.round(amount))
    input.add64(bigAmount)
    console.log("after big amount")
    const result = await input.encrypt()
    return {
      handle:     result.handles[0],
      inputProof: result.inputProof,
    }
    console.log("when result of encrypting", result)
  } catch (e) {
    console.error('[fhevm] encrypt failed:', e)
    throw new Error('FHE encryption failed: ' + (e.message || 'unknown error'))
  }
}

export async function decryptBalance(contractAddress, userAddress, handle, signFn) {
  const instance = await getFhevmInstance()
  if (!instance) return null
  try {
    const { publicKey, privateKey } = instance.generateKeypair()
    const eip712    = instance.createEIP712(publicKey, contractAddress, userAddress)
    const signature = await signFn(eip712)
    return await instance.userDecrypt(
      handle, privateKey, publicKey,
      signature, contractAddress, userAddress,
    )
  } catch (e) {
    console.warn('[fhevm] decryptBalance failed:', e.message)
    return null
  }
}

export function resetInstance() {
  _instance = null
  _sdkInitialized = false
}



// /**
//  * fhevm.js — Zama FHE service layer
//  *
//  * FIX: Use the fhevm v0.6.2 contract addresses that MATCH what SepoliaZamaFHEVMConfig
//  * bakes into the deployed contracts at compile time.
//  *
//  * WHY "Invalid index" happens:
//  *   The relayer-sdk's SepoliaConfig points to a DIFFERENT (newer) ACL deployment:
//  *     SDK SepoliaConfig ACL  → 0xf0Ffdc93b7E186bC2f8CB3dAA75D86d1930A433D  ← WRONG
//  *     fhevm v0.6.2 ACL       → 0xFee8407e2f5e3Ee68ad77cAE98c434e637f516e5  ← CORRECT
//  *
//  *   When createEncryptedInput() runs it stamps the ACL address into the proof.
//  *   The on-chain InputVerifier then looks up that handle in the ACL contract.
//  *   Because the ACL address is wrong, the handle doesn't exist there → "Invalid index".
//  *
//  * SOLUTION: Build a custom config from the fhevm v0.6.2 addresses instead of
//  * using the SDK's SepoliaConfig.
//  */
// import { initSDK, createInstance } from '@zama-fhe/relayer-sdk/web'

// /**
//  * Addresses sourced from:
//  *   contracts/node_modules/fhevm/config/ZamaFHEVMConfig.sol  (fhevm v0.6.2)
//  *
//  *   ACLAddress:              0xFee8407e2f5e3Ee68ad77cAE98c434e637f516e5
//  *   TFHEExecutorAddress:     0x687408aB54661ba0b4aeF3a44156c616c6955E07  ← InputVerifier
//  *   KMSVerifierAddress:      0x9D6891A6240D6130c54ae243d8005063D05fE14b
//  *   FHEPaymentAddress:       0xFb03BE574d14C256D56F09a198B586bdfc0A9de2
//  */
// const FHEVM_V062_CONFIG = {
//   // ACL contract — must match SepoliaZamaFHEVMConfig in the Solidity contracts
//   aclContractAddress:                        '0xFee8407e2f5e3Ee68ad77cAE98c434e637f516e5',

//   // KMS verifier
//   kmsContractAddress:                        '0x9D6891A6240D6130c54ae243d8005063D05fE14b',

//   // InputVerifier (TFHEExecutor address doubles as InputVerifier in v0.6.x)
//   inputVerifierContractAddress:              '0x687408aB54661ba0b4aeF3a44156c616c6955E07',

//   // EIP-712 verifying contracts (same as their respective on-chain contracts)
//   verifyingContractAddressDecryption:        '0x9D6891A6240D6130c54ae243d8005063D05fE14b',
//   verifyingContractAddressInputVerification: '0x687408aB54661ba0b4aeF3a44156c616c6955E07',

//   chainId:        11155111,
//   gatewayChainId: 11155111,

//   // Public Zama testnet relayer — same endpoint, compatible with these contracts
//   relayerUrl: 'https://relayer.testnet.zama.org',
// }

// let _instance = null
// let _sdkInitialized = false

// function withTimeout(promise, ms, label) {
//   return new Promise((resolve, reject) => {
//     const timer = setTimeout(
//       () => reject(new Error(`Timeout after ${ms}ms at: ${label}`)),
//       ms
//     )
//     promise
//       .then(v => { clearTimeout(timer); resolve(v) })
//       .catch(e => { clearTimeout(timer); reject(e) })
//   })
// }

// export async function getFhevmInstance() {
//   if (_instance) return _instance

//   try {
//     if (!_sdkInitialized) {
//       console.log('[fhevm] loading WASM…')
//       await withTimeout(
//         initSDK({
//           tfheParams: '/tfhe_bg.wasm',
//           kmsParams:  '/kms_lib_bg.wasm',
//           // Single-threaded mode: SharedArrayBuffer requires COEP headers which
//           // most dev/staging setups don't have. thread:0 skips initThreadPool.
//           thread: 0,
//         }),
//         45_000,
//         'initSDK'
//       )
//       _sdkInitialized = true
//       console.log('[fhevm] WASM initialized')
//     }

//     console.log('[fhevm] connecting to relayer…')
//     _instance = await withTimeout(
//       createInstance({
//         ...FHEVM_V062_CONFIG,
//         network: window.ethereum,
//       }),
//       60_000,
//       'createInstance'
//     )

//     console.log('[fhevm] ✅ instance ready')
//     return _instance

//   } catch (e) {
//     console.error('[fhevm] INIT FAILED:', e.message)
//     _instance = null
//     return null
//   }
// }

// /**
//  * Encrypt a uint64 amount for a specific contract+user pair.
//  *
//  * contractAddress: the contract that will call TFHE.asEuint64() with this proof
//  * userAddress:     the tx sender (msg.sender in the contract call)
//  *
//  * These two addresses are bound into the proof — they must exactly match
//  * the addresses used in the on-chain transaction, otherwise the InputVerifier
//  * will reject the proof.
//  */
// export async function encryptAmount(amount, contractAddress, userAddress) {
//   const instance = await getFhevmInstance()
//   if (!instance) throw new Error('Zama FHE could not initialise.')

//   try {
//     const input = instance.createEncryptedInput(contractAddress, userAddress)
//     const bigAmount = typeof amount === 'bigint' ? amount : BigInt(Math.round(amount))
//     input.add64(bigAmount)
//     const result = await input.encrypt()
//     return {
//       handle:     result.handles[0],
//       inputProof: result.inputProof,
//     }
//   } catch (e) {
//     console.error('[fhevm] encrypt failed:', e)
//     throw new Error('FHE encryption failed: ' + (e.message || 'unknown error'))
//   }
// }

// export async function decryptBalance(contractAddress, userAddress, handle, signFn) {
//   const instance = await getFhevmInstance()
//   if (!instance) return null
//   try {
//     const { publicKey, privateKey } = instance.generateKeypair()
//     const eip712    = instance.createEIP712(publicKey, contractAddress, userAddress)
//     const signature = await signFn(eip712)
//     return await instance.userDecrypt(
//       handle, privateKey, publicKey,
//       signature, contractAddress, userAddress,
//     )
//   } catch (e) {
//     console.warn('[fhevm] decryptBalance failed:', e.message)
//     return null
//   }
// }

// export function resetInstance() {
//   _instance = null
//   _sdkInitialized = false
// }
