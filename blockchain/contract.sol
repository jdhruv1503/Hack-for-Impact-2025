// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract PeriodicElectricityDeduction {
    struct UserElectricityUsage {
        uint256 totalCost;
        uint256 lastCharged;
    }

    mapping(address => UserElectricityUsage) public usageRecords;
    mapping(address => uint256) public balances;

    uint256 public chargeInterval = 1 days; // Time interval for deductions
    address public owner;

    event UsageRegistered(address indexed user, uint256 unitsUsed, uint256 totalCost);
    event Charged(address indexed user, uint256 amountDeducted);
    event Deposit(address indexed user, uint256 amount);
    event Withdrawal(address indexed user, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function registerElectricityUsage(uint256 unitsUsed) external {
        require(unitsUsed > 0, "Electricity usage must be greater than zero");

        uint256 ratePerUnit = (uint256(keccak256(abi.encodePacked(block.timestamp, block.difficulty, msg.sender))) % 10) + 1;
        uint256 totalCost = unitsUsed * ratePerUnit;

        usageRecords[msg.sender] = UserElectricityUsage(totalCost, block.timestamp);

        emit UsageRegistered(msg.sender, unitsUsed, totalCost);
    }

    function deposit() external payable {
        require(msg.value > 0, "Deposit must be greater than zero");
        balances[msg.sender] += msg.value;
        emit Deposit(msg.sender, msg.value);
    }

    function chargeUsers() external {
        address[] memory users; // Create an array with 1 element
        users[0] = 0x76397f7DBb255E44607E0aD1511412a0C08B0E47; // Off-chain tracking required
        uint256 currentTime = block.timestamp;

        for (uint256 i = 0; i < users.length; i++) {
            address user = users[i];
            UserElectricityUsage storage usage = usageRecords[user];

            if (usage.totalCost > 0 && (currentTime - usage.lastCharged) >= chargeInterval) {
                require(balances[user] >= usage.totalCost, "Insufficient balance");

                balances[user] -= usage.totalCost;
                usage.lastCharged = currentTime;

                emit Charged(user, usage.totalCost);
            }
        }
    }

    function withdraw(uint256 amount) external {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        balances[msg.sender] -= amount;
        payable(msg.sender).transfer(amount);
        emit Withdrawal(msg.sender, amount);
    }


    receive() external payable {
        require(msg.value > 0, "Deposit must be greater than zero");
        balances[msg.sender] += msg.value;
        emit Deposit(msg.sender, msg.value);
    }
}   