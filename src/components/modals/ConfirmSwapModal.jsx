import { useState } from 'react'
import styled from 'styled-components'
import Modal from '../common/Modal'
import { TokenIcon } from '../common/TokenIcon'
import { Card, BtnGold, Notice } from '../common/Shared'
import { IcoArrowDown, IcoLock } from '../icons/Icons'

const AmtBox   = styled(Card)`margin-bottom:4px;`
const BoxLbl   = styled.div`font-size:12px;color:${({ theme }) => theme.t3};margin-bottom:8px;`
const AmtRow   = styled.div`display:flex;align-items:center;justify-content:space-between;`
const AmtNum   = styled.span`font-size:26px;font-weight:800;color:${({ theme }) => theme.t1};`
const UsdSub   = styled.div`font-size:12px;color:${({ theme }) => theme.t3};margin-top:4px;`
const TokPill  = styled.div`display:flex;align-items:center;gap:8px;`
const TokLbl   = styled.span`font-weight:700;font-size:15px;color:${({ theme }) => theme.t1};`
const ArrWrap  = styled.div`display:flex;justify-content:center;padding:5px 0;color:${({ theme }) => theme.t3};`
const InfoCard = styled(Card)`margin-bottom:14px;`
const InfoRow  = styled.div`display:flex;justify-content:space-between;padding:5px 0;font-size:13px;`
const InfoKey  = styled.span`color:${({ theme }) => theme.t3};`
const InfoVal  = styled.span`font-weight:700;color:${({ theme, $gold }) => $gold ? theme.goldt : theme.t1};`
const ConfBtn  = styled(BtnGold)`width:100%;padding:14px;border-radius:12px;font-size:15px;`

const ConfirmSwapModal = ({
  onClose, onConfirm,
  fromTok, toTok,
  fromAmt, toAmt,
  slip, usdFrom, usdTo,
}) => {
  // FIX: local confirming state so the button updates IMMEDIATELY on click,
  // before the parent's useSwap status has time to update (which takes a
  // few seconds while FHE encrypts and the tx is submitted).
  const [confirming, setConfirming] = useState(false)

  const handleClick = () => {
    setConfirming(true)  // instant UI feedback
    onConfirm()          // triggers the actual swap
  }

  return (
    <Modal onClose={confirming ? undefined : onClose} title="Confirm Swap" maxW={420}>

      {/* You pay */}
      <AmtBox>
        <BoxLbl>You pay</BoxLbl>
        <AmtRow>
          <div>
            <AmtNum>{fromAmt || '0'}</AmtNum>
            {usdFrom && <UsdSub>≈ ${usdFrom}</UsdSub>}
          </div>
          <TokPill>
            <TokenIcon sym={fromTok.sym} size={26} />
            <TokLbl>{fromTok.sym}</TokLbl>
          </TokPill>
        </AmtRow>
      </AmtBox>

      <ArrWrap><IcoArrowDown size={14} /></ArrWrap>

      {/* You receive */}
      <AmtBox style={{ marginBottom: 16 }}>
        <BoxLbl>You receive (estimated)</BoxLbl>
        <AmtRow>
          <div>
            <AmtNum>{toAmt || '0'}</AmtNum>
            {usdTo && <UsdSub>≈ ${usdTo}</UsdSub>}
          </div>
          <TokPill>
            <TokenIcon sym={toTok.sym} size={26} />
            <TokLbl>{toTok.sym}</TokLbl>
          </TokPill>
        </AmtRow>
      </AmtBox>

      {/* Details */}
      <InfoCard>
        {[
          ['Max Slippage', `${slip}%`,                false],
          ['Price Impact', '< 0.05%',                 false],
          ['Network',      'Ethereum Sepolia',          false],
          ['Protocol Fee', '0.30%',                    false],
          ['Encryption',   'Zama FHE — amount hidden', true ],
        ].map(([k, v, gold]) => (
          <InfoRow key={k}>
            <InfoKey>{k}</InfoKey>
            <InfoVal $gold={gold}>{v}</InfoVal>
          </InfoRow>
        ))}
      </InfoCard>

      <Notice style={{ marginBottom: 16 }}>
        <span style={{ flexShrink:0, paddingTop:1 }}>
          <IcoLock size={13} color="currentColor" />
        </span>
        Your swap amount is encrypted by Zama FHE before reaching the contract.
        The on-chain transaction reveals nothing about the size of your trade.
      </Notice>

      <ConfBtn onClick={handleClick} disabled={confirming}>
        {confirming ? '⏳ Processing…' : 'Confirm Encrypted Swap'}
      </ConfBtn>
    </Modal>
  )
}

export default ConfirmSwapModal