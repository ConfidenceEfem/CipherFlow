// src/data/constants.js
// STATS_BAR removed — live stats are now computed in Navbar from on-chain data.
// Other constants kept as-is for fallback/display purposes.

export const TOKENS = [
  { sym: 'ETH',  name: 'Ethereum',        bal: '1.2483',   usd: '2,847.50' },
  { sym: 'USDC', name: 'USD Coin',         bal: '420.00',   usd: '420.00'   },
  { sym: 'WBTC', name: 'Wrapped Bitcoin',  bal: '0.0823',   usd: '5,124.32' },
  { sym: 'DAI',  name: 'Dai Stablecoin',   bal: '1,200.00', usd: '1,200.00' },
  { sym: 'USDT', name: 'Tether',           bal: '500.00',   usd: '500.00'   },
  { sym: 'LINK', name: 'Chainlink',        bal: '45.23',    usd: '812.09'   },
  { sym: 'AAVE', name: 'Aave',             bal: '5.78',     usd: '579.87'   },
  { sym: 'UNI',  name: 'Uniswap',          bal: '23.10',    usd: '254.18'   },
]

export const POOLS = [
  { id: 1, t0: 'ETH',  t1: 'USDC', tvl: '$2.4M',  apy: '12.4', fee: '0.30', vol: '$840K',  myPos: null     },
  { id: 2, t0: 'WBTC', t1: 'ETH',  tvl: '$1.8M',  apy: '8.9',  fee: '0.30', vol: '$620K',  myPos: '$1,240' },
  { id: 3, t0: 'ETH',  t1: 'DAI',  tvl: '$980K',  apy: '15.2', fee: '0.05', vol: '$340K',  myPos: null     },
  { id: 4, t0: 'USDC', t1: 'USDT', tvl: '$5.2M',  apy: '4.1',  fee: '0.01', vol: '$1.2M',  myPos: null     },
  { id: 5, t0: 'LINK', t1: 'ETH',  tvl: '$450K',  apy: '22.1', fee: '0.30', vol: '$180K',  myPos: null     },
]

export const VAULTS = [
  { id: 1, name: 'Alpha Vault',   asset: 'ETH',  apy: '18.4', tvl: '$3.2M', minDep: '0.01 ETH',   strategy: 'Delta Neutral',   risk: 'med'  },
  { id: 2, name: 'Stable Shield', asset: 'USDC', apy: '12.1', tvl: '$8.7M', minDep: '100 USDC',   strategy: 'Yield Optimizer', risk: 'low'  },
  { id: 3, name: 'BTC Reserve',   asset: 'WBTC', apy: '9.8',  tvl: '$1.5M', minDep: '0.001 WBTC', strategy: 'Basis Trade',     risk: 'low'  },
  { id: 4, name: 'DeFi Momentum', asset: 'ETH',  apy: '34.2', tvl: '$780K', minDep: '0.1 ETH',    strategy: 'Momentum',        risk: 'high' },
]