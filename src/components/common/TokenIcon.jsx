import styled from 'styled-components'
import { TOKEN_COLORS } from '../../theme'

// Per-token display abbreviations shown inside the icon circle.
// Default is sym.slice(0,2) but some tokens need custom labels.
const TOKEN_ABBR = {
  ETH:   'Ξ',    // Ethereum symbol
  WBTC:  'BT',   // Bitcoin
  cUSDC: 'cU',   // confidential USDC
  cUSDT: 'cT',   // confidential USDT
  BNB:   'BN',
  ZAMA:  'ZA',
  USDC:  'UC',
  USDT:  'UT',
  DAI:   'DA',
  LINK:  'LK',
  AAVE:  'AA',
  UNI:   'UN',
}

const Circle = styled.div`
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  border-radius: 50%;
  background: ${({ $sym }) => TOKEN_COLORS[$sym] || '#555'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${({ $size }) => Math.round($size * 0.35)}px;
  font-weight: 800;
  color: #fff;
  flex-shrink: 0;
  letter-spacing: -0.5px;
  font-family: 'Outfit', sans-serif;
  user-select: none;
  box-shadow: 0 1px 4px rgba(0,0,0,0.25);
`

const DoubleWrap = styled.div`
  position: relative;
  width: ${({ $size }) => Math.round($size * 1.55)}px;
  height: ${({ $size }) => $size}px;
  flex-shrink: 0;
`

const First  = styled.div`position: absolute; left: 0; top: 0; z-index: 2;`
const Second = styled.div`
  position: absolute;
  left: ${({ $size }) => Math.round($size * 0.55)}px;
  top: 0;
  z-index: 1;
`

export const TokenIcon = ({ sym, size = 32 }) => (
  <Circle $size={size} $sym={sym}>
    {TOKEN_ABBR[sym] || sym.slice(0, 2).toUpperCase()}
  </Circle>
)

export const DoubleTokIcon = ({ t0, t1, size = 28 }) => (
  <DoubleWrap $size={size}>
    <First><TokenIcon sym={t0} size={size} /></First>
    <Second $size={size}><TokenIcon sym={t1} size={size} /></Second>
  </DoubleWrap>
)