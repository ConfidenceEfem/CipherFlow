import { useState, useEffect } from 'react'
import styled from 'styled-components'
import { PageCenter, BtnGold, BtnGhost, Card2, EncTag, Notice } from '../common/Shared'
import { TokenIcon } from '../common/TokenIcon'
import { IcoLock, IcoSwapDir, IcoSettings, IcoChevronDown, IcoZap } from '../icons/Icons'
import TokenModal from '../modals/TokenModal'
import SettingsModal from '../modals/SettingsModal'
import ConfirmSwapModal from '../modals/ConfirmSwapModal'
import FaucetModal from '../modals/FaucetModal'
import { useWallet } from '../../hooks/useWallet'
import { useTokenBalances } from '../../hooks/useTokenBalances'
import { useSwap } from '../../hooks/useSwap'

/* ── Styled ── */
const Hero      = styled.div`text-align:center;margin-bottom:30px;max-width:500px;`
const HeroTitle = styled.h1`font-size:32px;font-weight:900;letter-spacing:-0.03em;margin-bottom:8px;color:${({ theme }) => theme.t1};`
const HeroSub   = styled.p`color:${({ theme }) => theme.t2};font-size:14px;line-height:1.6;`

const SwapCard  = styled.div`background:${({ theme }) => theme.surface};border:1px solid ${({ theme }) => theme.border};border-radius:22px;padding:20px;width:100%;max-width:476px;`
const CardHead  = styled.div`display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;`
const CardTitle = styled.div`display:flex;align-items:center;gap:10px;font-weight:700;font-size:15px;color:${({ theme }) => theme.t1};`
const HeadRight = styled.div`display:flex;align-items:center;gap:6px;`
const SetBtn    = styled.button`background:${({ theme }) => theme.inp};border:1px solid ${({ theme }) => theme.border};border-radius:8px;padding:7px 9px;cursor:pointer;color:${({ theme }) => theme.t2};display:flex;align-items:center;transition:border-color .15s,color .15s;&:hover{border-color:${({ theme }) => theme.goldbd};color:${({ theme }) => theme.goldt};}`
const FaucetBtn = styled(BtnGhost)`padding:5px 10px;border-radius:8px;font-size:11px;font-weight:700;gap:4px;`

const TokBox    = styled.div`background:${({ theme }) => theme.card};border:1px solid ${({ theme, $focused }) => $focused ? theme.goldbd : theme.border};border-radius:14px;padding:14px 16px;transition:border-color .2s;margin-bottom:4px;`
const BoxTop    = styled.div`display:flex;justify-content:space-between;margin-bottom:8px;`
const BoxLbl    = styled.span`font-size:12px;color:${({ theme }) => theme.t3};`
const BoxBal    = styled.span`font-size:12px;color:${({ theme }) => theme.t3};`
const PrivBal   = styled.span`font-size:12px;color:${({ theme }) => theme.goldt};display:flex;align-items:center;gap:3px;`
const BoxRow    = styled.div`display:flex;align-items:center;gap:10px;`
const NumInput  = styled.input`background:none;border:none;outline:none;font-size:28px;font-weight:800;color:${({ theme }) => theme.t1};width:100%;font-family:'Outfit',sans-serif;&::placeholder{color:${({ theme }) => theme.t3};}&:disabled{opacity:.5;cursor:not-allowed;}`
const UsdHint   = styled.div`font-size:12px;color:${({ theme }) => theme.t3};margin-top:6px;`

const TokSelect = styled.button`display:flex;align-items:center;gap:8px;background:${({ theme }) => theme.inp};border:1px solid ${({ theme }) => theme.border};border-radius:10px;padding:8px 12px;cursor:pointer;flex-shrink:0;transition:border-color .15s;&:hover{border-color:${({ theme }) => theme.goldbd};}`
const TokName   = styled.span`font-weight:700;font-size:14px;color:${({ theme }) => theme.t1};`
const TokChev   = styled.span`color:${({ theme }) => theme.t3};`

