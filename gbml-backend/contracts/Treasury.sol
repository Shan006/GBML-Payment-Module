// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Treasury {
    address public owner;

    event Deposited(address indexed sender, uint256 amount);
    event Withdrawn(address indexed beneficiary, uint256 amount);
    event TokenWithdrawn(address indexed token, address indexed beneficiary, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor(address _owner) {
        require(_owner != address(0), "Zero address owner");
        owner = _owner;
    }

    // Accept native funds
    receive() external payable {
        emit Deposited(msg.sender, msg.value);
    }

    fallback() external payable {
        emit Deposited(msg.sender, msg.value);
    }

    function withdraw(uint256 amount, address payable beneficiary) external onlyOwner {
        require(beneficiary != address(0), "Zero address beneficiary");
        require(address(this).balance >= amount, "Insufficient treasury balance");
        beneficiary.transfer(amount);
        emit Withdrawn(beneficiary, amount);
    }

    function withdrawToken(address token, uint256 amount, address beneficiary) external onlyOwner {
        require(beneficiary != address(0), "Zero address beneficiary");
        
        // Use low-level call to avoid hardcoded interface requirements
        (bool success, bytes memory data) = token.call(
            abi.encodeWithSignature("transfer(address,uint256)", beneficiary, amount)
        );
        require(success && (data.length == 0 || abi.decode(data, (bool))), "Token transfer failed");
        
        emit TokenWithdrawn(token, beneficiary, amount);
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Zero address new owner");
        owner = newOwner;
    }
}
