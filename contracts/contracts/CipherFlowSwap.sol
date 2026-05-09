// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";
import { FHE, euint64, externalEuint64 } from "@fhevm/solidity/lib/FHE.sol";
import { CipherFlowToken } from "./CipherFlowToken.sol";

contract CipherFlowSwap is ZamaEthereumConfig {
    address public owner;

    mapping(bytes32 => uint64) public exchangeRate;
    mapping(address => euint64) private _fees;

    uint64 public constant FEE_BPS    = 30;
    uint64 public constant BPS_DENOM  = 10_000;
    uint64 public constant RATE_SCALE = 1_000_000;

    event SwapExecuted(address indexed user, address indexed tokenIn, address indexed tokenOut);
    event RateSet(address tokenIn, address tokenOut, uint64 rate);

    modifier onlyOwner() { require(msg.sender == owner, "Not owner"); _; }

    constructor() { owner = msg.sender; }

    function setRate(address tokenIn, address tokenOut, uint64 rate) external onlyOwner {
        exchangeRate[_pairKey(tokenIn, tokenOut)] = rate;
        emit RateSet(tokenIn, tokenOut, rate);
    }

    /**
     * @notice Swap tokenIn for tokenOut.
     *
     * Two encrypted inputs are required:
     *   encForSwap  / proofForSwap  — proof targets THIS contract (for FHE computation)
     *   encForToken / proofForToken — proof targets the tokenIn contract (for transferFrom)
     *
     * The user must approve this contract on tokenIn first:
     *   tokenIn.approve(swapAddr, encMaxAmount, proof)
     */
    function swap(
        address tokenIn,
        address tokenOut,
        externalEuint64 encForSwap,
        bytes calldata   proofForSwap,
        externalEuint64 encForToken,
        bytes calldata   proofForToken
    ) external {
        require(tokenIn != tokenOut, "Same token");
        uint64 rate = exchangeRate[_pairKey(tokenIn, tokenOut)];
        require(rate > 0, "No rate for this pair");

        // Decrypt amount for FHE computation — bound to this contract
        euint64 amountIn = FHE.fromExternal(encForSwap, proofForSwap);
        FHE.allowThis(amountIn);

        // Compute fee and output
        euint64 fee            = FHE.div(FHE.mul(amountIn, FEE_BPS), BPS_DENOM);
        euint64 amountAfterFee = FHE.sub(amountIn, fee);
        euint64 amountOut      = FHE.div(FHE.mul(amountAfterFee, rate), RATE_SCALE);
        FHE.allowThis(fee);
        FHE.allowThis(amountAfterFee);
        FHE.allowThis(amountOut);
        // new thing added from chatgpt
        FHE.allow(amountOut, tokenOut);

        // Accumulate fees
        euint64 currentFee = _fees[tokenIn];
        _fees[tokenIn] = FHE.isInitialized(currentFee)
            ? FHE.add(currentFee, fee)
            : fee;
        FHE.allowThis(_fees[tokenIn]);

        // Pull tokenIn from user using the token-targeted proof
        CipherFlowToken(tokenIn).transferFrom(msg.sender, address(this), encForToken, proofForToken);

        // Push tokenOut to user
        CipherFlowToken(tokenOut).transfer(msg.sender, amountOut);
        FHE.allow(amountOut, msg.sender);

        emit SwapExecuted(msg.sender, tokenIn, tokenOut);
    }

    function seedLiquidity(
        address token,
        externalEuint64 encryptedAmount,
        bytes calldata inputProof
    ) external onlyOwner {
        CipherFlowToken(token).transferFrom(msg.sender, address(this), encryptedAmount, inputProof);
    }

    function _pairKey(address a, address b) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(a, b));
    }
}
