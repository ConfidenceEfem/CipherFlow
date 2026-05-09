import { useState, useEffect } from 'react'
import styled, { keyframes } from 'styled-components'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAppTheme } from '../../context/ThemeContext'
import { useWallet } from '../../hooks/useWallet'
import { IcoLock, IcoSun, IcoMoon, IcoZap, IcoWallet } from '../icons/Icons'
import { EncTag, BtnGold, IconBtn, LiveDot } from '../common/Shared'
import WalletModal from '../modals/WalletModal'
import { DEPLOYED } from '../../config/contracts'
import { getContract } from '../../services/web3'
import { POOL_ABI, VAULT_ABI } from '../../abis'

const pulse = keyframes`0%,100%{opacity:1}50%{opacity:.5}`

/* ── Nav shell ── */
const Nav   = styled.nav`background:${({ theme }) => theme.surface};border-bottom:1px solid ${({ theme }) => theme.border};position:sticky;top:0;z-index:100;`
const Inner = styled.div`display:flex;align-items:center;padding:0 28px;height:64px;gap:12px;max-width:1280px;margin:0 auto;`

/* ── Logo ── */
const Logo       = styled.div`display:flex;align-items:center;gap:10px;cursor:pointer;margin-right:20px;flex-shrink:0;`
const LogoIcon   = styled.div`width:36px;height:36px;background:#F7CB08;border-radius:10px;display:flex;align-items:center;justify-content:center;`
const LogoText   = styled.span`font-weight:900;font-size:19px;letter-spacing:-0.03em;color:${({ theme }) => theme.t1};`
const LogoAccent = styled.span`color:${({ theme }) => theme.goldt};`

/* ── Nav links ── */
const NavLinks = styled.div`display:flex;gap:4px;flex:1;`
const NavBtn   = styled.button`
  background:${({ theme, $active }) => $active ? theme.goldbg : 'transparent'};
  border:1px solid ${({ theme, $active }) => $active ? theme.goldbd : 'transparent'};
  border-radius:8px;padding:7px 15px;cursor:pointer;
  font-weight:${({ $active }) => $active ? '700' : '500'};
  font-size:13px;font-family:'Outfit',sans-serif;
  color:${({ theme, $active }) => $active ? theme.goldt : theme.t2};
  transition:all .15s;
  &:hover{color:${({ theme }) => theme.goldt};background:${({ theme }) => theme.goldbg};}
`

/* ── Right side ── */
const NavRight   = styled.div`display:flex;align-items:center;gap:8px;margin-left:auto;`
const ConnectBtn = styled(BtnGold)`padding:9px 18px;border-radius:10px;font-size:13px;`

/* ── Connected wallet pill ── */
const ConnectedPill = styled.button`
  display:flex;align-items:center;gap:8px;
  background:rgba(34,197,94,.08);
  border:1px solid rgba(34,197,94,.25);
  border-radius:10px;padding:7px 14px;cursor:pointer;
  transition:border-color .15s,background .15s;
  &:hover{border-color:rgba(34,197,94,.5);background:rgba(34,197,94,.12);}
`
const GreenDot       = styled.div`width:7px;height:7px;border-radius:50%;background:#22c55e;animation:${pulse} 2.5s infinite;flex-shrink:0;`
const AddrText       = styled.span`font-size:12px;font-weight:700;color:#22c55e;font-family:'Outfit',sans-serif;`
const DisconnectHint = styled.span`font-size:10px;color:rgba(34,197,94,.6);`

/* ── Wrong network pill ── */
const WrongNetPill = styled.button`
  display:flex;align-items:center;gap:6px;
  background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.3);
  border-radius:10px;padding:7px 14px;cursor:pointer;font-size:12px;
  font-weight:700;color:#ef4444;font-family:'Outfit',sans-serif;
  &:hover{background:rgba(239,68,68,.15);}
`

/* ── Stats bar ── */
const StatsBar  = styled.div`background:${({ theme }) => theme.bg};border-bottom:1px solid ${({ theme }) => theme.borderLight};padding:5px 28px;display:flex;gap:24px;align-items:center;overflow-x:auto;`
const StatItem  = styled.div`display:flex;align-items:center;gap:7px;font-size:12px;white-space:nowrap;`
const StatLabel = styled.span`color:${({ theme }) => theme.t3};`
const StatVal   = styled.span`font-weight:600;color:${({ theme }) => theme.t1};`
const LiveRow   = styled.div`margin-left:auto;display:flex;align-items:center;gap:6px;`
const LiveTxt   = styled.span`font-size:12px;color:#22c55e;font-weight:600;`

const NAV_LINKS = [
  { path:'/swap',      label:'Swap'      },
  { path:'/liquidity', label:'Liquidity' },
  { path:'/vault',     label:'Vaults'    },
]

