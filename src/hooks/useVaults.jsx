import { useState, useEffect, useCallback } from 'react'
import { ethers } from 'ethers'
import { useWallet } from './useWallet'
import { getContract } from '../services/web3'
import { DEPLOYED } from '../config/contracts'
import { VAULT_ABI } from '../abis'

const VAULT_META = [
  { name: 'Alpha Vault',      asset: 'cUSDC', strategy: 'Delta Neutral',   risk: 'med'  },
  { name: 'Stable Shield',    asset: 'cUSDT', strategy: 'Yield Optimizer', risk: 'low'  },
  { name: 'Stable Shield 2.0',asset: 'cUSDT', strategy: 'Basis Trade',     risk: 'low'  },
  { name: 'Zama Deposit',     asset: 'ZAMA',  strategy: 'Momentum',        risk: 'high' },
]

export function useVaults() {
  const { account } = useWallet()
  const [vaults,  setVaults]  = useState([])
  const [loading, setLoading] = useState(false)

  const fetchVaults = useCallback(async () => {
    if (DEPLOYED.VAULTS[0] === ethers.ZeroAddress) {
      setVaults([])
      return
    }
    setLoading(true)
    try {
      const fetched = await Promise.all(
        DEPLOYED.VAULTS.map(async (addr, i) => {
          try {
            const vault      = await getContract(addr, VAULT_ABI, false)
            const apyBps     = await vault.apyBps()
            const depositors = await vault.totalDepositors()
            const vaultName  = await vault.vaultName()
            const strategy   = await vault.strategy()

            // Check if user has a balance handle
            let myBalance = null
            if (account) {
              try {
                const handle = await vault.getBalance(account)
                const isZero = handle === '0x' + '0'.repeat(64)
                if (!isZero) myBalance = '🔒 Encrypted'
              } catch {}
            }

            const meta = VAULT_META[i] || { asset: '?', risk: 'low' }
            const apy  = (Number(apyBps) / 100).toFixed(1)

            return {
              id:         i + 1,
              address:    addr,
              name:       vaultName || meta.name,
              asset:      meta.asset,
              apy,
              strategy:   strategy || meta.strategy,
              risk:       meta.risk,
              depositors: Number(depositors),
              tvl:        depositors > 0 ? `${depositors} depositors` : 'Empty',
              minDep:     getMinDep(meta.asset),
              myBalance,
            }
          } catch {
            return null
          }
        })
      )
      setVaults(fetched.filter(Boolean))
    } catch (e) {
      console.error('Vault fetch error:', e)
    } finally {
      setLoading(false)
    }
  }, [account])

  useEffect(() => { fetchVaults() }, [fetchVaults])
  useEffect(() => {
    const id = setInterval(fetchVaults, 30_000)
    return () => clearInterval(id)
  }, [fetchVaults])

  return { vaults, loading, refresh: fetchVaults }
}

function getMinDep(asset) {
  const m = { cUSDC: '10 cUSDC', cUSDT: '10 cUSDT', ZAMA: '1 ZAMA', ETH: '0.01 ETH' }
  return m[asset] || '—'
}
