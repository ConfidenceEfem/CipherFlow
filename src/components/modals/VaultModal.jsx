import { useState } from 'react'
import styled from 'styled-components'
import { ethers } from 'ethers'
import Modal from '../common/Modal'
import { TokenIcon } from '../common/TokenIcon'
import { Card, BtnGold, BtnGhost, Notice, TabBtn, Spacer } from '../common/Shared'
import { IcoLock } from '../icons/Icons'
import { useWallet } from '../../hooks/useWallet'
import { encryptAmount } from '../../services/fhevm'
import { DEPLOYED } from '../../config/contracts'
import { VAULT_ABI, ERC20_ABI } from '../../abis'

/* ── Styled ── */
const TabRow      = styled.div`display:flex;gap:8px;margin-bottom:18px;`
const StatsRow    = styled.div`display:flex;gap:8px;margin-bottom:18px;`
const StatBox     = styled(Card)`flex:1;text-align:center;padding:10px 8px;`
const StatLbl     = styled.div`font-size:11px;color:${({ theme }) => theme.t3};margin-bottom:4px;`
const StatVal     = styled.div`font-size:13px;font-weight:800;color:${({ theme, $gold }) => $gold ? theme.goldt : theme.t1};`
const AmtCard     = styled(Card)`margin-bottom:14px;`
const AmtHdr      = styled.div`display:flex;justify-content:space-between;margin-bottom:10px;`
const AmtLbl      = styled.span`font-size:12px;color:${({ theme }) => theme.t3};`
const BalHint     = styled.span`font-size:12px;color:${({ theme }) => theme.t3};`
const AmtRow      = styled.div`display:flex;align-items:center;justify-content:space-between;`
const AmtInput    = styled.input`background:none;border:none;font-size:22px;font-weight:800;color:${({ theme }) => theme.t1};width:100%;outline:none;font-family:'Outfit',sans-serif;&::placeholder{color:${({ theme }) => theme.t3};}&:disabled{opacity:.5;}`
const MaxBtn      = styled.button`background:${({ theme }) => theme.goldbg};border:1px solid ${({ theme }) => theme.goldbd};color:${({ theme }) => theme.goldt};border-radius:5px;padding:3px 8px;font-size:11px;font-weight:700;cursor:pointer;font-family:'Outfit',sans-serif;`
const TokPill     = styled.div`display:flex;align-items:center;gap:8px;flex-shrink:0;`
const TokName     = styled.span`font-weight:700;color:${({ theme }) => theme.t1};`
const ActionBtn   = styled(BtnGold)`width:100%;padding:13px;border-radius:12px;font-size:14px;`
const WithdrawBtn = styled(BtnGhost)`width:100%;padding:13px;border-radius:12px;font-size:14px;border-color:${({ theme }) => theme.goldbd};color:${({ theme }) => theme.goldt};`
const StatusBar   = styled.div`padding:10px 14px;border-radius:10px;font-size:12px;font-weight:600;text-align:center;margin-bottom:12px;background:${({ $err, $ok }) => $err ? 'rgba(239,68,68,.1)' : $ok ? 'rgba(34,197,94,.1)' : 'rgba(247,203,8,.08)'};color:${({ $err, $ok }) => $err ? '#ef4444' : $ok ? '#22c55e' : '#F7CB08'};border:1px solid ${({ $err, $ok }) => $err ? 'rgba(239,68,68,.25)' : $ok ? 'rgba(34,197,94,.25)' : 'rgba(247,203,8,.25)'};`

const UINT64_MAX = (2n ** 64n) - 1n
const DECIMALS_MAP = { cUSDC: 6, cUSDT: 6, WBTC: 8, BNB: 8, ZAMA: 8 }

function parseAmountToBigInt(amountStr, decimals) {
  const [whole, frac = ''] = amountStr.split('.')
  const fracPadded = frac.padEnd(decimals, '0').slice(0, decimals)
  return BigInt(whole) * (10n ** BigInt(decimals)) + BigInt(fracPadded)
}

