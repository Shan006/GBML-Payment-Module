// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Governance {
    address public owner;
    mapping(address => bool) public governors;
    
    event GovernorAdded(address indexed governor);
    event GovernorRemoved(address indexed governor);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier onlyGovernor() {
        require(governors[msg.sender] || msg.sender == owner, "Not governor");
        _;
    }

    constructor(address _owner) {
        require(_owner != address(0), "Zero address owner");
        owner = _owner;
        governors[_owner] = true;
        emit GovernorAdded(_owner);
    }

    function addGovernor(address governor) external onlyOwner {
        require(governor != address(0), "Zero address governor");
        require(!governors[governor], "Already a governor");
        governors[governor] = true;
        emit GovernorAdded(governor);
    }

    function removeGovernor(address governor) external onlyOwner {
        require(governors[governor], "Not a governor");
        governors[governor] = false;
        emit GovernorRemoved(governor);
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Zero address new owner");
        address oldOwner = owner;
        owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }

    function isGovernor(address account) external view returns (bool) {
        return governors[account];
    }
}
