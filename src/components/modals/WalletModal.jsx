import { useState } from 'react'
import styled, { keyframes } from 'styled-components'
import Modal from '../common/Modal'
import { BtnGold, Notice } from '../common/Shared'
import { IcoLock } from '../icons/Icons'
import { useWallet } from '../../hooks/useWallet'

/* ── Animations ── */
const spin     = keyframes`to{transform:rotate(360deg)}`
const pulseDot = keyframes`0%,100%{opacity:1}50%{opacity:.4}`
const checkPop = keyframes`
  0%  { transform:scale(0);   opacity:0; }
  70% { transform:scale(1.2); opacity:1; }
  100%{ transform:scale(1);   opacity:1; }
`

/* ── Wallet list ── */
const WalletGrid = styled.div`display:flex;flex-direction:column;gap:8px;`
const WBtn = styled.button`
  display:flex;align-items:center;gap:14px;
  background:${({ theme }) => theme.card};
  border:1px solid ${({ theme, $dim }) => $dim ? theme.borderLight : theme.border};
  border-radius:14px;padding:14px 16px;
  cursor:${({ $dim }) => $dim ? 'default' : 'pointer'};
  text-align:left;width:100%;
  opacity:${({ $dim }) => $dim ? .45 : 1};
  transition:border-color .15s,background .15s,transform .1s;
  &:hover{
    border-color:${({ theme, $dim }) => $dim ? theme.borderLight : theme.goldbd};
    background:${({ theme, $dim }) => $dim ? theme.card : theme.goldbg};
    transform:${({ $dim }) => $dim ? 'none' : 'translateX(2px)'};
  }
`
const WIcon    = styled.div`width:44px;height:44px;border-radius:12px;background:${({ $bg }) => $bg};display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0;box-shadow:0 2px 8px rgba(0,0,0,.2);`
const WInfo    = styled.div`flex:1;`
const WName    = styled.div`font-weight:700;font-size:14px;color:${({ theme }) => theme.t1};margin-bottom:2px;`
const WDesc    = styled.div`font-size:12px;color:${({ theme }) => theme.t3};`
const WArrow   = styled.div`color:${({ theme }) => theme.t3};font-size:18px;`
const PopBadge = styled.span`background:${({ theme }) => theme.goldbg};color:${({ theme }) => theme.goldt};border:1px solid ${({ theme }) => theme.goldbd};border-radius:4px;padding:1px 6px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;margin-left:8px;`
const DimBadge = styled.span`background:rgba(239,68,68,.08);color:#ef4444;border:1px solid rgba(239,68,68,.2);border-radius:4px;padding:1px 6px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;margin-left:8px;`
const Sep      = styled.div`display:flex;align-items:center;gap:10px;margin:14px 0 10px;&::before,&::after{content:'';flex:1;height:1px;background:${({ theme }) => theme.border};}`
const SepTxt   = styled.span`font-size:11px;color:${({ theme }) => theme.t3};`
const SubNote  = styled.div`text-align:center;font-size:12px;color:${({ theme }) => theme.t3};margin-top:16px;line-height:1.6;`
const SubLink  = styled.a`color:${({ theme }) => theme.goldt};text-decoration:none;&:hover{text-decoration:underline;}`

/* ── Loading ── */
const LoadWrap    = styled.div`display:flex;flex-direction:column;align-items:center;padding:10px 0 6px;`
const Spinner     = styled.div`width:72px;height:72px;border-radius:50%;margin-bottom:24px;border:3px solid ${({ theme }) => theme.border};border-top-color:#F7CB08;animation:${spin} .9s linear infinite;position:relative;`
const SpinInner   = styled.div`position:absolute;inset:8px;border-radius:50%;border:2px solid ${({ theme }) => theme.border};border-bottom-color:${({ theme }) => theme.goldbd};animation:${spin} 1.4s linear infinite reverse;`
const WalletIcoLg = styled.div`position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:26px;`
const LoadTitle   = styled.div`font-size:18px;font-weight:800;color:${({ theme }) => theme.t1};margin-bottom:8px;text-align:center;`
const LoadSub     = styled.div`font-size:13px;color:${({ theme }) => theme.t2};text-align:center;line-height:1.6;margin-bottom:20px;`
const PulseRow    = styled.div`display:flex;gap:5px;align-items:center;margin-bottom:24px;`
const Dot         = styled.div`width:7px;height:7px;border-radius:50%;background:#F7CB08;animation:${pulseDot} 1.4s ease infinite;animation-delay:${({ $d }) => $d};`
const CancelBtn   = styled.button`background:transparent;border:1px solid ${({ theme }) => theme.border};color:${({ theme }) => theme.t2};border-radius:10px;padding:10px 28px;cursor:pointer;font-weight:600;font-family:'Outfit',sans-serif;font-size:13px;transition:border-color .15s,color .15s;&:hover{border-color:${({ theme }) => theme.goldbd};color:${({ theme }) => theme.goldt};}`

