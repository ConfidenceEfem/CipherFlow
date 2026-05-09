import { useState } from 'react'
import styled from 'styled-components'
import { ethers } from 'ethers'
import Modal from '../common/Modal'
import { TokenIcon } from '../common/TokenIcon'
import { Card, BtnGold, Notice, Spacer } from '../common/Shared'
import { IcoLock } from '../icons/Icons'
import { useWallet } from '../../hooks/useWallet'
import { encryptAmount } from '../../services/fhevm'
import { DEPLOYED } from '../../config/contracts'
import { POOL_ABI, ERC20_ABI } from '../../abis'

/* ── Styled ── */
const SLabel     = styled.div`font-size:11px;font-weight:700;color:${({ theme }) => theme.t3};text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px;`
const FeeRow     = styled.div`display:flex;gap:7px;margin-bottom:18px;`
const FeeBtn     = styled.button`flex:1;padding:8px 4px;border-radius:8px;cursor:pointer;font-weight:700;font-size:12px;font-family:'Outfit',sans-serif;border:1px solid ${({ theme, $active }) => $active ? theme.goldbd : theme.border};background:${({ theme, $active }) => $active ? theme.goldbg : theme.inp};color:${({ theme, $active }) => $active ? theme.goldt : theme.t2};transition:all .15s;&:hover{border-color:${({ theme }) => theme.goldbd};}`
const RangeHdr   = styled.div`display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;`
const RangeRow   = styled.div`display:flex;gap:6px;`
const RangeBtn   = styled.button`padding:4px 12px;border-radius:6px;cursor:pointer;font-size:12px;font-weight:600;font-family:'Outfit',sans-serif;transition:all .15s;border:1px solid ${({ theme, $active }) => $active ? theme.goldbd : theme.border};background:${({ theme, $active }) => $active ? theme.goldbg : 'transparent'};color:${({ theme, $active }) => $active ? theme.goldt : theme.t3};`
const PriceBoxes = styled.div`display:flex;gap:10px;margin-top:10px;`
const PriceBox   = styled(Card)`flex:1;text-align:center;padding:12px;`
const PriceLbl   = styled.div`font-size:11px;color:${({ theme }) => theme.t3};margin-bottom:6px;`
const PriceNum   = styled.div`font-size:20px;font-weight:800;color:${({ theme }) => theme.t1};`
const PriceSub   = styled.div`font-size:11px;color:${({ theme }) => theme.t3};margin-top:4px;`
const DepBox     = styled(Card)`display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;`
const DepInput   = styled.input`background:none;border:none;font-size:20px;font-weight:800;color:${({ theme }) => theme.t1};width:100%;outline:none;font-family:'Outfit',sans-serif;&::placeholder{color:${({ theme }) => theme.t3};}`
const TokPill    = styled.div`display:flex;align-items:center;gap:8px;flex-shrink:0;`
const TokName    = styled.span`font-weight:700;color:${({ theme }) => theme.t1};`
const ConfBtn    = styled(BtnGold)`width:100%;padding:13px;border-radius:12px;font-size:14px;`
const StatusBar  = styled.div`padding:10px 14px;border-radius:10px;font-size:12px;font-weight:600;text-align:center;margin-bottom:12px;background:${({ $err }) => $err ? 'rgba(239,68,68,.1)' : 'rgba(247,203,8,.08)'};color:${({ $err }) => $err ? '#ef4444' : '#F7CB08'};border:1px solid ${({ $err }) => $err ? 'rgba(239,68,68,.25)' : 'rgba(247,203,8,.25)'};`

const FEE_TIERS  = ['0.01%','0.05%','0.30%','1.00%']
const RANGE_OPTS = ['Full','Safe','Narrow']

const DECIMALS_MAP = { cUSDC: 6, cUSDT: 6, WBTC: 8, BNB: 8, ZAMA: 8 }
const UINT64_MAX   = (2n ** 64n) - 1n

