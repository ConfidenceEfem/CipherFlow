import styled, { keyframes } from 'styled-components'

export const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.45; }
`

/* ── Layout ─────────────────────────────── */
export const PageWrap = styled.div`
  max-width: 980px; margin: 0 auto; padding: 40px 24px 80px;
`
export const PageCenter = styled.div`
  display: flex; flex-direction: column; align-items: center;
  padding: 40px 20px 80px;
`
export const Row = styled.div`
  display: flex;
  align-items: ${({ $align }) => $align || 'center'};
  justify-content: ${({ $justify }) => $justify || 'flex-start'};
  gap: ${({ $gap }) => $gap || '0'};
  flex-wrap: ${({ $wrap }) => $wrap || 'nowrap'};
`
export const Spacer = styled.div`height: ${({ $h }) => $h || 16}px;`
export const Divider = styled.div`
  height: 1px; background: ${({ theme }) => theme.border};
  margin: ${({ $my }) => $my || '0'};
`

/* ── Cards ──────────────────────────────── */
export const Card = styled.div`
  background: ${({ theme }) => theme.card};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: ${({ $r }) => $r || '14px'};
  padding: ${({ $p }) => $p || '16px'};
`
export const Card2 = styled.div`
  background: ${({ theme }) => theme.card2};
  border: 1px solid ${({ theme }) => theme.borderLight};
  border-radius: ${({ $r }) => $r || '12px'};
  padding: ${({ $p }) => $p || '14px'};
`
export const SurfaceCard = styled.div`
  background: ${({ theme }) => theme.surface};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: ${({ $r }) => $r || '14px'};
  padding: ${({ $p }) => $p || '16px'};
`

/* ── Buttons ────────────────────────────── */
export const BtnGold = styled.button`
  background: #F7CB08; color: #09090D; border: none;
  cursor: pointer; font-weight: 700; font-family: 'Outfit', sans-serif;
  display: flex; align-items: center; justify-content: center; gap: 6px;
  transition: opacity 0.15s, transform 0.1s;
  &:hover  { opacity: 0.88; }
  &:active { transform: scale(0.98); }
  &:disabled { opacity: 0.38; cursor: not-allowed; transform: none; pointer-events: none; }
`
export const BtnGhost = styled.button`
  background: transparent;
  border: 1px solid ${({ theme }) => theme.border};
  color: ${({ theme }) => theme.t2};
  cursor: pointer; font-weight: 600; font-family: 'Outfit', sans-serif;
  display: flex; align-items: center; justify-content: center; gap: 6px;
  transition: border-color 0.15s, color 0.15s;
  &:hover { border-color: ${({ theme }) => theme.goldbd}; color: ${({ theme }) => theme.goldt}; }
`
export const IconBtn = styled.button`
  background: ${({ theme }) => theme.inp};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 8px; padding: 7px 9px;
  cursor: pointer; color: ${({ theme }) => theme.t2};
  display: flex; align-items: center;
  transition: border-color 0.15s, color 0.15s;
  &:hover { border-color: ${({ theme }) => theme.goldbd}; color: ${({ theme }) => theme.goldt}; }
`
export const TabBtn = styled.button`
  padding: 7px 16px; border-radius: 8px; cursor: pointer;
  font-size: 13px; font-weight: 600; font-family: 'Outfit', sans-serif;
  transition: all 0.15s;
  border: 1px solid ${({ theme, $active }) => $active ? theme.goldbd : theme.border};
  background: ${({ theme, $active }) => $active ? theme.goldbg : theme.inp};
  color: ${({ theme, $active }) => $active ? theme.goldt : theme.t2};
`

/* ── Tags ───────────────────────────────── */
export const EncTag = styled.span`
  display: inline-flex; align-items: center; gap: 4px;
  background: ${({ theme }) => theme.goldbg};
  color: ${({ theme }) => theme.goldt};
  border: 1px solid ${({ theme }) => theme.goldbd};
  border-radius: 4px; padding: 3px 8px;
  font-size: 11px; font-weight: 700;
  letter-spacing: 0.05em; text-transform: uppercase; white-space: nowrap;
`
export const RiskLow = styled.span`
  background: rgba(22,163,74,.1); color: #16a34a;
  border: 1px solid rgba(22,163,74,.25); border-radius: 4px;
  padding: 2px 8px; font-size: 11px; font-weight: 700;
  letter-spacing: 0.04em; text-transform: uppercase;
`
export const RiskMed = styled.span`
  background: rgba(234,179,8,.1); color: #ca8a04;
  border: 1px solid rgba(234,179,8,.25); border-radius: 4px;
  padding: 2px 8px; font-size: 11px; font-weight: 700;
  letter-spacing: 0.04em; text-transform: uppercase;
`
export const RiskHigh = styled.span`
  background: rgba(220,38,38,.1); color: #dc2626;
  border: 1px solid rgba(220,38,38,.25); border-radius: 4px;
  padding: 2px 8px; font-size: 11px; font-weight: 700;
  letter-spacing: 0.04em; text-transform: uppercase;
`

/* ── Notice ─────────────────────────────── */
export const Notice = styled.div`
  background: ${({ theme }) => theme.goldbg};
  border: 1px solid ${({ theme }) => theme.goldbd};
  border-radius: 10px; padding: 10px 14px;
  display: flex; align-items: flex-start; gap: 8px;
  font-size: 12px; color: ${({ theme }) => theme.goldt}; line-height: 1.6;
`

/* ── Inputs ─────────────────────────────── */
export const SearchInput = styled.input`
  background: ${({ theme }) => theme.inp};
  border: 1px solid ${({ theme }) => theme.border};
  color: ${({ theme }) => theme.t1}; outline: none;
  transition: border-color 0.2s; font-family: 'Outfit', sans-serif;
  width: 100%; padding: 9px 12px 9px 36px;
  border-radius: 10px; font-size: 14px;
  &:focus { border-color: ${({ theme }) => theme.goldbd}; }
  &::placeholder { color: ${({ theme }) => theme.t3}; }
`
export const BigInput = styled.input`
  background: none; border: none; font-size: 28px; font-weight: 800;
  color: ${({ theme }) => theme.t1}; width: 100%; outline: none;
  font-family: 'Outfit', sans-serif;
  &::placeholder { color: ${({ theme }) => theme.t3}; }
`
export const SmInput = styled.input`
  background: ${({ theme }) => theme.inp};
  border: 1px solid ${({ theme }) => theme.border};
  color: ${({ theme }) => theme.t1}; outline: none;
  transition: border-color 0.2s; font-family: 'Outfit', sans-serif;
  border-radius: 8px; padding: 8px 10px; font-size: 14px;
  &:focus { border-color: ${({ theme }) => theme.goldbd}; }
  &::placeholder { color: ${({ theme }) => theme.t3}; }
`

/* ── Misc ───────────────────────────────── */
export const LiveDot = styled.div`
  width: 6px; height: 6px; border-radius: 50%;
  background: #22c55e; animation: ${pulse} 2s infinite;
`
export const StatMiniCard = styled.div`
  background: ${({ theme }) => theme.surface};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 12px; padding: 14px 18px; flex: 1 1 130px;
`
