import { useState } from 'react'
import styled, { keyframes } from 'styled-components'
import { ethers } from 'ethers'
import Modal from '../common/Modal'
import { TokenIcon } from '../common/TokenIcon'
import { BtnGold, Notice } from '../common/Shared'
import { IcoLock, IcoZap } from '../icons/Icons'
import { useWallet } from '../../hooks/useWallet'
import { DEPLOYED } from '../../config/contracts'
import { ERC20_ABI } from '../../abis'

const spin = keyframes`to{transform:rotate(360deg)}`

const Intro    = styled.div`font-size:13px;color:${({ theme }) => theme.t2};margin-bottom:18px;line-height:1.6;`
const Grid     = styled.div`display:flex;flex-direction:column;gap:10px;margin-bottom:18px;`
const TokRow   = styled.div`display:flex;align-items:center;justify-content:space-between;background:${({ theme }) => theme.card};border:1px solid ${({ theme }) => theme.border};border-radius:12px;padding:12px 14px;`
const TokLeft  = styled.div`display:flex;align-items:center;gap:10px;`
const TokName  = styled.div`font-weight:700;font-size:14px;color:${({ theme }) => theme.t1};`
const TokAmt   = styled.div`font-size:12px;color:${({ theme }) => theme.t3};margin-top:2px;`
const ClaimBtn = styled(BtnGold)`padding:7px 16px;border-radius:8px;font-size:13px;`
const Spinner  = styled.div`width:16px;height:16px;border-radius:50%;border:2px solid rgba(9,9,13,.3);border-top-color:#09090D;animation:${spin} .7s linear infinite;`
const StatusTxt = styled.div`font-size:12px;margin-top:4px;color:${({ $ok }) => $ok ? '#22c55e' : '#ef4444'};`
const ClaimAll = styled(BtnGold)`width:100%;padding:12px;border-radius:10px;font-size:14px;margin-bottom:14px;`
const DoneBtn  = styled(BtnGold)`width:100%;padding:12px;border-radius:10px;font-size:14px;`

/**
 * Faucet amounts must fit inside uint64 (max ≈ 1.84 × 10^19).
 *
 * Calculation per token:
 *   uint64_max = 18_446_744_073_709_551_615
 *
 *   cUSDC  6 dec → max humanAmt = 18_446_744_073  (~18 billion)  → use 10_000
 *   cUSDT  6 dec → same                                           → use 10_000
 *   WBTC   8 dec → max humanAmt = 184_467_440     (~184 million) → use 0.05
 *   BNB   18 dec → max humanAmt = 18.44            (~18)          → use 5
 *   ZAMA  18 dec → same as BNB                                    → use 10
 *
 * The old ZAMA amount (500) was 500 × 10^18 = 5×10^20 which OVERFLOWS uint64.
 */
const FAUCET_TOKENS = [
  { sym: 'cUSDC', label: 'Confidential USDC', amount: 10_000, decimals: 6,  key: 'cUSDC' },
  { sym: 'cUSDT', label: 'Confidential USDT', amount: 10_000, decimals: 6,  key: 'cUSDT' },
  { sym: 'WBTC',  label: 'Wrapped Bitcoin',   amount: 0.05,   decimals: 8,  key: 'WBTC'  },
  { sym: 'BNB',   label: 'BNB Token',         amount: 5,      decimals: 18, key: 'BNB'   },
  { sym: 'ZAMA',  label: 'Zama Token',        amount: 10,     decimals: 18, key: 'ZAMA'  },
]

