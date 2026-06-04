// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IJvdEgcrRouter {
    function route(address from, address to, uint256 amount, address token) external returns (bool);
}

/**
 * JRC20WithJvdRouter - JRC-20 Token with Mandatory JVD EGCR Routing
 * All transfers must be routed through JvdEgcrRouter for:
 * - Audit trail logging
 * - Fee enforcement
 * - Settlement tracking
 * - Compliance checks
 */
contract JRC20WithJvdRouter {
    string public name;
    string public symbol;
    uint8 public decimals;
    uint256 public totalSupply;

    address public treasury;
    address public router;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event RouterUpdated(address indexed oldRouter, address indexed newRouter);

    modifier onlyTreasury() {
        require(msg.sender == treasury, "Not treasury");
        _;
    }

    modifier onlyOwner() {
        require(msg.sender == treasury, "Not treasury (owner)");
        _;
    }

    constructor(
        string memory _name,
        string memory _symbol,
        uint8 _decimals,
        uint256 _initialSupply,
        address _treasury,
        address _router
    ) {
        require(_router != address(0), "Router address cannot be zero");
        
        name = _name;
        symbol = _symbol;
        decimals = _decimals;
        treasury = _treasury;
        router = _router;

        _mint(_treasury, _initialSupply);
    }

    function _mint(address to, uint256 amount) internal {
        totalSupply += amount;
        balanceOf[to] += amount;
        emit Transfer(address(0), to, amount);
    }

    function mint(address to, uint256 amount) external onlyTreasury {
        _mint(to, amount);
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        require(IJvdEgcrRouter(router).route(msg.sender, to, amount, address(this)), "Routing failed");
        _transfer(msg.sender, to, amount);
        return true;
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) external returns (bool) {
        require(IJvdEgcrRouter(router).route(from, to, amount, address(this)), "Routing failed");
        uint256 allowed = allowance[from][msg.sender];
        require(allowed >= amount, "Allowance exceeded");

        allowance[from][msg.sender] = allowed - amount;
        _transfer(from, to, amount);
        return true;
    }

    function _transfer(address from, address to, uint256 amount) internal {
        require(balanceOf[from] >= amount, "Insufficient balance");

        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        emit Transfer(from, to, amount);
    }

    /**
     * Update router address (only treasury/owner)
     * Use with caution - this affects all transfer routing
     */
    function updateRouter(address newRouter) external onlyOwner {
        require(newRouter != address(0), "Router cannot be zero");
        address oldRouter = router;
        router = newRouter;
        emit RouterUpdated(oldRouter, newRouter);
    }
}
