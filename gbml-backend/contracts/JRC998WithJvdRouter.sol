// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IJvdEgcrRouter {
    function route998(address from, address to, uint256 tokenId, address token) external returns (bool);
}

contract JRC998WithJvdRouter is ERC721Enumerable, Ownable {
    address public router;

    event RouterUpdated(address indexed oldRouter, address indexed newRouter);

    constructor(string memory name, string memory symbol, address routerAddress) ERC721(name, symbol) Ownable() {
        require(routerAddress != address(0), "Router address cannot be zero");
        router = routerAddress;
    }

    function safeTransferFrom(address from, address to, uint256 tokenId) public override {
        require(IJvdEgcrRouter(router).route998(from, to, tokenId, address(this)), "Routing failed");
        super.safeTransferFrom(from, to, tokenId);
    }

    function safeTransferFrom(address from, address to, uint256 tokenId, bytes memory data) public override {
        require(IJvdEgcrRouter(router).route998(from, to, tokenId, address(this)), "Routing failed");
        super.safeTransferFrom(from, to, tokenId, data);
    }

    function transferFrom(address from, address to, uint256 tokenId) public override {
        require(IJvdEgcrRouter(router).route998(from, to, tokenId, address(this)), "Routing failed");
        super.transferFrom(from, to, tokenId);
    }

    function mint(address to, uint256 tokenId) external onlyOwner {
        _safeMint(to, tokenId);
    }

    function updateRouter(address newRouter) external onlyOwner {
        require(newRouter != address(0), "Router cannot be zero");
        address oldRouter = router;
        router = newRouter;
        emit RouterUpdated(oldRouter, newRouter);
    }
}