const ArrWrap   = styled.div`display:flex;justify-content:center;padding:4px 0;`
const ArrBtn    = styled.button`background:${({ theme }) => theme.card2};border:2px solid ${({ theme }) => theme.border};border-radius:50%;width:38px;height:38px;cursor:pointer;color:${({ theme }) => theme.goldt};display:flex;align-items:center;justify-content:center;transition:transform .25s,border-color .15s;&:hover{transform:rotate(180deg);border-color:${({ theme }) => theme.goldbd};}&:disabled{opacity:.4;cursor:not-allowed;transform:none;}`

const RateCard  = styled(Card2)`margin-bottom:12px;`
const RateRow   = styled.div`display:flex;justify-content:space-between;padding:4px 0;font-size:12px;`
const RK        = styled.span`color:${({ theme }) => theme.t3};`
const RV        = styled.span`font-weight:600;color:${({ theme }) => theme.t1};`

const PreviewBtn   = styled(BtnGold)`width:100%;padding:14px;border-radius:12px;font-size:14px;`
const Footnote     = styled.div`display:flex;align-items:center;gap:6px;color:${({ theme }) => theme.t3};font-size:12px;margin-top:14px;`
const ConnectNote  = styled.div`text-align:center;padding:12px 0 4px;font-size:13px;color:${({ theme }) => theme.t3};`

/* ── Info banner — ETH warning ── */
const InfoBanner = styled.div`
  background:rgba(247,203,8,.08);border:1px solid rgba(247,203,8,.2);
  border-radius:10px;padding:10px 14px;margin-bottom:12px;
  font-size:12px;color:${({ theme }) => theme.goldt};line-height:1.6;
`

/* ── Status bar inside card ── */
const SBar = styled.div`
  border-radius:10px;padding:12px 14px;margin-bottom:12px;
  font-size:13px;font-weight:600;line-height:1.6;
  background:${({ $t }) => $t==='error'?'rgba(239,68,68,.1)':$t==='done'?'rgba(34,197,94,.1)':'rgba(247,203,8,.08)'};
  color:${({ $t }) => $t==='error'?'#ef4444':$t==='done'?'#22c55e':'#F7CB08'};
  border:1px solid ${({ $t }) => $t==='error'?'rgba(239,68,68,.3)':$t==='done'?'rgba(34,197,94,.3)':'rgba(247,203,8,.3)'};
`
const SDetail = styled.div`font-weight:400;font-size:12px;margin-top:4px;opacity:.85;word-break:break-word;`
const SLink   = styled.a`display:block;margin-top:6px;font-size:11px;font-weight:400;color:inherit;text-decoration:underline;`
const SDismiss= styled.button`display:block;margin-top:8px;background:transparent;border:none;font-size:12px;color:inherit;cursor:pointer;font-family:'Outfit',sans-serif;opacity:.7;text-decoration:underline;&:hover{opacity:1;}`

const STATUS_LABELS = {
  approving:  '⏳ Step 1/3 — Approve token spend in your wallet…',
  encrypting: '🔐 Step 2/3 — Encrypting amount via Zama FHE…',
  swapping:   '🔄 Step 3/3 — Submitting encrypted swap on-chain…',
  done:       '✅ Swap complete!',
  error:      '❌ Swap failed',
}