/* ── Success ── */
const SuccessWrap  = styled.div`display:flex;flex-direction:column;align-items:center;padding:10px 0 6px;`
const CheckCircle  = styled.div`width:72px;height:72px;border-radius:50%;background:rgba(34,197,94,.12);border:2px solid rgba(34,197,94,.3);display:flex;align-items:center;justify-content:center;font-size:30px;margin-bottom:20px;animation:${checkPop} .4s ease forwards;`
const SuccessTitle = styled.div`font-size:18px;font-weight:800;color:${({ theme }) => theme.t1};margin-bottom:6px;`
const SuccessSub   = styled.div`font-size:13px;color:${({ theme }) => theme.t2};margin-bottom:10px;`
const AddressPill  = styled.div`background:${({ theme }) => theme.card};border:1px solid ${({ theme }) => theme.border};border-radius:8px;padding:8px 16px;font-size:13px;font-weight:700;color:${({ theme }) => theme.goldt};margin-bottom:20px;letter-spacing:.03em;word-break:break-all;text-align:center;`
const DoneBtn      = styled(BtnGold)`padding:12px 40px;border-radius:10px;font-size:14px;`

/* ── Error ── */
const ErrWrap   = styled.div`display:flex;flex-direction:column;align-items:center;padding:10px 0 6px;`
const ErrCircle = styled.div`width:72px;height:72px;border-radius:50%;background:rgba(239,68,68,.1);border:2px solid rgba(239,68,68,.25);display:flex;align-items:center;justify-content:center;font-size:30px;margin-bottom:20px;`
const ErrTitle  = styled.div`font-size:18px;font-weight:800;color:${({ theme }) => theme.t1};margin-bottom:8px;`
const ErrMsg    = styled.div`font-size:13px;color:${({ theme }) => theme.t2};text-align:center;margin-bottom:20px;line-height:1.6;`
const RetryBtn  = styled(BtnGold)`padding:12px 28px;border-radius:10px;font-size:14px;margin-bottom:10px;`
const BackBtn   = styled.button`background:transparent;border:none;color:${({ theme }) => theme.t3};font-size:12px;cursor:pointer;font-family:'Outfit',sans-serif;&:hover{color:${({ theme }) => theme.goldt};}`

/* ── Wallet list ── */
const WALLETS = [
  { id:'metamask',     name:'MetaMask',         desc:'Browser extension wallet',     icon:'🦊', bg:'#F6851B', popular:true,  isInstalled:()=>typeof window!=='undefined'&&!!window.ethereum?.isMetaMask,      url:'https://metamask.io/download/' },
  { id:'rabby',        name:'Rabby Wallet',     desc:'Multi-chain smart wallet',     icon:'🐰', bg:'#8697FF', popular:false, isInstalled:()=>typeof window!=='undefined'&&!!window.ethereum?.isRabby,          url:'https://rabby.io/' },
  { id:'brave',        name:'Brave Wallet',     desc:'Built-in Brave browser wallet',icon:'🦁', bg:'#FF5500', popular:false, isInstalled:()=>typeof window!=='undefined'&&!!window.ethereum?.isBraveWallet,    url:'https://brave.com/wallet/' },
  { id:'coinbase',     name:'Coinbase Wallet',  desc:'Coinbase self-custody wallet', icon:'🔵', bg:'#0052FF', popular:false, isInstalled:()=>typeof window!=='undefined'&&!!window.ethereum?.isCoinbaseWallet, url:'https://www.coinbase.com/wallet/downloads' },
  { id:'walletconnect',name:'WalletConnect',    desc:'Mobile wallet — coming soon',  icon:'🔗', bg:'#3B99FC', popular:false, isInstalled:()=>false, url:null, soon:true },
]

