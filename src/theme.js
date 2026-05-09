export const darkTheme = {
  mode: 'dark',
  bg: '#09090D',
  surface: '#111116',
  card: '#18191F',
  card2: '#1E1F27',
  border: 'rgba(255,255,255,0.07)',
  borderLight: 'rgba(255,255,255,0.04)',
  t1: '#FFFFFF',
  t2: 'rgba(255,255,255,0.55)',
  t3: 'rgba(255,255,255,0.30)',
  inp: 'rgba(255,255,255,0.05)',
  hov: 'rgba(255,255,255,0.04)',
  gold: '#F7CB08',
  goldt: '#F7CB08',
  goldbg: 'rgba(247,203,8,0.10)',
  goldbd: 'rgba(247,203,8,0.25)',
  btnTxt: '#09090D',
  success: '#22c55e',
  danger: '#ef4444',
  gridDot: 'rgba(247,203,8,0.055)',
}

export const lightTheme = {
  mode: 'light',
  bg: '#F0EFE9',
  surface: '#FFFFFF',
  card: '#F7F6F2',
  card2: '#EEEDE8',
  border: 'rgba(0,0,0,0.08)',
  borderLight: 'rgba(0,0,0,0.04)',
  t1: '#0B0C10',
  t2: 'rgba(0,0,0,0.55)',
  t3: 'rgba(0,0,0,0.35)',
  inp: 'rgba(0,0,0,0.04)',
  hov: 'rgba(0,0,0,0.04)',
  gold: '#F7CB08',
  goldt: '#9A7E00',
  goldbg: 'rgba(247,203,8,0.12)',
  goldbd: 'rgba(180,140,0,0.30)',
  btnTxt: '#FFFFFF',
  success: '#16a34a',
  danger: '#dc2626',
  gridDot: 'rgba(0,0,0,0.05)',
}

export const TOKEN_COLORS = {
  // Existing — keep these
  ETH:   '#627EEA',   // Ethereum blue
  WBTC:  '#F7931A',   // Bitcoin orange
  // USDC:  '#2775CA',   // Circle blue
  DAI:   '#F5AC37',   // DAI gold
  USDT:  '#26A17B',   // Tether green
 
  // App-specific confidential tokens — NEW
  cUSDC: '#2775CA',   // Same brand blue as USDC (it IS USDC, just confidential)
  cUSDT: '#26A17B',   // Same brand green as USDT
  BNB:   '#F3BA2F',   // Binance yellow
  ZAMA:  '#F7CB08',   // Zama gold (matches the app's gold accent color)
}