const short = addr => addr ? `${addr.slice(0,6)}…${addr.slice(-4)}` : ''

// ── Live stats hook ────────────────────────────────────────────────────────
function useLiveStats() {
  const [stats, setStats] = useState({
    totalDepositors: '…',
    totalVaultDepositors: '…',
    network: 'Sepolia',
  })

  useEffect(() => {
    async function fetch() {
      try {
        let totalPoolDepositors = 0
        let totalVaultDepositors = 0

        // Sum depositors across all pools
        await Promise.all(
          DEPLOYED.POOLS.map(async (addr) => {
            try {
              const pool = await getContract(addr, POOL_ABI, false)
              const d = await pool.totalDepositors()
              totalPoolDepositors += Number(d)
            } catch {}
          })
        )

        // Sum depositors across all vaults
        await Promise.all(
          DEPLOYED.VAULTS.map(async (addr) => {
            try {
              const vault = await getContract(addr, VAULT_ABI, false)
              const d = await vault.totalDepositors()
              totalVaultDepositors += Number(d)
            } catch {}
          })
        )

        setStats({
          totalDepositors:      totalPoolDepositors,
          totalVaultDepositors: totalVaultDepositors,
          network: 'Sepolia Testnet',
        })
      } catch {}
    }

    fetch()
    const id = setInterval(fetch, 30_000)
    return () => clearInterval(id)
  }, [])

  return stats
}

// ─────────────────────────────────────────────────────────────────────────────
const Navbar = () => {
  const { isDark, toggle } = useAppTheme()
  const navigate     = useNavigate()
  const { pathname } = useLocation()
  const { account, chainId, isConnected, disconnect } = useWallet()
  const [walletOpen, setWalletOpen] = useState(false)
  const liveStats = useLiveStats()

  const onSepolia = chainId === 11155111
  const wrongNet  = isConnected && !onSepolia

  // Live stats bar items — real data from on-chain
  const STATS_BAR = [
    { label: 'Pool LPs',       value: liveStats.totalDepositors === '…' ? '…' : String(liveStats.totalDepositors)      },
    { label: 'Vault LPs',      value: liveStats.totalVaultDepositors === '…' ? '…' : String(liveStats.totalVaultDepositors) },
    { label: 'TVL',            value: '🔒 Encrypted'   },
    { label: 'Volume',         value: '🔒 Encrypted'   },
    { label: 'Network',        value: liveStats.network },
  ]

  return (
    <>
      {walletOpen && (
        <WalletModal
          onClose={() => setWalletOpen(false)}
          onConnected={() => setWalletOpen(false)}
        />
      )}

      <Nav>
        <Inner>
          {/* Logo */}
          <Logo onClick={() => navigate('/swap')}>
            <LogoIcon><IcoLock size={18} color="#09090D" /></LogoIcon>
            <LogoText>Cipher<LogoAccent>Flow</LogoAccent></LogoText>
          </Logo>

          {/* Nav links */}
          <NavLinks>
            {NAV_LINKS.map(({ path, label }) => (
              <NavBtn
                key={path}
                $active={pathname === path || (pathname === '/' && path === '/swap')}
                onClick={() => navigate(path)}
              >
                {label}
              </NavBtn>
            ))}
          </NavLinks>

          {/* Right side */}
          <NavRight>
            <IconBtn onClick={toggle} title={isDark ? 'Light Mode' : 'Dark Mode'}>
              {isDark ? <IcoSun /> : <IcoMoon />}
            </IconBtn>

            <EncTag><IcoZap size={10} />&nbsp;Zama FHE</EncTag>

            {wrongNet && (
              <WrongNetPill onClick={() => window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: '0xaa36a7' }],
              })}>
                ⚠ Switch to Sepolia
              </WrongNetPill>
            )}

            {isConnected && onSepolia ? (
              <ConnectedPill onClick={disconnect} title="Click to disconnect">
                <GreenDot />
                <div>
                  <AddrText>{short(account)}</AddrText><br />
                  <DisconnectHint>Click to disconnect</DisconnectHint>
                </div>
              </ConnectedPill>
            ) : !isConnected ? (
              <ConnectBtn onClick={() => setWalletOpen(true)}>
                <IcoWallet size={14} /> Connect Wallet
              </ConnectBtn>
            ) : null}
          </NavRight>
        </Inner>

        {/* Live stats bar */}
        <StatsBar>
          {STATS_BAR.map(({ label, value }) => (
            <StatItem key={label}>
              <StatLabel>{label}</StatLabel>
              <StatVal>{value}</StatVal>
            </StatItem>
          ))}
          <LiveRow>
            <LiveDot /><LiveTxt>Live · Sepolia</LiveTxt>
          </LiveRow>
        </StatsBar>
      </Nav>
    </>
  )
}

export default Navbar