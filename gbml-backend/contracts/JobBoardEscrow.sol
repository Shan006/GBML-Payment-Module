// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract JobBoardEscrow {
    address public owner;
    address public tokenAddress;

    enum JobStatus { OPEN, ASSIGNED, COMPLETED, DISPUTED, RESOLVED, CANCELLED }

    struct Job {
        uint256 id;
        address employer;
        address freelancer;
        uint256 budget;
        JobStatus status;
        string metadataUri;
        uint256 createdAt;
        address winner;
    }

    uint256 public jobCount;
    mapping(uint256 => Job) public jobs;
    mapping(uint256 => address) public disputes;
    mapping(uint256 => string) public disputeReasons;

    event JobCreated(uint256 indexed jobId, address indexed employer, uint256 budget, string metadataUri);
    event JobAssigned(uint256 indexed jobId, address indexed freelancer);
    event JobCompleted(uint256 indexed jobId, address indexed freelancer, uint256 amount);
    event JobCancelled(uint256 indexed jobId);
    event DisputeRaised(uint256 indexed jobId, address indexed raisedBy, string reason);
    event DisputeResolved(uint256 indexed jobId, address indexed winner);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier onlyEmployer(uint256 jobId) {
        require(msg.sender == jobs[jobId].employer, "Not employer");
        _;
    }

    constructor(address _tokenAddress, address _owner) {
        require(_tokenAddress != address(0), "Zero token address");
        require(_owner != address(0), "Zero owner address");
        tokenAddress = _tokenAddress;
        owner = _owner;
    }

    function createJob(uint256 budget, string calldata metadataUri) external returns (uint256) {
        require(budget > 0, "Budget must be > 0");
        require(bytes(metadataUri).length > 0, "Metadata required");

        jobCount++;
        uint256 jobId = jobCount;

        jobs[jobId] = Job({
            id: jobId,
            employer: msg.sender,
            freelancer: address(0),
            budget: budget,
            status: JobStatus.OPEN,
            metadataUri: metadataUri,
            createdAt: block.timestamp,
            winner: address(0)
        });

        require(
            IERC20(tokenAddress).transferFrom(msg.sender, address(this), budget),
            "Transfer failed"
        );

        emit JobCreated(jobId, msg.sender, budget, metadataUri);
        return jobId;
    }

    function assignJob(uint256 jobId) external {
        Job storage job = jobs[jobId];
        require(job.status == JobStatus.OPEN, "Job not open");
        require(msg.sender != job.employer, "Employer cannot assign self");

        job.freelancer = msg.sender;
        job.status = JobStatus.ASSIGNED;

        emit JobAssigned(jobId, msg.sender);
    }

    function completeJob(uint256 jobId) external onlyEmployer(jobId) {
        Job storage job = jobs[jobId];
        require(job.status == JobStatus.ASSIGNED, "Job not assigned");
        require(job.freelancer != address(0), "No freelancer");

        job.status = JobStatus.COMPLETED;

        require(
            IERC20(tokenAddress).transfer(job.freelancer, job.budget),
            "Release failed"
        );

        emit JobCompleted(jobId, job.freelancer, job.budget);
    }

    function cancelJob(uint256 jobId) external {
        Job storage job = jobs[jobId];
        require(
            msg.sender == job.employer || msg.sender == owner,
            "Not authorized"
        );
        require(
            job.status == JobStatus.OPEN || job.status == JobStatus.ASSIGNED,
            "Cannot cancel"
        );

        job.status = JobStatus.CANCELLED;

        require(
            IERC20(tokenAddress).transfer(job.employer, job.budget),
            "Refund failed"
        );

        emit JobCancelled(jobId);
    }

    function raiseDispute(uint256 jobId, string calldata reason) external {
        Job storage job = jobs[jobId];
        require(
            job.status == JobStatus.ASSIGNED || job.status == JobStatus.COMPLETED,
            "Cannot dispute"
        );
        require(
            msg.sender == job.employer || msg.sender == job.freelancer,
            "Not party to job"
        );

        job.status = JobStatus.DISPUTED;
        disputes[jobId] = msg.sender;
        disputeReasons[jobId] = reason;

        emit DisputeRaised(jobId, msg.sender, reason);
    }

    function resolveDispute(uint256 jobId, address winner) external onlyOwner {
        Job storage job = jobs[jobId];
        require(job.status == JobStatus.DISPUTED, "Not disputed");
        require(winner == job.employer || winner == job.freelancer, "Invalid winner");

        job.status = JobStatus.RESOLVED;
        job.winner = winner;

        require(
            IERC20(tokenAddress).transfer(winner, job.budget),
            "Resolution transfer failed"
        );

        emit DisputeResolved(jobId, winner);
    }

    function getJob(uint256 jobId) external view returns (Job memory) {
        require(jobId > 0 && jobId <= jobCount, "Invalid job ID");
        return jobs[jobId];
    }

    function getEscrowBalance() external view returns (uint256) {
        return IERC20(tokenAddress).balanceOf(address(this));
    }
}
