import { useState } from 'react'
import styled from 'styled-components'
import Modal from '../common/Modal'
import { TokenIcon } from '../common/TokenIcon'
import { SearchInput } from '../common/Shared'
import { IcoSearch } from '../icons/Icons'

const SearchWrap = styled.div`position:relative;margin-bottom:16px;`
const SIcon  = styled.span`position:absolute;left:11px;top:50%;transform:translateY(-50%);color:${({ theme }) => theme.t3};display:flex;`
const Label  = styled.div`font-size:11px;font-weight:700;color:${({ theme }) => theme.t3};letter-spacing:.06em;text-transform:uppercase;margin-bottom:8px;`
const TokRow = styled.div`display:flex;align-items:center;justify-content:space-between;padding:10px 8px;border-radius:10px;cursor:pointer;transition:background .15s;&:hover{background:${({ theme }) => theme.hov};}`
const TokLeft  = styled.div`display:flex;align-items:center;gap:12px;`
const TokName  = styled.div`font-weight:700;font-size:15px;color:${({ theme }) => theme.t1};`
const TokSub   = styled.div`font-size:12px;color:${({ theme }) => theme.t3};`
const TokRight = styled.div`text-align:right;`
const BalAmt   = styled.div`font-weight:700;font-size:14px;color:${({ theme }) => theme.t1};`
const BalUsd   = styled.div`font-size:12px;color:${({ theme }) => theme.t3};`
const ZeroBal  = styled.div`font-size:12px;color:${({ theme }) => theme.t3};font-style:italic;`

/**
 * TokenModal now accepts a `tokens` prop — the live token list from useTokenBalances.
 * Falls back to an empty list if not provided.
 */
const TokenModal = ({ onClose, onSelect, excludeSym, tokens = [] }) => {
  const [q, setQ] = useState('')

  const list = tokens.filter(t =>
    t.sym !== excludeSym &&
    (t.sym.toLowerCase().includes(q.toLowerCase()) ||
     t.name.toLowerCase().includes(q.toLowerCase()))
  )

  return (
    <Modal onClose={onClose} title="Select Token" maxW={400}>
      <SearchWrap>
        <SIcon><IcoSearch /></SIcon>
        <SearchInput
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Search name or symbol…"
          autoFocus
        />
      </SearchWrap>

      <Label>Your Tokens</Label>

      {list.length === 0 && (
        <div style={{ padding:'16px 8px', fontSize:13, color:'var(--t3)', textAlign:'center' }}>
          No tokens found
        </div>
      )}

      {list.map(tok => (
        <TokRow key={tok.sym} onClick={() => { onSelect(tok); onClose() }}>
          <TokLeft>
            <TokenIcon sym={tok.sym} size={36} />
            <div>
              <TokName>{tok.sym}</TokName>
              <TokSub>{tok.name}</TokSub>
            </div>
          </TokLeft>
          <TokRight>
            {parseFloat(tok.bal) > 0 ? (
              <>
                <BalAmt>{tok.bal}</BalAmt>
                <BalUsd>${tok.usd}</BalUsd>
              </>
            ) : (
              <ZeroBal>No balance</ZeroBal>
            )}
          </TokRight>
        </TokRow>
      ))}
    </Modal>
  )
}

export default TokenModal