const WalletModal = ({ onClose, onConnected }) => {
  const { connect } = useWallet()
  const [screen,  setScreen]  = useState('list')
  const [wallet,  setWallet]  = useState(null)
  const [address, setAddress] = useState('')
  const [errMsg,  setErrMsg]  = useState('')

  const handleSelect = async (w) => {
    if (w.soon) return
    if (!w.isInstalled()) { window.open(w.url, '_blank'); return }

    setWallet(w)
    setScreen('loading')
    setErrMsg('')

    try {
      /*
       * connect() in useWallet does everything in the right order:
       *   1. wallet_addEthereumChain  (adds Sepolia — safe no-op if exists)
       *   2. wallet_switchEthereumChain (switches to Sepolia)
       *   3. eth_requestAccounts (opens MetaMask permission popup)
       * Do NOT do any chain switching here — let connect() handle it.
       */
      const addr = await connect()
      setAddress(addr)
      setScreen('success')
    } catch (e) {
      if (e.code === 4001) {
        setErrMsg('You rejected the request in your wallet. Click Try Again to retry.')
      } else if (!window.ethereum) {
        setErrMsg('No wallet extension detected. Please install MetaMask first.')
      } else {
        setErrMsg(e.message || 'Connection failed. Please try again.')
      }
      setScreen('error')
    }
  }

  const retry = () => { if (wallet) handleSelect(wallet) }

  const titles = {
    list:    'Connect Wallet',
    loading: 'Connecting…',
    success: 'Wallet Connected!',
    error:   'Connection Failed',
  }

  return (
    <Modal
      onClose={screen === 'loading' ? undefined : onClose}
      title={titles[screen]}
      maxW={420}
    >
      {/* ── LIST ── */}
      {screen === 'list' && (
        <>
          <Notice style={{ marginBottom:16 }}>
            <span style={{ flexShrink:0, paddingTop:1 }}>
              <IcoLock size={13} color="currentColor" />
            </span>
            CipherFlow never stores your private keys. You approve every
            connection directly in your wallet extension.
          </Notice>

          <WalletGrid>
            {WALLETS.map(w => {
              const installed = w.isInstalled()
              return (
                <WBtn
                  key={w.id}
                  $dim={!installed}
                  onClick={() => handleSelect(w)}
                  title={
                    w.soon       ? 'Coming soon' :
                    !installed   ? `Install ${w.name}` :
                    `Connect with ${w.name}`
                  }
                >
                  <WIcon $bg={w.bg}>{w.icon}</WIcon>
                  <WInfo>
                    <WName>
                      {w.name}
                      {w.popular && installed && <PopBadge>Popular</PopBadge>}
                      {w.soon && <DimBadge>Coming Soon</DimBadge>}
                      {!installed && !w.soon && <DimBadge>Install →</DimBadge>}
                    </WName>
                    <WDesc>{w.desc}</WDesc>
                  </WInfo>
                  {installed && !w.soon && <WArrow>›</WArrow>}
                </WBtn>
              )
            })}
          </WalletGrid>

          <Sep><SepTxt>New to crypto wallets?</SepTxt></Sep>
          <SubNote>
            A wallet holds your keys and signs transactions.{' '}
            <SubLink
              href="https://ethereum.org/en/wallets/"
              target="_blank"
              rel="noreferrer"
            >
              Learn more →
            </SubLink>
          </SubNote>
        </>
      )}

      {/* ── LOADING ── */}
      {screen === 'loading' && (
        <LoadWrap>
          <Spinner>
            <SpinInner />
            <WalletIcoLg>{wallet?.icon}</WalletIcoLg>
          </Spinner>
          <LoadTitle>Connecting to {wallet?.name}</LoadTitle>
          <LoadSub>
            Your wallet may show one or two popups — approve each one.
            <br />First to add Sepolia, then to connect your account.
          </LoadSub>
          <PulseRow>
            <Dot $d="0s" /><Dot $d=".2s" /><Dot $d=".4s" />
          </PulseRow>
          <CancelBtn onClick={() => setScreen('list')}>Cancel</CancelBtn>
        </LoadWrap>
      )}

      {/* ── SUCCESS ── */}
      {screen === 'success' && (
        <SuccessWrap>
          <CheckCircle>✓</CheckCircle>
          <SuccessTitle>Connected!</SuccessTitle>
          <SuccessSub>
            Your {wallet?.name} is now linked to CipherFlow on Sepolia
          </SuccessSub>
          <AddressPill>{address}</AddressPill>
          <DoneBtn onClick={() => { onConnected?.(); onClose() }}>
            Start Trading →
          </DoneBtn>
        </SuccessWrap>
      )}

      {/* ── ERROR ── */}
      {screen === 'error' && (
        <ErrWrap>
          <ErrCircle>✕</ErrCircle>
          <ErrTitle>Connection Failed</ErrTitle>
          <ErrMsg>
            {errMsg || `Could not connect to ${wallet?.name}. Please try again.`}
          </ErrMsg>
          <RetryBtn onClick={retry}>Try Again</RetryBtn>
          <BackBtn onClick={() => { setScreen('list'); setErrMsg('') }}>
            ← Choose a different wallet
          </BackBtn>
        </ErrWrap>
      )}
    </Modal>
  )
}

export default WalletModal
