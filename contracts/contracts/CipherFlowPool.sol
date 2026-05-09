// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";
import { FHE, euint64, externalEuint64 } from "@fhevm/solidity/lib/FHE.sol";
import { CipherFlowToken } from "./CipherFlowToken.sol";

contract CipherFlowPool is ZamaEthereumConfig {
    address public factory;
    address public token0;
    address public token1;
    uint64  public feeBps;

    mapping(address => euint64) private _deposit0;
    mapping(address => euint64) private _deposit1;
    mapping(address => bool)    public hasPosition;

    uint256 public totalDepositors;

    event LiquidityAdded(address indexed provider);
    event LiquidityRemoved(address indexed provider);

    constructor(address _token0, address _token1, uint64 _feeBps) {
        factory = msg.sender;
        token0  = _token0;
        token1  = _token1;
        feeBps  = _feeBps;
    }

    /**
     * @notice Add liquidity for both tokens.
     *
     * Four encrypted inputs — each pair (pool-targeted, token-targeted) per token:
     *   encAmount0ForPool / proof0ForPool   — proof targets THIS contract
     *   encAmount0ForToken / proof0ForToken — proof targets token0 (for transferFrom)
     *   encAmount1ForPool / proof1ForPool   — proof targets THIS contract
     *   encAmount1ForToken / proof1ForToken — proof targets token1 (for transferFrom)
     *
     * User must approve this pool on both token0 and token1 first.
     */
    function addLiquidity(
        externalEuint64 encAmount0ForPool,
        bytes calldata  proof0ForPool,
        externalEuint64 encAmount0ForToken,
        bytes calldata  proof0ForToken,
        externalEuint64 encAmount1ForPool,
        bytes calldata  proof1ForPool,
        externalEuint64 encAmount1ForToken,
        bytes calldata  proof1ForToken
    ) external {
        euint64 amount0 = FHE.fromExternal(encAmount0ForPool, proof0ForPool);
        euint64 amount1 = FHE.fromExternal(encAmount1ForPool, proof1ForPool);
        FHE.allowThis(amount0);
        FHE.allowThis(amount1);

        CipherFlowToken(token0).transferFrom(msg.sender, address(this), encAmount0ForToken, proof0ForToken);
        CipherFlowToken(token1).transferFrom(msg.sender, address(this), encAmount1ForToken, proof1ForToken);

        if (!hasPosition[msg.sender]) {
            _deposit0[msg.sender] = amount0;
            _deposit1[msg.sender] = amount1;
            hasPosition[msg.sender] = true;
            totalDepositors += 1;
        } else {
            _deposit0[msg.sender] = FHE.add(_deposit0[msg.sender], amount0);
            _deposit1[msg.sender] = FHE.add(_deposit1[msg.sender], amount1);
        }

        FHE.allow(_deposit0[msg.sender], msg.sender);
        FHE.allow(_deposit1[msg.sender], msg.sender);
        FHE.allowThis(_deposit0[msg.sender]);
        FHE.allowThis(_deposit1[msg.sender]);

        emit LiquidityAdded(msg.sender);
    }

    function removeLiquidity() external {
        require(hasPosition[msg.sender], "No position");

        euint64 out0 = _deposit0[msg.sender];
        euint64 out1 = _deposit1[msg.sender];

        hasPosition[msg.sender] = false;
        _deposit0[msg.sender]   = FHE.asEuint64(0);
        _deposit1[msg.sender]   = FHE.asEuint64(0);
        FHE.allowThis(_deposit0[msg.sender]);
        FHE.allowThis(_deposit1[msg.sender]);

        if (totalDepositors > 0) totalDepositors -= 1;

        FHE.allow(out0, token0);
        FHE.allow(out0, msg.sender);
        CipherFlowToken(token0).transfer(msg.sender, out0);

        FHE.allow(out1, token1);
        FHE.allow(out1, msg.sender);
        CipherFlowToken(token1).transfer(msg.sender, out1);

        emit LiquidityRemoved(msg.sender);
    }

    function getUserDeposit0(address user) external view returns (euint64) { return _deposit0[user]; }
    function getUserDeposit1(address user) external view returns (euint64) { return _deposit1[user]; }
}
