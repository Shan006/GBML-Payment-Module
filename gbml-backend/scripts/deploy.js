import hre from "hardhat";

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    const JRC20 = await hre.ethers.getContractFactory("JRC20");

    // Parameters for the JRC-20 contract
    const name = "Acme USD";
    const symbol = "aUSD";
    const decimals = 18;
    const initialSupply = hre.ethers.parseUnits("1000000", decimals); // 1 million
    const treasury = deployer.address;

    console.log(`Parameters: Name=${name}, Symbol=${symbol}, Decimals=${decimals}, Supply=${initialSupply}, Treasury=${treasury}`);

    const contract = await JRC20.deploy(name, symbol, decimals, initialSupply, treasury);
    await contract.waitForDeployment();

    console.log("JRC20 deployed to:", await contract.getAddress());
    console.log("Update your .env or database with this address if needed.");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