const SwapPage = () => {
  const { isConnected } = useWallet()
  const { tokens, prices, loading: balLoading, refresh } = useTokenBalances()
  const { executeSwap, status, txHash, error: swapError, reset } = useSwap()

  const [fromTok,    setFromTok]    = useState(null)
  const [toTok,      setToTok]      = useState(null)
  const [fromAmt,    setFromAmt]    = useState('')
  const [toAmt,      setToAmt]      = useState('')
  const [focused,    setFocused]    = useState(false)
  const [tokMod,     setTokMod]     = useState(null)
  const [setOpen,    setSetOpen]    = useState(false)
  const [confOpen,   setConfOpen]   = useState(false)
  const [faucetOpen, setFaucetOpen] = useState(false)
  const [slip,       setSlip]       = useState('0.5')
  const [deadline,   setDeadline]   = useState('20')

  // Default pair: cUSDC → cUSDT (confidential tokens, not ETH)
  useEffect(() => {
    if (tokens.length && !fromTok) {
      setFromTok(tokens.find(t => t.sym === 'cUSDC') || tokens[0])
      setToTok(tokens.find(t => t.sym === 'cUSDT')   || tokens[1])
    }
  }, [tokens, fromTok])

  const computeOut = (v, fTok, tTok) => {
    if (!v || !fTok || !tTok || isNaN(parseFloat(v))) { setToAmt(''); return }
    const fromP = prices[fTok.sym] ?? 1
    const toP   = prices[tTok.sym] ?? 1
    if (!toP) return
    setToAmt(((parseFloat(v) * fromP) / toP).toFixed(6))
  }

  const handleAmt = v => {
    setFromAmt(v)
    computeOut(v, fromTok, toTok)
    if (status !== 'idle') reset()
  }

  const swapDir = () => {
    setFromTok(toTok); setToTok(fromTok)
    setFromAmt(toAmt); setToAmt(fromAmt)
  }

  const handleConfirm = () => {
    setConfOpen(false)
    // executeSwap handles its own state — do NOT call reset() here
    executeSwap({ fromTok, toTok, fromAmt }).then(() => {
      setFromAmt(''); setToAmt('')
      refresh()
    })
  }

  if (!fromTok || !toTok) return null

  const usdFrom    = fromAmt ? ((prices[fromTok.sym] ?? 0) * parseFloat(fromAmt)).toFixed(2) : null
  const usdTo      = toAmt   ? ((prices[toTok.sym]   ?? 0) * parseFloat(toAmt)).toFixed(2)   : null
  const isWorking  = ['approving','encrypting','swapping'].includes(status)
  const isEth      = fromTok.sym === 'ETH' || toTok.sym === 'ETH'
  const rateDisplay = prices[fromTok.sym] && prices[toTok.sym]
    ? ((prices[fromTok.sym]) / (prices[toTok.sym])).toFixed(6) : '…'

  const canSwap = fromAmt && isConnected && !isWorking && !isEth

  return (
    <PageCenter>
      {tokMod && (
        <TokenModal
          onClose={() => setTokMod(null)}
          onSelect={t => {
            if (tokMod === 'from') { setFromTok(t); computeOut(fromAmt, t, toTok) }
            else                   { setToTok(t);   computeOut(fromAmt, fromTok, t) }
          }}
          excludeSym={tokMod === 'from' ? toTok.sym : fromTok.sym}
          tokens={tokens}
        />
      )}
      {setOpen && (
        <SettingsModal onClose={() => setSetOpen(false)}
          slip={slip} setSlip={setSlip} deadline={deadline} setDeadline={setDeadline} />
      )}
      {confOpen && (
        <ConfirmSwapModal
          onClose={() => setConfOpen(false)} onConfirm={handleConfirm}
          fromTok={fromTok} toTok={toTok} fromAmt={fromAmt} toAmt={toAmt}
          slip={slip} usdFrom={usdFrom} usdTo={usdTo}
        />
      )}
      {faucetOpen && (
        <FaucetModal onClose={() => setFaucetOpen(false)} onClaimed={refresh} />
      )}

      <Hero>
        <HeroTitle>Private Swaps</HeroTitle>
        <HeroSub>
          Swap confidential tokens on Ethereum Sepolia.
          Amounts are encrypted by Zama FHE — nobody sees what you traded.
        </HeroSub>
      </Hero>

      <SwapCard>
        <CardHead>
          <CardTitle>
            Swap&nbsp;
            <EncTag><IcoLock size={9} color="currentColor" /> FHE Encrypted</EncTag>
          </CardTitle>
          <HeadRight>
            {isConnected && (
              <FaucetBtn onClick={() => setFaucetOpen(true)}>
                <IcoZap size={10} /> Get Test Tokens
              </FaucetBtn>
            )}
            <SetBtn onClick={() => setSetOpen(true)}><IcoSettings size={15} /></SetBtn>
          </HeadRight>
        </CardHead>

        {!isConnected && (
          <ConnectNote>Connect your wallet to start swapping</ConnectNote>
        )}

        {/* Status bar */}
        {status !== 'idle' && (
          <SBar $t={status}>
            {STATUS_LABELS[status]}
            {status === 'error' && swapError && <SDetail>{swapError}</SDetail>}
            {status === 'done' && txHash && (
              <SLink href={`https://sepolia.etherscan.io/tx/${txHash}`} target="_blank" rel="noreferrer">
                View on Etherscan ↗
              </SLink>
            )}
            {(status === 'done' || status === 'error') && (
              <SDismiss onClick={reset}>Dismiss</SDismiss>
            )}
          </SBar>
        )}

        {/* ETH warning */}
        {isEth && fromAmt && (
          <InfoBanner>
            ⚠️ <strong>ETH cannot be swapped directly</strong> — it is a native coin, not
            a confidential token. Use <strong>"Get Test Tokens"</strong> above to claim
            cUSDC, cUSDT, WBTC, BNB or ZAMA, then swap between those.
          </InfoBanner>
        )}

        {/* From */}
        <TokBox $focused={focused}>
          <BoxTop>
            <BoxLbl>You pay</BoxLbl>
            {fromTok.isPrivate
              ? <PrivBal><IcoLock size={10} color="currentColor" /> Balance encrypted</PrivBal>
              : <BoxBal>Bal: {balLoading ? '…' : fromTok.bal} {fromTok.sym}</BoxBal>
            }
          </BoxTop>
          <BoxRow>
            <NumInput
              value={fromAmt}
              onChange={e => handleAmt(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="0.00"
              disabled={isWorking}
            />
            <TokSelect onClick={() => !isWorking && setTokMod('from')}>
              <TokenIcon sym={fromTok.sym} size={22} />
              <TokName>{fromTok.sym}</TokName>
              <TokChev><IcoChevronDown /></TokChev>
            </TokSelect>
          </BoxRow>
          {usdFrom && !fromTok.isPrivate && <UsdHint>≈ ${usdFrom}</UsdHint>}
        </TokBox>

        <ArrWrap>
          <ArrBtn onClick={swapDir} disabled={isWorking}><IcoSwapDir size={15} /></ArrBtn>
        </ArrWrap>

        {/* To */}
        <TokBox style={{ marginBottom: 14 }}>
          <BoxTop>
            <BoxLbl>You receive (estimated)</BoxLbl>
            {toTok.isPrivate
              ? <PrivBal><IcoLock size={10} color="currentColor" /> Balance encrypted</PrivBal>
              : <BoxBal>Bal: {balLoading ? '…' : toTok.bal} {toTok.sym}</BoxBal>
            }
          </BoxTop>
          <BoxRow>
            <NumInput value={toAmt} placeholder="0.00" readOnly style={{ cursor: 'default' }} />
            <TokSelect onClick={() => !isWorking && setTokMod('to')}>
              <TokenIcon sym={toTok.sym} size={22} />
              <TokName>{toTok.sym}</TokName>
              <TokChev><IcoChevronDown /></TokChev>
            </TokSelect>
          </BoxRow>
        </TokBox>

        {/* Rate */}
        {fromAmt && toAmt && !isEth && (
          <RateCard>
            {[
              ['Rate',         `1 ${fromTok.sym} = ${rateDisplay} ${toTok.sym}`],
              ['Price Impact', '< 0.05%'],
              ['Max Slippage', `${slip}%`],
              ['Network',      'Ethereum Sepolia'],
              ['Privacy',      'Zama FHE — amount hidden on-chain'],
            ].map(([k, v]) => (
              <RateRow key={k}><RK>{k}</RK><RV>{v}</RV></RateRow>
            ))}
          </RateCard>
        )}

        <PreviewBtn
          disabled={!canSwap}
          onClick={() => canSwap && setConfOpen(true)}
        >
          {!isConnected      ? 'Connect Wallet to Swap'
           : isEth           ? 'Select a confidential token (not ETH)'
           : isWorking       ? 'Processing…'
           : fromAmt         ? 'Preview Swap →'
           : 'Enter an Amount'}
        </PreviewBtn>
      </SwapCard>

      <Footnote>
        <IcoLock size={11} color="currentColor" />
        Your swap amount is encrypted before leaving your browser
      </Footnote>
    </PageCenter>
  )
}

export default SwapPage
