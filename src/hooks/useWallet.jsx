import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { ethers } from 'ethers'
import { resetInstance } from '../services/fhevm'

const WalletCtx = createContext(null)
const CHAIN_ID  = 11155111

const SEPOLIA_PARAMS = {
  chainId:            '0xaa36a7',
  chainName:          'Sepolia Testnet',
  nativeCurrency:     { name: 'Sepolia ETH', symbol: 'ETH', decimals: 18 },
  rpcUrls: [
    'https://ethereum-sepolia-rpc.publicnode.com',
    'https://eth-sepolia.public.blastapi.io',
    'https://rpc2.sepolia.org',
  ],
  blockExplorerUrls:  ['https://sepolia.etherscan.io'],
}

/**
 * Adds Sepolia to the wallet first (safe even if it already exists),
 * then switches to it. This order avoids the "Unrecognized chain ID" error.
 */
async function addAndSwitchToSepolia() {
  // Step 1 — always try to add the chain first.
  // wallet_addEthereumChain is a no-op if the chain already exists.
  try {
    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [SEPOLIA_PARAMS],
    })
  } catch (addErr) {
    // If user rejected adding the chain, stop here
    if (addErr.code === 4001) throw addErr
    // Any other error from add — log and continue, switch might still work
    console.warn('wallet_addEthereumChain warning:', addErr.message)
  }

  // Step 2 — now switch to it (wallet knows about it now)
  await window.ethereum.request({
    method: 'wallet_switchEthereumChain',
    params: [{ chainId: '0xaa36a7' }],
  })
}

export const WalletProvider = ({ children }) => {
  const [account,    setAccount]    = useState(null)
  const [chainId,    setChainId]    = useState(null)
  const [provider,   setProvider]   = useState(null)
  const [signer,     setSigner]     = useState(null)
  const [ethBalance, setEthBalance] = useState('0')
  const [loading,    setLoading]    = useState(false)
  const [error,      setError]      = useState(null)

  const connect = useCallback(async () => {
    if (!window.ethereum) throw new Error('No wallet detected')
    setLoading(true)
    setError(null)

    try {
      // 1. Add + switch to Sepolia FIRST before requesting accounts.
      //    This way MetaMask knows the chain before it asks for permission.
      await addAndSwitchToSepolia()

      // 2. Now request account access — this opens the MetaMask popup
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      })

      // 3. Build provider + signer from the now-correct network
      const _provider = new ethers.BrowserProvider(window.ethereum)
      const _signer   = await _provider.getSigner()
      const net       = await _provider.getNetwork()
      const bal       = await _provider.getBalance(accounts[0])

      setAccount(accounts[0])
      setProvider(_provider)
      setSigner(_signer)
      setChainId(Number(net.chainId))
      setEthBalance(ethers.formatEther(bal))

      return accounts[0]
    } catch (e) {
      setError(e.message)
      throw e
    } finally {
      setLoading(false)
    }
  }, [])

  const disconnect = useCallback(() => {
    setAccount(null)
    setProvider(null)
    setSigner(null)
    setEthBalance('0')
    resetInstance()
  }, [])

  const refreshEthBalance = useCallback(async () => {
    if (!provider || !account) return
    const bal = await provider.getBalance(account)
    setEthBalance(ethers.formatEther(bal))
  }, [provider, account])

  // React to account / chain changes made inside the wallet extension
  useEffect(() => {
    if (!window.ethereum) return
    const onAccounts = (accounts) => {
      if (accounts.length === 0) disconnect()
      else setAccount(accounts[0])
    }
    const onChain = (chainHex) => setChainId(parseInt(chainHex, 16))
    window.ethereum.on('accountsChanged', onAccounts)
    window.ethereum.on('chainChanged',    onChain)
    return () => {
      window.ethereum.removeListener('accountsChanged', onAccounts)
      window.ethereum.removeListener('chainChanged',    onChain)
    }
  }, [disconnect])

  // Auto-reconnect if wallet was already unlocked
  useEffect(() => {
    if (!window.ethereum) return
    window.ethereum.request({ method: 'eth_accounts' }).then(accounts => {
      if (accounts.length > 0) connect().catch(() => {})
    })
  }, [connect])

  return (
    <WalletCtx.Provider value={{
      account, chainId, provider, signer,
      ethBalance, loading, error,
      connect, disconnect, refreshEthBalance,
      isConnected: !!account,
      onSepolia:   chainId === CHAIN_ID,
    }}>
      {children}
    </WalletCtx.Provider>
  )
}

export const useWallet = () => useContext(WalletCtx)
