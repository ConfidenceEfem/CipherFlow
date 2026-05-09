
import { useState, useEffect, useRef } from 'react'
import { getFhevmInstance, resetInstance } from '../services/fhevm'
import { useWallet } from './useWallet'

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

export function useFhevm() {
  const { isConnected } = useWallet()

  const [instance, setInstance] = useState(null)
  const [ready,    setReady]    = useState(false)
  const [error,    setError]    = useState(null)

  // Prevent duplicate init when React StrictMode double-fires effects
  const initInProgress = useRef(false)

  useEffect(() => {
    // Reset when wallet disconnects
    if (!isConnected) {
      setInstance(null)
      setReady(false)
      setError(null)
      initInProgress.current = false
      resetInstance()          // clear the cached fhevm instance too
      return
    }

    // Don't double-init
    if (ready || initInProgress.current) return

    let cancelled = false
    initInProgress.current = true

    async function init() {
      try {
        setReady(false)
        setError(null)

        await ensureSepolia()
        console.log('[useFhevm] network ok — starting FHE init…')

        const inst = await getFhevmInstance()
        if (!inst) throw new Error('FHE init returned null — check relayer connectivity')

        if (!cancelled) {
          setInstance(inst)
          setReady(true)
          console.log('[useFhevm] ✅ FHE ready')
        }
      } catch (e) {
        console.error('[useFhevm] init error:', e.message)
        if (!cancelled) {
          setError(e.message)
          initInProgress.current = false   // allow retry on next connection
        }
      }
    }

    init()
    return () => { cancelled = true }

  }, [isConnected, ready])

  return { instance, ready, error }
}
