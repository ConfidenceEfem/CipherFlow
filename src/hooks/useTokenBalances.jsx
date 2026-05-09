import { useState, useEffect, useCallback } from 'react'
import { ethers } from 'ethers'
import { useWallet } from './useWallet'
import { getLivePrices } from '../services/priceService'

/**
 * useTokenBalances
 *
 * KEY INSIGHT: Confidential ERC20 tokens store balances as FHE ciphertexts.
 * Calling balanceOf() returns an encrypted handle (bytes32), NOT a readable number.
 * Decrypting requires the Zama FHE gateway + a wallet signature — complex and async.
 *
 * For now we:
 *  - Show real ETH balance (native, always readable)
 *  - Show "Private" for confidential token balances
 *  - Still allow swapping by letting users type amounts manually
 *
 * When the FHE SDK is fully connected, swap the "Private" entries for
 * decryptBalance() calls from src/services/fhevm.js
 */

const TOKEN_META = [
  { sym: 'ETH',   name: 'Ethereum',          decimals: 18, isNative: true  },
  { sym: 'cUSDC', name: 'Confidential USDC',  decimals: 6,  isNative: false },
  { sym: 'cUSDT', name: 'Confidential USDT',  decimals: 6,  isNative: false },
  { sym: 'WBTC',  name: 'Wrapped Bitcoin',    decimals: 8,  isNative: false },
  { sym: 'BNB',   name: 'BNB Token',          decimals: 18, isNative: false },
  { sym: 'ZAMA',  name: 'Zama Token',         decimals: 18, isNative: false },
]

const TOKEN_COLORS = {
  ETH:   '#627EEA',
  cUSDC: '#2775CA',
  cUSDT: '#26A17B',
  WBTC:  '#F7931A',
  BNB:   '#F0B90B',
  ZAMA:  '#F7CB08',
}

export function useTokenBalances() {
  const { account, provider, ethBalance, isConnected } = useWallet()
  const [tokens,  setTokens]  = useState(buildDefault())
  const [prices,  setPrices]  = useState({})
  const [loading, setLoading] = useState(false)

  function buildDefault() {
    return TOKEN_META.map(m => ({
      sym:      m.sym,
      name:     m.name,
      bal:      '0',
      usd:      '0.00',
      decimals: m.decimals,
      address:  null,
      color:    TOKEN_COLORS[m.sym] || '#888',
      isNative: m.isNative,
      isPrivate: !m.isNative,
    }))
  }

  const fetchBalances = useCallback(async () => {
    setLoading(true)
    try {
      // Always fetch live prices from CoinGecko
      const livePrices = await getLivePrices()
      setPrices(livePrices)

      const updated = TOKEN_META.map(meta => {
        let bal      = '0'
        let usd      = '0.00'
        let isPrivate = false

        if (meta.isNative && isConnected) {
          // ETH — always readable, comes from useWallet
          bal = parseFloat(ethBalance || '0').toFixed(4)
          const price = livePrices['ETH'] ?? 0
          usd = (parseFloat(bal) * price).toFixed(2)
        } else {
          // Confidential ERC20 — balance is encrypted, cannot read without FHE decrypt
          // Show "Private" so the user knows tokens are there but hidden
          isPrivate = true
          bal = 'Private'
          usd = '—'
        }

        return {
          sym:       meta.sym,
          name:      meta.name,
          bal,
          usd,
          decimals:  meta.decimals,
          address:   null,   // set from DEPLOYED in swap hook
          color:     TOKEN_COLORS[meta.sym] || '#888',
          isNative:  meta.isNative,
          isPrivate,
        }
      })

      setTokens(updated)
    } catch (e) {
      console.error('Balance fetch error:', e)
    } finally {
      setLoading(false)
    }
  }, [account, ethBalance, isConnected])

  useEffect(() => { fetchBalances() }, [fetchBalances])

  // Refresh every 30s
  useEffect(() => {
    const id = setInterval(fetchBalances, 30_000)
    return () => clearInterval(id)
  }, [fetchBalances])

  return { tokens, prices, loading, refresh: fetchBalances }
}
