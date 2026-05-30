// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
}

contract JvdRouter {
    event SettlementExecuted(
        address indexed recipient,
        address indexed token,
        uint256 amount
    );

    function settle(
        address token,
        address recipient,
        uint256 amount
    ) external {
        // Transfer tokens from the router contract to the recipient
        bool success = IERC20(token).transfer(recipient, amount);
        require(success, "Token transfer failed");

        emit SettlementExecuted(recipient, token, amount);
    }
}
