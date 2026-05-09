// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";
import { FHE, euint64, externalEuint64 } from "@fhevm/solidity/lib/FHE.sol";
import { CipherFlowToken } from "./CipherFlowToken.sol";

contract CipherFlowVault is ZamaEthereumConfig {
    address public owner;
    address public asset;
    string  public vaultName;
    string  public strategy;

    mapping(address => euint64) private _balances;
    mapping(address => uint256) private _depositTimestamp;

    uint256 public totalDepositors;
    uint64  public apyBps;

    event Deposited(address indexed user);
    event Withdrawn(address indexed user);

    modifier onlyOwner() { require(msg.sender == owner, "Not owner"); _; }

    constructor(
        address _asset,
        string memory _vaultName,
        string memory _strategy,
        uint64 _apyBps
    ) {
        owner     = msg.sender;
        asset     = _asset;
        vaultName = _vaultName;
        strategy  = _strategy;
        apyBps    = _apyBps;
    }

    /**
     * @notice Deposit tokens into the vault.
     *
     * Two encrypted inputs:
     *   encAmountForVault / proofForVault — proof targets THIS contract
     *   encAmountForToken / proofForToken — proof targets the asset token (for transferFrom)
     *
     * User must approve this vault on the asset token first.
     */
    function deposit(
        externalEuint64 encAmountForVault,
        bytes calldata  proofForVault,
        externalEuint64 encAmountForToken,
        bytes calldata  proofForToken
    ) external {
        euint64 amount = FHE.fromExternal(encAmountForVault, proofForVault);
        FHE.allowThis(amount);

        CipherFlowToken(asset).transferFrom(msg.sender, address(this), encAmountForToken, proofForToken);

        euint64 current = _balances[msg.sender];
        if (!FHE.isInitialized(current)) {
            _balances[msg.sender] = amount;
            totalDepositors += 1;
        } else {
            _balances[msg.sender] = FHE.add(current, amount);
        }
        FHE.allow(_balances[msg.sender], msg.sender);
        FHE.allowThis(_balances[msg.sender]);

        _depositTimestamp[msg.sender] = block.timestamp;
        emit Deposited(msg.sender);
    }

    function withdraw() external {
        require(FHE.isInitialized(_balances[msg.sender]), "No deposit");

        euint64 principal = _balances[msg.sender];
        FHE.allowThis(principal);

        uint256 elapsed = block.timestamp - _depositTimestamp[msg.sender];
        uint64 yieldFactor = uint64(
            (uint256(apyBps) * elapsed) / (uint256(10_000) * 365 days)
        );

        euint64 yieldAmt = FHE.mul(principal, yieldFactor);
        euint64 total    = FHE.add(principal, yieldAmt);
        FHE.allowThis(yieldAmt);
        FHE.allowThis(total);

        _balances[msg.sender] = FHE.asEuint64(0);
        FHE.allowThis(_balances[msg.sender]);
        if (totalDepositors > 0) totalDepositors -= 1;

        FHE.allow(total, asset);       // token contract needs this to do FHE.sub()
FHE.allow(total, msg.sender);  // recipient needs this to read their balance
CipherFlowToken(asset).transfer(msg.sender, total);

        emit Withdrawn(msg.sender);
    }

    function getBalance(address user) external view returns (euint64) { return _balances[user]; }
    function setApy(uint64 _apyBps) external onlyOwner { apyBps = _apyBps; }
}
