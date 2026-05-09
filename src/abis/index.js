

export const ERC20_ABI = [
  // View
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint64)',
  'function owner() view returns (address)',
  'function balanceOf(address account) view returns (bytes32)',
  'function allowance(address owner, address spender) view returns (bytes32)',

  // Approve — encrypted, proof targets TOKEN contract
  'function approve(address spender, bytes32 encryptedAmount, bytes inputProof) returns (bool)',

  // Transfer overload 1: with external proof (proof targets TOKEN contract)
  'function transfer(address to, bytes32 encAmount, bytes proof) returns (bool)',
  // Transfer overload 2: with already-decrypted euint64 handle (used by pool/vault internally)
  'function transfer(address to, bytes32 amount) returns (bool)',

  // TransferFrom overload 1: with external proof (proof targets TOKEN contract)
  'function transferFrom(address from, address to, bytes32 encAmount, bytes proof) returns (bool)',
  // TransferFrom overload 2: with already-decrypted euint64 handle
  'function transferFrom(address from, address to, bytes32 amount) returns (bool)',

  // Mint / Faucet
  'function mint(address to, uint64 amount)',
  'function faucet(address to, uint64 amount)',

  // Events
  'event Transfer(address indexed from, address indexed to, uint256 placeholder)',
  'event Approval(address indexed owner, address indexed spender, uint256 placeholder)',
]

// CipherFlowSwap — swap() takes 6 args (two handle+proof pairs), unchanged
export const SWAP_ABI = [
  'function owner() view returns (address)',
  'function exchangeRate(bytes32) view returns (uint64)',
  'function setRate(address tokenIn, address tokenOut, uint64 rate)',
  'function swap(address tokenIn, address tokenOut, bytes32 encForSwap, bytes proofForSwap, bytes32 encForToken, bytes proofForToken)',
  'function seedLiquidity(address token, bytes32 encryptedAmount, bytes inputProof)',
  'event SwapExecuted(address indexed user, address indexed tokenIn, address indexed tokenOut)',
  'event RateSet(address tokenIn, address tokenOut, uint64 rate)',
]

// CipherFlowPool — addLiquidity() takes 8 args (four handle+proof pairs), unchanged
export const POOL_ABI = [
  'function factory() view returns (address)',
  'function token0() view returns (address)',
  'function token1() view returns (address)',
  'function feeBps() view returns (uint64)',
  'function totalDepositors() view returns (uint256)',
  'function hasPosition(address user) view returns (bool)',
  'function getUserDeposit0(address user) view returns (bytes32)',
  'function getUserDeposit1(address user) view returns (bytes32)',
  'function addLiquidity(bytes32 enc0ForPool, bytes proof0ForPool, bytes32 enc0ForToken, bytes proof0ForToken, bytes32 enc1ForPool, bytes proof1ForPool, bytes32 enc1ForToken, bytes proof1ForToken)',
  'function removeLiquidity()',
  'event LiquidityAdded(address indexed provider)',
  'event LiquidityRemoved(address indexed provider)',
]

// CipherFlowFactory — unchanged
export const FACTORY_ABI = [
  'function allPools(uint256) view returns (address)',
  'function allPoolsLength() view returns (uint256)',
  'function getPool(address, address, uint64) view returns (address)',
  'function createPool(address token0, address token1, uint64 feeBps) returns (address)',
  'event PoolCreated(address indexed token0, address indexed token1, uint64 feeBps, address pool, uint256 poolIndex)',
]

// CipherFlowVault — deposit() now takes 4 args (two handle+proof pairs)
// previously it took 2 args (one handle+proof pair targeting vault)
export const VAULT_ABI = [
  'function owner() view returns (address)',
  'function vaultName() view returns (string)',
  'function strategy() view returns (string)',
  'function asset() view returns (address)',
  'function apyBps() view returns (uint64)',
  'function totalDepositors() view returns (uint256)',
  'function getBalance(address user) view returns (bytes32)',
  'function deposit(bytes32 encAmountForVault, bytes proofForVault, bytes32 encAmountForToken, bytes proofForToken)',
  'function withdraw()',
  'function setApy(uint64 apyBps)',
  'event Deposited(address indexed user)',
  'event Withdrawn(address indexed user)',
]