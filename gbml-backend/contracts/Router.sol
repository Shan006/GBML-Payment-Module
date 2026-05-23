// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Router {
    address public treasury;
    address public owner;

    event PaymentRouted(address indexed token, address indexed from, address indexed to, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor(address _treasury) {
        require(_treasury != address(0), "Zero address treasury");
        treasury = _treasury;
        owner = msg.sender;
    }

    function setTreasury(address _treasury) external onlyOwner {
        require(_treasury != address(0), "Zero address treasury");
        treasury = _treasury;
    }

    function routePayment(address token, address from, address to, uint256 amount) external {
        // Simple routing mechanism: call transferFrom on the token
        (bool success, bytes memory data) = token.call(
            abi.encodeWithSignature("transferFrom(address,address,uint256)", from, to, amount)
        );
        require(success && (data.length == 0 || abi.decode(data, (bool))), "Token routing transfer failed");

        emit PaymentRouted(token, from, to, amount);
    }
}
