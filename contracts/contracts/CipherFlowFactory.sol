// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;


import { CipherFlowPool } from "./CipherFlowPool.sol";

/**
 * @title CipherFlowFactory
 * @notice Deploys and tracks CipherFlowPool instances.
 *         Each (token0, token1, feeBps) triplet gets one pool.
 */
contract CipherFlowFactory {
    address public owner;

    // pool address → true
    mapping(address => bool) public isPool;

    // token0 → token1 → feeBps → pool
    mapping(address => mapping(address => mapping(uint64 => address))) public getPool;

    // All pools in order of creation
    address[] public allPools;

    event PoolCreated(
        address indexed token0,
        address indexed token1,
        uint64 feeBps,
        address pool,
        uint256 poolIndex
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /**
     * @notice Deploy a new encrypted liquidity pool.
     */
    function createPool(
        address token0,
        address token1,
        uint64 feeBps
    ) external onlyOwner returns (address pool) {
        require(token0 != address(0) && token1 != address(0), "Zero address");
        require(token0 != token1, "Identical tokens");
        require(getPool[token0][token1][feeBps] == address(0), "Pool exists");

        pool = address(new CipherFlowPool(token0, token1, feeBps));

        getPool[token0][token1][feeBps] = pool;
        getPool[token1][token0][feeBps] = pool; // bidirectional lookup
        isPool[pool] = true;
        allPools.push(pool);

        emit PoolCreated(token0, token1, feeBps, pool, allPools.length - 1);
    }

    function allPoolsLength() external view returns (uint256) {
        return allPools.length;
    }
}