function parseAmountToBigInt(amountStr, decimals) {
  const [whole, frac = ''] = amountStr.split('.')
  const fracPadded = frac.padEnd(decimals, '0').slice(0, decimals)
  return BigInt(whole) * (10n ** BigInt(decimals)) + BigInt(fracPadded)
}

/**
 * AddLiquidityModal
 *
 * IMPORTANT: Does NOT call useFhevm() itself.
 * fhevmReady is passed as a prop from LiquidityPage which holds the
 * single useFhevm() instance. Calling useFhevm() inside a modal that
 * mounts/unmounts causes a second FHE init that races with the existing
 * one, making the modal permanently stuck on "Initialising FHE…".
 */
const AddLiquidityModal = ({ onClose, pool, fhevmReady }) => {
  const { account, signer, isConnected } = useWallet()

  const [fee,    setFee]    = useState('0.30%')
  const [range,  setRange]  = useState('Full')
  const [amt0,   setAmt0]   = useState('')
  const [amt1,   setAmt1]   = useState('')
  const [status, setStatus] = useState('idle')
  const [errMsg, setErrMsg] = useState('')

  const t0 = pool?.t0 || 'cUSDC'
  const t1 = pool?.t1 || 'cUSDT'

  const addrOf = sym => DEPLOYED.TOKENS[sym] || ethers.ZeroAddress

  const STATUS_LABELS = {
    approving:  '⏳ Approving tokens with encrypted allowance…',
    encrypting: '🔐 Encrypting amounts with Zama FHE…',
    submitting: '🔄 Submitting to pool contract…',
    done:       '✅ Liquidity added!',
    error:      `❌ ${errMsg}`,
  }

  const handleAdd = async () => {
    if (!isConnected || !signer || !fhevmReady) return
    if (!amt0 || !amt1) return

    const poolAddr   = pool?.address
    const token0Addr = addrOf(t0)
    const token1Addr = addrOf(t1)

    if (!poolAddr || poolAddr === ethers.ZeroAddress) {
      setErrMsg('Pool address not found — deploy contracts first')
      setStatus('error')
      return
    }

    setStatus('approving')
    setErrMsg('')

    try {
      const dec0 = DECIMALS_MAP[t0] ?? 6
      const dec1 = DECIMALS_MAP[t1] ?? 6
      const raw0 = parseAmountToBigInt(amt0, dec0)
      const raw1 = parseAmountToBigInt(amt1, dec1)

      if (raw0 === 0n || raw1 === 0n) throw new Error('Amount too small — rounds to zero on-chain.')

      const checksummedAccount = ethers.getAddress(account)
      const checksummedPool    = ethers.getAddress(poolAddr)

      // ── Step 1: Approve both tokens ──────────────────────────────────────
      // Proof targets each token contract (approve is called directly by user)
      const [encApprove0, encApprove1] = await Promise.all([
        encryptAmount(UINT64_MAX, token0Addr, checksummedAccount),
        encryptAmount(UINT64_MAX, token1Addr, checksummedAccount),
      ])

      const tok0 = new ethers.Contract(token0Addr, ERC20_ABI, signer)
      const tok1 = new ethers.Contract(token1Addr, ERC20_ABI, signer)

      await (await tok0.approve(checksummedPool, encApprove0.handle, encApprove0.inputProof)).wait()
      await (await tok1.approve(checksummedPool, encApprove1.handle, encApprove1.inputProof)).wait()

      // ── Step 2: Encrypt deposit amounts ──────────────────────────────────
      // Four proofs needed — two per token:
      //   enc*ForPool  — proof targets pool contract  (pool calls FHE.fromExternal)
      //   enc*ForToken — proof targets token contract, userAddress = POOL ADDRESS
      //                  because when pool calls token.transferFrom(), msg.sender
      //                  inside the token is the pool contract, not the user wallet
      setStatus('encrypting')
      const [enc0ForPool, enc0ForToken, enc1ForPool, enc1ForToken] = await Promise.all([
        encryptAmount(raw0, checksummedPool, checksummedAccount),  // user calls addLiquidity
        encryptAmount(raw0, token0Addr,      checksummedPool),     // pool calls transferFrom on token0
        encryptAmount(raw1, checksummedPool, checksummedAccount),  // user calls addLiquidity
        encryptAmount(raw1, token1Addr,      checksummedPool),     // pool calls transferFrom on token1
      ])

      // ── Step 3: addLiquidity ─────────────────────────────────────────────
      setStatus('submitting')
      const poolContract = new ethers.Contract(checksummedPool, POOL_ABI, signer)
      const tx = await poolContract.addLiquidity(
        enc0ForPool.handle,  enc0ForPool.inputProof,
        enc0ForToken.handle, enc0ForToken.inputProof,
        enc1ForPool.handle,  enc1ForPool.inputProof,
        enc1ForToken.handle, enc1ForToken.inputProof,
        { gasLimit: 1_500_000 }
      )
      await tx.wait()
      setStatus('done')

    } catch (e) {
      console.error('[addLiquidity error]', e)
      setErrMsg(e.reason || e.message || 'Transaction failed')
      setStatus('error')
    }
  }

  const isSubmitting = ['approving','encrypting','submitting'].includes(status)

  return (
    <Modal
      onClose={isSubmitting ? undefined : onClose}
      title={pool?.t0 ? `Add Liquidity — ${t0}/${t1}` : 'Add Liquidity'}
      maxW={460}
    >
      <SLabel>Fee Tier</SLabel>
      <FeeRow>
        {FEE_TIERS.map(f => (
          <FeeBtn key={f} $active={fee===f} onClick={() => setFee(f)}>{f}</FeeBtn>
        ))}
      </FeeRow>

      <RangeHdr>
        <SLabel style={{ marginBottom:0 }}>Price Range</SLabel>
        <RangeRow>
          {RANGE_OPTS.map(r => (
            <RangeBtn key={r} $active={range===r} onClick={() => setRange(r)}>{r}</RangeBtn>
          ))}
        </RangeRow>
      </RangeHdr>
      <PriceBoxes>
        {['Min Price','Max Price'].map(lbl => (
          <PriceBox key={lbl}>
            <PriceLbl>{lbl}</PriceLbl>
            <PriceNum>{lbl==='Min Price' ? '0' : '∞'}</PriceNum>
            <PriceSub>{t1} per {t0}</PriceSub>
          </PriceBox>
        ))}
      </PriceBoxes>

      <Spacer $h={18} />

      <SLabel>Deposit Amounts</SLabel>
      {[[t0,amt0,setAmt0],[t1,amt1,setAmt1]].map(([sym, val, set]) => (
        <DepBox key={sym}>
          <DepInput
            value={val}
            onChange={e => set(e.target.value)}
            placeholder="0.00"
            disabled={isSubmitting}
          />
          <TokPill>
            <TokenIcon sym={sym} size={24} />
            <TokName>{sym}</TokName>
          </TokPill>
        </DepBox>
      ))}

      <Spacer $h={14} />

      {status !== 'idle' && (
        <StatusBar $err={status==='error'}>
          {STATUS_LABELS[status]}
        </StatusBar>
      )}

      <Notice style={{ marginBottom:16 }}>
        <span style={{ flexShrink:0, paddingTop:1 }}>
          <IcoLock size={13} color="currentColor" />
        </span>
        Your LP position is encrypted on-chain via Zama FHE.
        Only you can read your share amount.
      </Notice>

      {status === 'done' ? (
        <ConfBtn onClick={onClose}>Close</ConfBtn>
      ) : (
        <ConfBtn
          disabled={!isConnected || !fhevmReady || !amt0 || !amt1 || isSubmitting}
          onClick={handleAdd}
        >
          {!isConnected ? 'Connect Wallet First'
            : !fhevmReady ? 'Initialising FHE…'
            : isSubmitting ? 'Processing…'
            : 'Add Liquidity'}
        </ConfBtn>
      )}
    </Modal>
  )
}

export default AddLiquidityModal