import { ethers } from 'ethers'
import { SEPOLIA_RPC, CHAIN_ID } from '../config/contracts'

/**
 * Get a read-only provider (no wallet needed).
 */
export function getReadProvider() {
  return new ethers.JsonRpcProvider(SEPOLIA_RPC)
}

/**
 * Get a signer-enabled provider from the user's injected wallet.
 * Throws if no wallet is detected.
 */
export async function getSigner() {
  if (!window.ethereum) throw new Error('No wallet detected')
  const provider = new ethers.BrowserProvider(window.ethereum)
  await ensureSepolia(provider)
  return provider.getSigner()
}

/**
 * Prompt user to switch to Sepolia if they're on the wrong network.
 */
export async function ensureSepolia(provider) {
  const net = await provider.getNetwork()
  if (Number(net.chainId) !== CHAIN_ID) {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0x' + CHAIN_ID.toString(16) }],
    })
  }
}

/**
 * Create a contract instance.
 * @param {string}   address
 * @param {string[]} abi
 * @param {boolean}  write   — true = use signer, false = read-only
 */
export async function getContract(address, abi, write = false) {
  if (write) {
    const signer = await getSigner()
    return new ethers.Contract(address, abi, signer)
  }
  return new ethers.Contract(address, abi, getReadProvider())
}

/**
 * Format a BigInt token amount to a human-readable string.
 */
export function formatToken(amount, decimals = 18, precision = 4) {
  if (!amount && amount !== 0n) return '0'
  return parseFloat(ethers.formatUnits(amount, decimals)).toFixed(precision)
}

/**
 * Parse a human-readable amount string to BigInt.
 */
export function parseToken(amount, decimals = 18) {
  return ethers.parseUnits(String(amount), decimals)
}
