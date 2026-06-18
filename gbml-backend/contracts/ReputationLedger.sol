// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ReputationLedger {
    address public owner;

    struct Reputation {
        uint256 totalScore;
        uint256 count;
        uint256 averageScore;
    }

    struct Rating {
        uint256 score;
        string review;
        uint256 timestamp;
        address rater;
        address target;
    }

    mapping(address => Reputation) public reputations;
    mapping(address => Rating[]) public ratingsReceived;

    uint256 public totalRatings;
    uint256 public constant MAX_SCORE = 5;
    uint256 public constant MIN_SCORE = 1;

    event Rated(address indexed target, address indexed rater, uint256 score, string review);
    event ReputationUpdated(address indexed target, uint256 newAverage, uint256 totalCount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor(address _owner) {
        require(_owner != address(0), "Zero address owner");
        owner = _owner;
    }

    function rate(address target, uint256 score, string calldata review) public {
        require(target != address(0), "Zero address target");
        require(target != msg.sender, "Cannot self-rate");
        require(score >= MIN_SCORE && score <= MAX_SCORE, "Score out of range");

        Reputation storage rep = reputations[target];
        rep.totalScore += score;
        rep.count += 1;
        rep.averageScore = rep.totalScore / rep.count;

        ratingsReceived[target].push(Rating({
            score: score,
            review: review,
            timestamp: block.timestamp,
            rater: msg.sender,
            target: target
        }));

        totalRatings++;

        emit Rated(target, msg.sender, score, review);
        emit ReputationUpdated(target, rep.averageScore, rep.count);
    }

    function batchRate(address[] calldata targets, uint256[] calldata scores, string[] calldata reviews) external {
        require(targets.length == scores.length, "Length mismatch");
        require(targets.length == reviews.length, "Reviews length mismatch");

        for (uint256 i = 0; i < targets.length; i++) {
            rate(targets[i], scores[i], reviews[i]);
        }
    }

    function getReputation(address target) external view returns (Reputation memory) {
        return reputations[target];
    }

    function getRatingsCount(address target) external view returns (uint256) {
        return ratingsReceived[target].length;
    }

    function getRatingsPaginated(address target, uint256 offset, uint256 limit) external view returns (Rating[] memory) {
        Rating[] storage allRatings = ratingsReceived[target];
        uint256 total = allRatings.length;

        if (offset >= total) {
            return new Rating[](0);
        }

        uint256 end = offset + limit;
        if (end > total) {
            end = total;
        }

        uint256 resultCount = end - offset;
        Rating[] memory result = new Rating[](resultCount);

        for (uint256 i = 0; i < resultCount; i++) {
            result[i] = allRatings[offset + i];
        }

        return result;
    }

    function getAverageScore(address target) external view returns (uint256) {
        Reputation storage rep = reputations[target];
        if (rep.count == 0) return 0;
        return rep.averageScore;
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Zero address new owner");
        owner = newOwner;
    }
}
