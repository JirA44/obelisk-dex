// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../interfaces/IERC20.sol";

interface AggregatorV3Interface {
    function decimals() external view returns (uint8);
    function latestRoundData() external view returns (
        uint80 roundId,
        int256 answer,
        uint256 startedAt,
        uint256 updatedAt,
        uint80 answeredInRound
    );
}

contract ObeliskPriceOracle {
    address public owner;
    address public updater;

    struct PriceData {
        uint256 price;          // Price with 18 decimals
        uint256 timestamp;      // Block timestamp (seconds)
        uint256 timestampMs;    // Off-chain timestamp (milliseconds)
        uint8 confidence;       // 0-100 confidence score
        uint8 sourceCount;      // Number of sources aggregated
    }

    struct ChainlinkFeed {
        address feedAddress;
        uint8 decimals;
        bool isActive;
    }

    // Token address => Price data
    mapping(address => PriceData) public prices;

    // Token address => Chainlink feed
    mapping(address => ChainlinkFeed) public chainlinkFeeds;

    // Token pair hash => TWAP data
    mapping(bytes32 => uint256) public twapPrices;

    // Supported tokens list
    address[] public supportedTokens;
    mapping(address => bool) public isSupported;

    // Price update history for TWAP
    mapping(address => uint256[]) public priceHistory;
    mapping(address => uint256[]) public timestampHistory;

    uint256 public constant TWAP_PERIOD = 300; // 5 minutes
    uint256 public constant MAX_PRICE_AGE = 60; // 60 seconds max staleness
    uint256 public constant PRICE_DECIMALS = 18;

    event PriceUpdated(
        address indexed token,
        uint256 price,
        uint256 timestampMs,
        uint8 confidence,
        uint8 sourceCount
    );

    event ChainlinkFeedSet(address indexed token, address indexed feed);
    event TokenAdded(address indexed token);
    event TokenRemoved(address indexed token);

    modifier onlyOwner() {
        require(msg.sender == owner, "NOT_OWNER");
        _;
    }

    modifier onlyUpdater() {
        require(msg.sender == updater || msg.sender == owner, "NOT_AUTHORIZED");
        _;
    }

    constructor() {
        owner = msg.sender;
        updater = msg.sender;
    }

    // ============ PRICE UPDATE FUNCTIONS ============

    /// @notice Update price from off-chain aggregator (ms precision)
    function updatePrice(
        address token,
        uint256 price,
        uint256 timestampMs,
        uint8 confidence,
        uint8 sourceCount
    ) external onlyUpdater {
        require(isSupported[token], "TOKEN_NOT_SUPPORTED");
        require(price > 0, "INVALID_PRICE");
        require(timestampMs > prices[token].timestampMs, "STALE_UPDATE");

        prices[token] = PriceData({
            price: price,
            timestamp: block.timestamp,
            timestampMs: timestampMs,
            confidence: confidence,
            sourceCount: sourceCount
        });

        // Store for TWAP calculation
        priceHistory[token].push(price);
        timestampHistory[token].push(block.timestamp);

        // Keep only last 100 entries
        if (priceHistory[token].length > 100) {
            _shiftArray(priceHistory[token]);
            _shiftArray(timestampHistory[token]);
        }

        emit PriceUpdated(token, price, timestampMs, confidence, sourceCount);
    }

    /// @notice Batch update multiple prices
    function updatePrices(
        address[] calldata tokens,
        uint256[] calldata _prices,
        uint256[] calldata timestampsMs,
        uint8[] calldata confidences,
        uint8[] calldata sourceCounts
    ) external onlyUpdater {
        require(tokens.length == _prices.length, "LENGTH_MISMATCH");
        require(tokens.length == timestampsMs.length, "LENGTH_MISMATCH");

        for (uint256 i = 0; i < tokens.length; i++) {
            if (isSupported[tokens[i]] && _prices[i] > 0) {
                prices[tokens[i]] = PriceData({
                    price: _prices[i],
                    timestamp: block.timestamp,
                    timestampMs: timestampsMs[i],
                    confidence: confidences[i],
                    sourceCount: sourceCounts[i]
                });

                emit PriceUpdated(tokens[i], _prices[i], timestampsMs[i], confidences[i], sourceCounts[i]);
            }
        }
    }

    // ============ PRICE READ FUNCTIONS ============

    /// @notice Get latest price for a token
    function getPrice(address token) external view returns (uint256 price, uint256 timestampMs) {
        PriceData memory data = prices[token];
        require(data.price > 0, "NO_PRICE");
        require(block.timestamp - data.timestamp <= MAX_PRICE_AGE, "PRICE_STALE");
        return (data.price, data.timestampMs);
    }

    /// @notice Get full price data
    function getPriceData(address token) external view returns (PriceData memory) {
        return prices[token];
    }

    /// @notice Get price from Chainlink if available
    function getChainlinkPrice(address token) public view returns (uint256) {
        ChainlinkFeed memory feed = chainlinkFeeds[token];
        if (!feed.isActive) return 0;

        (, int256 answer,, uint256 updatedAt,) = AggregatorV3Interface(feed.feedAddress).latestRoundData();
        require(block.timestamp - updatedAt <= MAX_PRICE_AGE, "CHAINLINK_STALE");
        require(answer > 0, "INVALID_CHAINLINK_PRICE");

        // Normalize to 18 decimals
        return uint256(answer) * (10 ** (PRICE_DECIMALS - feed.decimals));
    }

    /// @notice Get aggregated price (our feed + Chainlink)
    function getAggregatedPrice(address token) external view returns (uint256) {
        uint256 ourPrice = prices[token].price;
        uint256 chainlinkPrice = 0;

        try this.getChainlinkPrice(token) returns (uint256 clPrice) {
            chainlinkPrice = clPrice;
        } catch {}

        if (ourPrice > 0 && chainlinkPrice > 0) {
            // Average both sources
            return (ourPrice + chainlinkPrice) / 2;
        } else if (ourPrice > 0) {
            return ourPrice;
        } else if (chainlinkPrice > 0) {
            return chainlinkPrice;
        }

        revert("NO_PRICE_AVAILABLE");
    }

    /// @notice Calculate TWAP over period
    function getTWAP(address token) external view returns (uint256) {
        uint256[] memory history = priceHistory[token];
        uint256[] memory timestamps = timestampHistory[token];

        require(history.length > 0, "NO_HISTORY");

        uint256 cutoff = block.timestamp - TWAP_PERIOD;
        uint256 totalWeight = 0;
        uint256 weightedSum = 0;

        for (uint256 i = history.length; i > 0; i--) {
            uint256 idx = i - 1;
            if (timestamps[idx] < cutoff) break;

            uint256 weight = timestamps[idx] - cutoff;
            weightedSum += history[idx] * weight;
            totalWeight += weight;
        }

        require(totalWeight > 0, "INSUFFICIENT_DATA");
        return weightedSum / totalWeight;
    }

    /// @notice Get price for a trading pair
    function getPairPrice(address tokenA, address tokenB) external view returns (uint256) {
        uint256 priceA = prices[tokenA].price;
        uint256 priceB = prices[tokenB].price;

        require(priceA > 0 && priceB > 0, "MISSING_PRICE");

        // Return price of tokenA in terms of tokenB
        return (priceA * (10 ** PRICE_DECIMALS)) / priceB;
    }

    // ============ ADMIN FUNCTIONS ============

    function addToken(address token) external onlyOwner {
        require(!isSupported[token], "ALREADY_SUPPORTED");
        isSupported[token] = true;
        supportedTokens.push(token);
        emit TokenAdded(token);
    }

    function removeToken(address token) external onlyOwner {
        require(isSupported[token], "NOT_SUPPORTED");
        isSupported[token] = false;
        emit TokenRemoved(token);
    }

    function setChainlinkFeed(address token, address feed) external onlyOwner {
        uint8 decimals = AggregatorV3Interface(feed).decimals();
        chainlinkFeeds[token] = ChainlinkFeed({
            feedAddress: feed,
            decimals: decimals,
            isActive: true
        });
        emit ChainlinkFeedSet(token, feed);
    }

    function setUpdater(address _updater) external onlyOwner {
        updater = _updater;
    }

    function transferOwnership(address newOwner) external onlyOwner {
        owner = newOwner;
    }

    // ============ INTERNAL ============

    function _shiftArray(uint256[] storage arr) internal {
        for (uint256 i = 0; i < arr.length - 1; i++) {
            arr[i] = arr[i + 1];
        }
        arr.pop();
    }

    function getSupportedTokens() external view returns (address[] memory) {
        return supportedTokens;
    }
}