/**
 * VaultModal
 *
 * FIX 1: approve() now uses encryptAmount — the token contract's approve()
 *         takes (address, bytes32 handle, bytes proof), NOT a plain BigInt.
 *         Passing ethers.MaxUint256 directly caused "no matching fragment".
 *
 * FIX 2: deposit() now passes 4 args — (encForVault, proofForVault,
 *         encForToken, proofForToken). The old code passed only 2.
 *
 * FIX 3: encForToken uses vaultAddr as userAddress, NOT the user wallet.
 *         When vault calls token.transferFrom(), msg.sender inside the
 *         token is the vault contract — the proof must match that.
 *
 * FIX 4: useFhevm() removed — fhevmReady passed as prop from VaultPage
 *         to avoid double-init stuck loading issue.
 */
const VaultModal = ({ onClose, vault, fhevmReady }) => {
  const { account, signer, isConnected } = useWallet()

  const [tab,    setTab]    = useState(vault?._tab || 'deposit')
  const [amt,    setAmt]    = useState('')
  const [status, setStatus] = useState('idle')
  const [errMsg, setErrMsg] = useState('')

  if (!vault) return null

  const STATUS_LABELS = {
    approving:   '⏳ Approving token for vault…',
    encrypting:  '🔐 Encrypting deposit via Zama FHE…',
    submitting:  '🔄 Sending to vault contract…',
    withdrawing: '🔄 Processing withdrawal…',
    done:        tab === 'deposit' ? '✅ Deposit successful!' : '✅ Withdrawal successful!',
    error:       `❌ ${errMsg}`,
  }

  const handleDeposit = async () => {
    if (!isConnected || !signer || !fhevmReady || !amt) return
    setStatus('approving')
    setErrMsg('')

    try {
      const decimals   = DECIMALS_MAP[vault.asset] ?? 6
      const rawBigInt  = parseAmountToBigInt(amt, decimals)
      if (rawBigInt === 0n) throw new Error('Amount too small — rounds to zero on-chain.')
      if (rawBigInt > UINT64_MAX) throw new Error('Amount too large for uint64.')

      const assetAddr  = DEPLOYED.TOKENS[vault.asset]
      if (!assetAddr || assetAddr === ethers.ZeroAddress) {
        throw new Error(`Token address for ${vault.asset} not found in contracts.js`)
      }

      const checksummedAccount = ethers.getAddress(account)
      const checksummedVault   = ethers.getAddress(vault.address)

      // ── Step 1: Approve ─────────────────────────────────────────────────
      // FIX 1: approve() takes (address, bytes32 handle, bytes proof)
      // Must use encryptAmount — plain BigInt is NOT accepted.
      // Proof targets assetAddr (token contract), userAddress = user wallet
      // because the user is calling approve() directly.
      const encForApprove = await encryptAmount(UINT64_MAX, assetAddr, checksummedAccount)
      const tokenContract = new ethers.Contract(assetAddr, ERC20_ABI, signer)
      await (await tokenContract.approve(
        checksummedVault,
        encForApprove.handle,
        encForApprove.inputProof,
      )).wait()
      console.log('[vault] approved ✓')

      // ── Step 2: Encrypt deposit amounts ─────────────────────────────────
      // FIX 2 + 3: Two separate proofs needed:
      //   encForVault  — contractAddress=vaultAddr, userAddress=user wallet
      //                  (user is msg.sender when calling deposit())
      //   encForToken  — contractAddress=assetAddr, userAddress=vaultAddr
      //                  (vault is msg.sender when it calls transferFrom())
      setStatus('encrypting')
      const [encForVault, encForToken] = await Promise.all([
        encryptAmount(rawBigInt, checksummedVault, checksummedAccount),
        encryptAmount(rawBigInt, assetAddr,        checksummedVault),
      ])
      console.log('[vault] encrypted ✓')

      // ── Step 3: Deposit ──────────────────────────────────────────────────
      // FIX 2: deposit() takes 4 args not 2
      setStatus('submitting')
      const vaultContract = new ethers.Contract(checksummedVault, VAULT_ABI, signer)
      await (await vaultContract.deposit(
        encForVault.handle,
        encForVault.inputProof,
        encForToken.handle,
        encForToken.inputProof,
        { gasLimit: 800_000 },
      )).wait()

      console.log('[vault] deposit confirmed ✓')
      setStatus('done')

    } catch (e) {
      console.error('[vault deposit error]', e)
      setErrMsg(e.reason || e.message || 'Transaction failed')
      setStatus('error')
    }
  }

  const handleWithdraw = async () => {
    if (!isConnected || !signer) return
    setStatus('withdrawing')
    setErrMsg('')
    try {
      const vaultContract = new ethers.Contract(
        ethers.getAddress(vault.address), VAULT_ABI, signer
      )
      await (await vaultContract.withdraw({ gasLimit: 600_000 })).wait()
      setStatus('done')
    } catch (e) {
      console.error('[vault withdraw error]', e)
      setErrMsg(e.reason || e.message || 'Transaction failed')
      setStatus('error')
    }
  }

  const isSubmitting = ['approving','encrypting','submitting','withdrawing'].includes(status)

  return (
    <Modal
      onClose={isSubmitting ? undefined : onClose}
      title={vault.name}
      maxW={420}
    >
      {/* Tabs */}
      <TabRow>
        {['deposit','withdraw'].map(a => (
          <TabBtn
            key={a} $active={tab === a}
            onClick={() => { setTab(a); setStatus('idle'); setAmt('') }}
            style={{ flex:1, fontSize:14, padding:'9px' }}
          >
            {a.charAt(0).toUpperCase() + a.slice(1)}
          </TabBtn>
        ))}
      </TabRow>

      {/* Stats */}
      <StatsRow>
        {[
          ['APY',        vault.apy + '%',             true ],
          ['Depositors', String(vault.depositors || 0), false],
          ['Strategy',   vault.strategy,               false],
        ].map(([l, v, gold]) => (
          <StatBox key={l}>
            <StatLbl>{l}</StatLbl>
            <StatVal $gold={gold}>{v}</StatVal>
          </StatBox>
        ))}
      </StatsRow>

      {/* Amount input */}
      {tab === 'deposit' && (
        <AmtCard>
          <AmtHdr>
            <AmtLbl>Amount to deposit</AmtLbl>
            <BalHint>Asset: {vault.asset}</BalHint>
          </AmtHdr>
          <AmtRow>
            <AmtInput
              value={amt}
              onChange={e => setAmt(e.target.value)}
              placeholder="0.00"
              disabled={isSubmitting}
            />
            <TokPill>
              <MaxBtn onClick={() => setAmt('10')}>MAX</MaxBtn>
              <TokenIcon sym={vault.asset} size={24} />
              <TokName>{vault.asset}</TokName>
            </TokPill>
          </AmtRow>
        </AmtCard>
      )}

      {tab === 'withdraw' && (
        <AmtCard>
          <AmtHdr>
            <AmtLbl>Your encrypted balance</AmtLbl>
            <BalHint>Full withdrawal</BalHint>
          </AmtHdr>
          <AmtRow>
            <div style={{ fontSize:18, fontWeight:700, opacity:.5 }}>
              <IcoLock size={14} color="currentColor" style={{ marginRight:6 }} />
              Encrypted via FHE
            </div>
            <TokPill>
              <TokenIcon sym={vault.asset} size={24} />
              <TokName>{vault.asset}</TokName>
            </TokPill>
          </AmtRow>
        </AmtCard>
      )}

      {/* Status */}
      {status !== 'idle' && (
        <StatusBar $err={status === 'error'} $ok={status === 'done'}>
          {STATUS_LABELS[status]}
        </StatusBar>
      )}

      <Notice style={{ marginBottom:16 }}>
        <span style={{ flexShrink:0, paddingTop:1 }}>
          <IcoLock size={13} color="currentColor" />
        </span>
        {tab === 'deposit'
          ? 'Your deposit is encrypted by Zama FHE before reaching the vault. Nobody can see how much you deposited.'
          : 'Your full balance + simulated yield will be returned. Amount is decrypted only for you.'}
      </Notice>

      {status === 'done' ? (
        <ActionBtn onClick={onClose}>Done</ActionBtn>
      ) : tab === 'deposit' ? (
        <ActionBtn
          disabled={!isConnected || !fhevmReady || !amt || isSubmitting}
          onClick={handleDeposit}
        >
          {!isConnected   ? 'Connect Wallet First'
            : !fhevmReady ? 'Initialising FHE…'
            : isSubmitting ? 'Processing…'
            : 'Deposit to Vault'}
        </ActionBtn>
      ) : (
        <WithdrawBtn
          disabled={!isConnected || isSubmitting}
          onClick={handleWithdraw}
        >
          {isSubmitting ? 'Processing…' : 'Withdraw Everything'}
        </WithdrawBtn>
      )}
    </Modal>
  )
}

export default VaultModal