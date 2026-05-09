import { useState, useEffect, useCallback } from 'react'
import { ethers } from 'ethers'
import { useWallet } from './useWallet'
import { getContract } from '../services/web3'
import { DEPLOYED } from '../config/contracts'
import { POOL_ABI } from '../abis'

const POOL_META = [
  { t0: 'cUSDC', t1: 'cUSDT', fee: '0.05' },
  { t0: 'WBTC',  t1: 'cUSDC', fee: '0.30' },
  { t0: 'ZAMA',  t1: 'cUSDC', fee: '0.30' },
  { t0: 'cUSDC', t1: 'cUSDT', fee: '0.01' },
  { t0: 'BNB',   t1: 'cUSDC', fee: '0.30' },
]

export function usePools() {
  const { account } = useWallet()
  const [pools,   setPools]   = useState([])
  const [loading, setLoading] = useState(false)

  const fetchPools = useCallback(async () => {
    // Don't try if contracts not yet deployed
    if (!DEPLOYED.POOLS[0] || DEPLOYED.POOLS[0] === ethers.ZeroAddress) {
      setPools([])
      return
    }
    setLoading(true)
    try {
      const fetched = await Promise.all(
        DEPLOYED.POOLS.map(async (addr, i) => {
          try {
            const pool       = await getContract(addr, POOL_ABI, false)
            const depositors = await pool.totalDepositors()
            const feeBps     = await pool.feeBps()

            // hasPosition returns a plain bool — no FHE decryption needed
            let myPos = null
            if (account) {
              try {
                const has = await pool.hasPosition(account)
                if (has) myPos = '🔒 Active Position'
              } catch {}
            }

            const meta = POOL_META[i] || { t0: '?', t1: '?', fee: '?' }
            return {
              id:         i + 1,
              address:    addr,
              t0:         meta.t0,
              t1:         meta.t1,
              fee:        meta.fee,
              depositors: Number(depositors),
              feeBps:     Number(feeBps),
              myPos,
              tvl:        depositors > 0 ? `${depositors} depositor${depositors > 1 ? 's' : ''}` : 'Empty',
              vol:        '🔒 Private',
              apy:        simulatedApy(meta.fee),
            }
          } catch {
            return null
          }
        })
      )
      setPools(fetched.filter(Boolean))
    } catch (e) {
      console.error('Pool fetch error:', e)
    } finally {
      setLoading(false)
    }
  }, [account])

  useEffect(() => { fetchPools() }, [fetchPools])

  // Refresh every 30 seconds
  useEffect(() => {
    const id = setInterval(fetchPools, 30_000)
    return () => clearInterval(id)
  }, [fetchPools])

  return { pools, loading, refresh: fetchPools }
}

function simulatedApy(fee) {
  const map = { '0.01': '3.8', '0.05': '8.2', '0.30': '14.6' }
  return map[fee] || '10.0'
}
