// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IJvdEgcrRouter {
    function route721(address from, address to, uint256 tokenId, address token) external returns (bool);
}

/**
 * JRC721WithJvdRouter - JRC-721 NFT with Mandatory JVD EGCR Routing
 * All transfers must be routed through JvdEgcrRouter for:
 * - Audit trail logging
 * - Fee enforcement
 * - Settlement tracking
 * - Compliance checks
 */
contract JRC721WithJvdRouter is ERC721, Ownable {
    address public router;

    event RouterUpdated(address indexed oldRouter, address indexed newRouter);

    constructor(string memory name, string memory symbol, address routerAddress) ERC721(name, symbol) Ownable() {
        require(routerAddress != address(0), "Router address cannot be zero");
        router = routerAddress;
    }

    function safeTransferFrom(address from, address to, uint256 tokenId) public override {
        require(IJvdEgcrRouter(router).route721(from, to, tokenId, address(this)), "Routing failed");
        super.safeTransferFrom(from, to, tokenId);
    }

    function safeTransferFrom(address from, address to, uint256 tokenId, bytes memory data) public override {
        require(IJvdEgcrRouter(router).route721(from, to, tokenId, address(this)), "Routing failed");
        super.safeTransferFrom(from, to, tokenId, data);
    }

    function transferFrom(address from, address to, uint256 tokenId) public override {
        require(IJvdEgcrRouter(router).route721(from, to, tokenId, address(this)), "Routing failed");
        super.transferFrom(from, to, tokenId);
    }

    function mint(address to, uint256 tokenId) external onlyOwner {
        _safeMint(to, tokenId);
    }

    /**
     * Update router address (only owner)
     * Use with caution - this affects all transfer routing
     */
    function updateRouter(address newRouter) external onlyOwner {
        require(newRouter != address(0), "Router cannot be zero");
        address oldRouter = router;
        router = newRouter;
        emit RouterUpdated(oldRouter, newRouter);
    }
}
