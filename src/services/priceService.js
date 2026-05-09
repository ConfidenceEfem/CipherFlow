/**
 * Fetches live USD prices from CoinGecko public API (no API key needed).
 * Falls back to hardcoded values if the request fails.
 */

const COINGECKO_IDS = {
  ETH:   'ethereum',
  WBTC:  'wrapped-bitcoin',
  BNB:   'binancecoin',
  ZAMA:  'zama',         // may not be listed yet — falls back
  cUSDC: 'usd-coin',
  cUSDT: 'tether',
}

const FALLBACK_PRICES = {
  ETH:   2847.50,
  WBTC:  62000.00,
  BNB:   580.00,
  ZAMA:  2.50,
  cUSDC: 1.00,
  cUSDT: 1.00,
}

let _cache = null
let _lastFetch = 0
const CACHE_MS = 60_000 // refresh every 60s

export async function getLivePrices() {
  const now = Date.now()
  if (_cache && now - _lastFetch < CACHE_MS) return _cache

  try {
    const ids = Object.values(COINGECKO_IDS).join(',')
    const res = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`,
      { signal: AbortSignal.timeout(5000) }
    )
    if (!res.ok) throw new Error('CoinGecko error')
    const data = await res.json()

    const prices = {}
    for (const [sym, id] of Object.entries(COINGECKO_IDS)) {
      prices[sym] = data[id]?.usd ?? FALLBACK_PRICES[sym]
    }

    _cache = prices
    _lastFetch = now
    return prices
  } catch {
    // Network fail — return fallbacks
    return FALLBACK_PRICES
  }
}

export function formatUsd(amount, sym, prices) {
  const price = prices?.[sym] ?? FALLBACK_PRICES[sym] ?? 0
  const val = parseFloat(amount) * price
  return val.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 })
}