const FaucetModal = ({ onClose, onClaimed }) => {
  const { account, signer, isConnected } = useWallet()
  const [states, setStates] = useState(
    Object.fromEntries(FAUCET_TOKENS.map(t => [t.sym, { status: 'idle', msg: '' }]))
  )

  const set = (sym, status, msg = '') =>
    setStates(prev => ({ ...prev, [sym]: { status, msg } }))

  const claim = async (tok) => {
    if (!isConnected || !account || !signer) return
    const addr = DEPLOYED.TOKENS[tok.key]
    if (!addr || addr === ethers.ZeroAddress) {
      set(tok.sym, 'error', 'Contract not deployed — run deploy script first')
      return
    }
    set(tok.sym, 'loading')
    try {
      const contract = new ethers.Contract(addr, ERC20_ABI, signer)

      // Convert to raw amount then to BigInt for uint64
      // We floor to avoid floating point issues with decimals
      const rawFloat = tok.amount * (10 ** tok.decimals)
      const raw      = BigInt(Math.floor(rawFloat))

      // Safety check — should never happen with our amounts above but just in case
      const UINT64_MAX = BigInt('18446744073709551615')
      if (raw > UINT64_MAX) {
        set(tok.sym, 'error', `Amount too large for uint64. Reduce faucet amount.`)
        return
      }

      const tx = await contract.faucet(account, raw, { gasLimit: 300_000 })
      await tx.wait()
      set(tok.sym, 'done', `+${tok.amount} ${tok.sym} sent to your wallet`)
      onClaimed?.()
    } catch (e) {
      set(tok.sym, 'error', e.reason || e.message || 'Faucet call failed')
    }
  }

  const claimAll = async () => {
    for (const tok of FAUCET_TOKENS) {
      if (states[tok.sym].status !== 'done') await claim(tok)
    }
  }

  const anyLoading = Object.values(states).some(s => s.status === 'loading')
  const allDone    = Object.values(states).every(s => s.status === 'done')

  return (
    <Modal onClose={anyLoading ? undefined : onClose} title="Get Test Tokens" maxW={420}>
      <Intro>
        Claim free Sepolia testnet tokens so you can test swaps, liquidity and vaults.
        Each claim calls the on-chain <code style={{ fontSize: 11 }}>faucet()</code> function
        and costs a small amount of Sepolia ETH for gas.
      </Intro>

      <Notice style={{ marginBottom: 16 }}>
        <span style={{ flexShrink: 0, paddingTop: 1 }}><IcoLock size={13} color="currentColor" /></span>
        Need Sepolia ETH for gas?&nbsp;
        <a href="https://sepoliafaucet.com" target="_blank" rel="noreferrer"
          style={{ color: 'inherit', fontWeight: 700 }}>sepoliafaucet.com</a>
        &nbsp;or&nbsp;
        <a href="https://faucet.quicknode.com/ethereum/sepolia" target="_blank" rel="noreferrer"
          style={{ color: 'inherit', fontWeight: 700 }}>quicknode faucet</a>
      </Notice>

      {!allDone && (
        <ClaimAll disabled={anyLoading || !isConnected} onClick={claimAll}>
          <IcoZap size={13} />
          {anyLoading ? 'Claiming…' : 'Claim All at Once'}
        </ClaimAll>
      )}

      <Grid>
        {FAUCET_TOKENS.map(tok => {
          const st = states[tok.sym]
          return (
            <div key={tok.sym}>
              <TokRow>
                <TokLeft>
                  <TokenIcon sym={tok.sym} size={36} />
                  <div>
                    <TokName>{tok.sym}</TokName>
                    <TokAmt>+{tok.amount} {tok.sym}</TokAmt>
                  </div>
                </TokLeft>
                {st.status === 'done'
                  ? <span style={{ fontSize: 22 }}>✅</span>
                  : <ClaimBtn
                      disabled={st.status === 'loading' || !isConnected || anyLoading}
                      onClick={() => claim(tok)}
                    >
                      {st.status === 'loading' ? <Spinner /> : 'Claim'}
                    </ClaimBtn>
                }
              </TokRow>
              {st.msg && <StatusTxt $ok={st.status === 'done'}>{st.msg}</StatusTxt>}
            </div>
          )
        })}
      </Grid>

      {allDone && (
        <DoneBtn onClick={onClose}>Done — Start Swapping →</DoneBtn>
      )}
    </Modal>
  )
}

export default FaucetModal
