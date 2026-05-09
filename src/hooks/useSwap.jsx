import { useState, useCallback } from 'react'
import { ethers } from 'ethers'
import { useWallet } from './useWallet'
import { useFhevm } from './useFhevm'
import { encryptAmount } from '../services/fhevm'
import { DEPLOYED } from '../config/contracts'
import { SWAP_ABI, ERC20_ABI } from '../abis'

async function ensureSepolia() {
  if (!window.ethereum) throw new Error('No wallet found')
  const chainId = await window.ethereum.request({ method: 'eth_chainId' })
  if (chainId !== '0xaa36a7') {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0xaa36a7' }],
    })
  }
}

function getTokenAddress(sym) {
  const map = {
    cUSDC: DEPLOYED.TOKENS.cUSDC,
    cUSDT: DEPLOYED.TOKENS.cUSDT,
    WBTC:  DEPLOYED.TOKENS.WBTC,
    BNB:   DEPLOYED.TOKENS.BNB,
    ZAMA:  DEPLOYED.TOKENS.ZAMA,
  }
  return map[sym] || null
}

const DECIMALS_MAP = { cUSDC: 6, cUSDT: 6, WBTC: 8, BNB: 8, ZAMA: 8 }
const UINT64_MAX   = (2n ** 64n) - 1n

function parseAmountToBigInt(amountStr, decimals) {
  const [whole, frac = ''] = amountStr.split('.')
  const fracPadded = frac.padEnd(decimals, '0').slice(0, decimals)
  return BigInt(whole) * (10n ** BigInt(decimals)) + BigInt(fracPadded)
}

export function useSwap() {
  const { account, signer, isConnected } = useWallet()
  const { ready } = useFhevm()

  const [status, setStatus] = useState('idle')
  const [txHash, setTxHash] = useState(null)
  const [error,  setError]  = useState(null)

  const executeSwap = useCallback(async ({ fromTok, toTok, fromAmt }) => {
    setError(null)
    setTxHash(null)

    try {
      if (!isConnected || !account || !signer) {
        throw new Error('Please connect your wallet first.')
      }

      await ensureSepolia()

      if (!ready) {
        throw new Error('FHE not ready yet — please wait a moment.')
      }

      const swapAddr = DEPLOYED.SWAP
      if (!swapAddr || swapAddr === ethers.ZeroAddress) {
        throw new Error('Swap contract not deployed.')
      }

      if (fromTok.sym === 'ETH') throw new Error('ETH cannot be swapped directly.')

      const tokenInAddr  = getTokenAddress(fromTok.sym)
      const tokenOutAddr = getTokenAddress(toTok.sym)
      if (!tokenInAddr)  throw new Error(`${fromTok.sym} address missing`)
      if (!tokenOutAddr) throw new Error(`${toTok.sym} address missing`)

      const amtFloat = parseFloat(fromAmt)
      if (!fromAmt || isNaN(amtFloat) || amtFloat <= 0) throw new Error('Invalid amount')

      const decimals  = DECIMALS_MAP[fromTok.sym] ?? 6
      const rawBigInt = parseAmountToBigInt(fromAmt, decimals)
      if (rawBigInt > UINT64_MAX) throw new Error('Amount too large')
      if (rawBigInt === 0n)       throw new Error('Amount too small')

      const checksummedAccount = ethers.getAddress(account)
      const checksummedSwap    = ethers.getAddress(swapAddr)

      const tokenContract = new ethers.Contract(tokenInAddr, ERC20_ABI, signer)

     
      setStatus('approving')
      console.log('[swap] encrypting approve…')

      const encForApprove = await encryptAmount(UINT64_MAX, tokenInAddr, checksummedAccount)
      const approveTx = await tokenContract.approve(
        checksummedSwap,
        encForApprove.handle,
        encForApprove.inputProof,
      )
      await approveTx.wait()
      console.log('[swap] approved ✓')

     
      setStatus('encrypting')
      console.log('[swap] encrypting swap inputs…')

      const [encForSwap, encForToken] = await Promise.all([
        encryptAmount(rawBigInt, checksummedSwap,    checksummedAccount), // user calls swap()
        encryptAmount(rawBigInt, tokenInAddr,        checksummedSwap),    // swap calls transferFrom()
      ])
      console.log('[swap] encrypted ✓')

      // ── STEP 3: SWAP ─────────────────────────────────────────────────────
      setStatus('swapping')
      console.log('[swap] sending swap tx…')

      const swapContract = new ethers.Contract(checksummedSwap, SWAP_ABI, signer)
      const swapTx = await swapContract.swap(
        tokenInAddr,
        tokenOutAddr,
        encForSwap.handle,
        encForSwap.inputProof,
        encForToken.handle,
        encForToken.inputProof,
        { gasLimit: 700_000 },
      )

      const receipt = await swapTx.wait()
      console.log('[swap] ✅ confirmed', receipt.hash)

      setTxHash(receipt.hash)
      setStatus('done')
      return receipt

    } catch (e) {
      const msg = e.reason || e.message || 'Transaction failed'
      console.error('[swap error]', e)
      setError(msg)
      setStatus('error')
    }
  }, [account, signer, isConnected, ready])

  const reset = useCallback(() => {
    setStatus('idle')
    setError(null)
    setTxHash(null)
  }, [])

  return { executeSwap, status, txHash, error, reset }
}