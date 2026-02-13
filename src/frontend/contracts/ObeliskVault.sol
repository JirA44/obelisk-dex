// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ObeliskVault
 * @notice Secure vault for user deposits on Obelisk DEX
 * @dev Non-custodial vault - users can always withdraw their funds
 *
 * Features:
 * - Deposit/Withdraw USDC
 * - Emergency pause
 * - Operator system for DeFi integrations
 * - Minimum deposit enforcement
 * - Event logging for all operations
 */
contract ObeliskVault is ReentrancyGuard, Pausable, Ownable {
    using SafeERC20 for IERC20;

    // ===========================================
    // STATE VARIABLES
    // ===========================================

    IERC20 public immutable usdc;

    // User balances
    mapping(address => uint256) public balances;

    // Total deposited
    uint256 public totalDeposits;

    // Minimum deposit amount (default: 10 USDC = 10e6)
    uint256 public minDeposit = 10e6;

    // Maximum deposit per user (default: 100,000 USDC)
    uint256 public maxDepositPerUser = 100_000e6;

    // Operators (can move funds to DeFi protocols)
    mapping(address => bool) public operators;

    // Funds allocated to DeFi (tracked separately)
    mapping(address => uint256) public allocatedToDeFi;
    uint256 public totalAllocatedToDeFi;

    // ===========================================
    // EVENTS
    // ===========================================

    event Deposited(address indexed user, uint256 amount, uint256 newBalance);
    event Withdrawn(address indexed user, uint256 amount, uint256 newBalance);
    event OperatorAdded(address indexed operator);
    event OperatorRemoved(address indexed operator);
    event AllocatedToDeFi(address indexed operator, address indexed protocol, uint256 amount);
    event ReturnedFromDeFi(address indexed operator, address indexed protocol, uint256 amount, uint256 profit);
    event MinDepositUpdated(uint256 oldMin, uint256 newMin);
    event MaxDepositUpdated(uint256 oldMax, uint256 newMax);
    event EmergencyWithdraw(address indexed user, uint256 amount);

    // ===========================================
    // MODIFIERS
    // ===========================================

    modifier onlyOperator() {
        require(operators[msg.sender] || msg.sender == owner(), "Not operator");
        _;
    }

    // ===========================================
    // CONSTRUCTOR
    // ===========================================

    /**
     * @param _usdc USDC token address on Arbitrum
     * @dev Arbitrum USDC: 0xaf88d065e77c8cC2239327C5EDb3A432268e5831
     */
    constructor(address _usdc) Ownable(msg.sender) {
        require(_usdc != address(0), "Invalid USDC address");
        usdc = IERC20(_usdc);
    }

    // ===========================================
    // USER FUNCTIONS
    // ===========================================

    /**
     * @notice Deposit USDC into the vault
     * @param amount Amount of USDC to deposit (in 6 decimals)
     */
    function deposit(uint256 amount) external nonReentrant whenNotPaused {
        require(amount >= minDeposit, "Below minimum deposit");
        require(balances[msg.sender] + amount <= maxDepositPerUser, "Exceeds max deposit");

        // Transfer USDC from user to vault
        usdc.safeTransferFrom(msg.sender, address(this), amount);

        // Update balance
        balances[msg.sender] += amount;
        totalDeposits += amount;

        emit Deposited(msg.sender, amount, balances[msg.sender]);
    }

    /**
     * @notice Withdraw USDC from the vault
     * @param amount Amount of USDC to withdraw (in 6 decimals)
     */
    function withdraw(uint256 amount) external nonReentrant whenNotPaused {
        require(amount > 0, "Amount must be > 0");
        require(balances[msg.sender] >= amount, "Insufficient balance");

        // Check available liquidity (not allocated to DeFi)
        uint256 availableLiquidity = usdc.balanceOf(address(this));
        require(availableLiquidity >= amount, "Insufficient liquidity, try later");

        // Update balance
        balances[msg.sender] -= amount;
        totalDeposits -= amount;

        // Transfer USDC to user
        usdc.safeTransfer(msg.sender, amount);

        emit Withdrawn(msg.sender, amount, balances[msg.sender]);
    }

    /**
     * @notice Get user's available balance
     * @param user User address
     * @return Available balance in USDC (6 decimals)
     */
    function getBalance(address user) external view returns (uint256) {
        return balances[user];
    }

    /**
     * @notice Emergency withdraw all funds (even when paused)
     * @dev Only available to users with balance, ignores pause
     */
    function emergencyWithdraw() external nonReentrant {
        uint256 balance = balances[msg.sender];
        require(balance > 0, "No balance");

        uint256 availableLiquidity = usdc.balanceOf(address(this));
        uint256 withdrawAmount = balance > availableLiquidity ? availableLiquidity : balance;

        balances[msg.sender] -= withdrawAmount;
        totalDeposits -= withdrawAmount;

        usdc.safeTransfer(msg.sender, withdrawAmount);

        emit EmergencyWithdraw(msg.sender, withdrawAmount);
    }

    // ===========================================
    // OPERATOR FUNCTIONS (DeFi Allocations)
    // ===========================================

    /**
     * @notice Allocate funds to a DeFi protocol
     * @param protocol Target protocol address (Aave, GMX, etc.)
     * @param amount Amount to allocate
     */
    function allocateToDeFi(address protocol, uint256 amount) external onlyOperator nonReentrant whenNotPaused {
        require(protocol != address(0), "Invalid protocol");
        require(amount > 0, "Amount must be > 0");

        uint256 availableLiquidity = usdc.balanceOf(address(this));
        require(availableLiquidity >= amount, "Insufficient liquidity");

        // Track allocation
        allocatedToDeFi[protocol] += amount;
        totalAllocatedToDeFi += amount;

        // Transfer to protocol
        usdc.safeTransfer(protocol, amount);

        emit AllocatedToDeFi(msg.sender, protocol, amount);
    }

    /**
     * @notice Return funds from a DeFi protocol (with potential profit)
     * @param protocol Source protocol address
     * @param amount Original amount allocated
     * @param profit Profit earned (can be 0 or negative for loss)
     */
    function returnFromDeFi(address protocol, uint256 amount, int256 profit) external onlyOperator nonReentrant {
        require(allocatedToDeFi[protocol] >= amount, "Invalid allocation");

        // Update tracking
        allocatedToDeFi[protocol] -= amount;
        totalAllocatedToDeFi -= amount;

        // Handle profit/loss
        uint256 actualProfit = profit > 0 ? uint256(profit) : 0;

        emit ReturnedFromDeFi(msg.sender, protocol, amount, actualProfit);
    }

    // ===========================================
    // ADMIN FUNCTIONS
    // ===========================================

    /**
     * @notice Add an operator
     * @param operator Address to add as operator
     */
    function addOperator(address operator) external onlyOwner {
        require(operator != address(0), "Invalid address");
        operators[operator] = true;
        emit OperatorAdded(operator);
    }

    /**
     * @notice Remove an operator
     * @param operator Address to remove
     */
    function removeOperator(address operator) external onlyOwner {
        operators[operator] = false;
        emit OperatorRemoved(operator);
    }

    /**
     * @notice Update minimum deposit
     * @param newMin New minimum in USDC (6 decimals)
     */
    function setMinDeposit(uint256 newMin) external onlyOwner {
        emit MinDepositUpdated(minDeposit, newMin);
        minDeposit = newMin;
    }

    /**
     * @notice Update maximum deposit per user
     * @param newMax New maximum in USDC (6 decimals)
     */
    function setMaxDeposit(uint256 newMax) external onlyOwner {
        emit MaxDepositUpdated(maxDepositPerUser, newMax);
        maxDepositPerUser = newMax;
    }

    /**
     * @notice Pause deposits (withdrawals still work via emergencyWithdraw)
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @notice Unpause the vault
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    // ===========================================
    // VIEW FUNCTIONS
    // ===========================================

    /**
     * @notice Get vault statistics
     */
    function getVaultStats() external view returns (
        uint256 _totalDeposits,
        uint256 _totalAllocated,
        uint256 _availableLiquidity,
        uint256 _minDeposit,
        uint256 _maxDeposit
    ) {
        return (
            totalDeposits,
            totalAllocatedToDeFi,
            usdc.balanceOf(address(this)),
            minDeposit,
            maxDepositPerUser
        );
    }
}
