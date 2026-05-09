// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";
import { FHE, euint64, externalEuint64 } from "@fhevm/solidity/lib/FHE.sol";


contract CipherFlowToken is ZamaEthereumConfig {
    string public name;
    string public symbol;
    uint8  private _decimals;
    address public owner;

    uint64 public totalSupply;

    mapping(address => euint64) private _balances;
    // allowances: owner => spender => euint64
    mapping(address => mapping(address => euint64)) private _allowances;

    event Transfer(address indexed from, address indexed to, uint256 placeholder);
    event Approval(address indexed owner, address indexed spender, uint256 placeholder);

    modifier onlyOwner() { require(msg.sender == owner, "Not owner"); _; }

    constructor(
        string memory name_,
        string memory symbol_,
        uint8  decimals_,
        uint64 initialSupply
    ) {
        owner     = msg.sender;
        name      = name_;
        symbol    = symbol_;
        _decimals = decimals_;

        // Mint initial supply — FHE ops are fine outside a library constructor
        euint64 supply = FHE.asEuint64(initialSupply);
        _balances[msg.sender] = supply;
        totalSupply = initialSupply;
        FHE.allow(supply, msg.sender);
        FHE.allowThis(supply);

        emit Transfer(address(0), msg.sender, 0);
    }

    function decimals() public view returns (uint8) { return _decimals; }

    function balanceOf(address account) public view returns (euint64) {
        return _balances[account];
    }

    function allowance(address from, address spender) public view returns (euint64) {
        return _allowances[from][spender];
    }

    // ── Approve ──────────────────────────────────────────────────────────────

    function approve(
        address spender,
        externalEuint64 encryptedAmount,
        bytes calldata inputProof
    ) external returns (bool) {
        euint64 amount = FHE.fromExternal(encryptedAmount, inputProof);
        _allowances[msg.sender][spender] = amount;
        FHE.allow(amount, msg.sender);
        FHE.allow(amount, spender);
        FHE.allowThis(amount);
        emit Approval(msg.sender, spender, 0);
        return true;
    }

    // ── Transfer ─────────────────────────────────────────────────────────────

    function transfer(
        address to,
        externalEuint64 encryptedAmount,
        bytes calldata inputProof
    ) external returns (bool) {
        euint64 amount = FHE.fromExternal(encryptedAmount, inputProof);
        // from chatgpt line below
        FHE.allowThis(amount);

        _transfer(msg.sender, to, amount);
        return true;
    }

    // Transfer using an already-decrypted euint64 handle (internal use / pool)
    function transfer(address to, euint64 amount) external returns (bool) {
        _transfer(msg.sender, to, amount);
        return true;
    }

    // ── TransferFrom ─────────────────────────────────────────────────────────

    function transferFrom(
        address from,
        address to,
        externalEuint64 encryptedAmount,
        bytes calldata inputProof
    ) external returns (bool) {
        euint64 amount = FHE.fromExternal(encryptedAmount, inputProof);
        // changes from chatgpt, one line below
        FHE.allowThis(amount);
        _spendAllowance(from, msg.sender, amount);
        _transfer(from, to, amount);
        return true;
    }

    // TransferFrom using an already-decrypted euint64 handle
    function transferFrom(address from, address to, euint64 amount) external returns (bool) {
        _spendAllowance(from, msg.sender, amount);
        _transfer(from, to, amount);
        return true;
    }

    // ── Mint / Faucet ─────────────────────────────────────────────────────────

    function mint(address to, uint64 amount) external onlyOwner {
        _mint(to, amount);
    }

    function faucet(address to, uint64 amount) external {
        _mint(to, amount);
    }

    // ── Internals ─────────────────────────────────────────────────────────────

    function _mint(address to, uint64 amount) internal {
        euint64 encAmount = FHE.asEuint64(amount);
        euint64 current   = _balances[to];
        if (FHE.isInitialized(current)) {
            _balances[to] = FHE.add(current, encAmount);
        } else {
            _balances[to] = encAmount;
        }
        totalSupply += amount;
        FHE.allow(_balances[to], to);
        FHE.allowThis(_balances[to]);
        emit Transfer(address(0), to, 0);
    }

    function _transfer(address from, address to, euint64 amount) internal {
        require(from != address(0), "From zero");
        require(to   != address(0), "To zero");

        euint64 fromBal = _balances[from];
        euint64 newFrom = FHE.sub(fromBal, amount);   // underflow → FHE handles
        euint64 toBal   = _balances[to];
        euint64 newTo   = FHE.isInitialized(toBal)
            ? FHE.add(toBal, amount)
            : amount;

        _balances[from] = newFrom;
        _balances[to]   = newTo;

        FHE.allow(newFrom, from);
        FHE.allowThis(newFrom);
        FHE.allow(newTo, to);
        FHE.allowThis(newTo);

        emit Transfer(from, to, 0);
    }

    function _spendAllowance(address from, address spender, euint64 amount) internal {
        euint64 current = _allowances[from][spender];
        require(FHE.isInitialized(current), "No allowance");
        euint64 newAllowance = FHE.sub(current, amount);
        _allowances[from][spender] = newAllowance;
        FHE.allow(newAllowance, from);
        FHE.allow(newAllowance, spender);
        FHE.allowThis(newAllowance);
    }
}
