const solc = require('solc');
const fs = require('fs');

const sourceCode = `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract MockUSDC {
    string public name = "USD Coin";
    string public symbol = "USDC";
    uint8 public decimals = 18;
    uint256 public totalSupply;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    function mint(address to, uint256 amount) public {
        balanceOf[to] += amount;
        totalSupply += amount;
        emit Transfer(address(0), to, amount);
    }

    function transfer(address to, uint256 amount) public returns (bool) {
        require(balanceOf[msg.sender] >= amount, "Insufficient balance");
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        emit Transfer(msg.sender, to, amount);
        return true;
    }

    function approve(address spender, uint256 amount) public returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) public returns (bool) {
        require(balanceOf[from] >= amount, "Insufficient balance");
        require(allowance[from][msg.sender] >= amount, "Insufficient allowance");
        allowance[from][msg.sender] -= amount;
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        emit Transfer(from, to, amount);
        return true;
    }
}

contract RitualStaking {
    MockUSDC public usdcToken;
    
    mapping(address => uint256) public stakedRitual;
    mapping(address => uint256) public stakedUsdc;

    event StakedRitual(address indexed user, uint256 amount);
    event WithdrawnRitual(address indexed user, uint256 amount);
    event StakedUsdc(address indexed user, uint256 amount);
    event WithdrawnUsdc(address indexed user, uint256 amount);

    constructor(address _usdcToken) {
        usdcToken = MockUSDC(_usdcToken);
    }

    function stakeRitual() public payable {
        require(msg.value > 0, "Must stake more than 0");
        stakedRitual[msg.sender] += msg.value;
        emit StakedRitual(msg.sender, msg.value);
    }

    function withdrawRitual(uint256 amount) public {
        require(stakedRitual[msg.sender] >= amount, "Insufficient staked RITUAL");
        stakedRitual[msg.sender] -= amount;
        payable(msg.sender).transfer(amount);
        emit WithdrawnRitual(msg.sender, amount);
    }

    function stakeUsdc(uint256 amount) public {
        require(amount > 0, "Must stake more than 0");
        require(usdcToken.transferFrom(msg.sender, address(this), amount), "USDC transfer failed");
        stakedUsdc[msg.sender] += amount;
        emit StakedUsdc(msg.sender, amount);
    }

    function withdrawUsdc(uint256 amount) public {
        require(stakedUsdc[msg.sender] >= amount, "Insufficient staked USDC");
        stakedUsdc[msg.sender] -= amount;
        require(usdcToken.transfer(msg.sender, amount), "USDC transfer failed");
        emit WithdrawnUsdc(msg.sender, amount);
    }
}
`;

const input = {
    language: 'Solidity',
    sources: { 'Contracts.sol': { content: sourceCode } },
    settings: { outputSelection: { '*': { '*': ['*'] } } }
};

const output = JSON.parse(solc.compile(JSON.stringify(input)));

if (output.errors) {
    output.errors.forEach(err => console.error(err.formattedMessage));
}

const usdc = output.contracts['Contracts.sol']['MockUSDC'];
const staking = output.contracts['Contracts.sol']['RitualStaking'];

const exported = {
    USDC: { abi: usdc.abi, bytecode: usdc.evm.bytecode.object },
    STAKING: { abi: staking.abi, bytecode: staking.evm.bytecode.object }
};

fs.writeFileSync('compiled.json', JSON.stringify(exported, null, 2));
console.log("Compiled successfully!");
