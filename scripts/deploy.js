const fs = require("fs");
const path = require("path");
const hre = require("hardhat");

async function main() {
  console.log("Network:", hre.network.name);

  const ChainShield = await hre.ethers.getContractFactory("ChainShield");
  const contract = await ChainShield.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  const [deployer] = await hre.ethers.getSigners();

  console.log("ChainShield deployed to:", address);
  console.log("Deployed by (owner):", await deployer.getAddress());

  // The backend server reads this file to know where the contract lives
  // and what its ABI is — no need to hand-copy addresses around.
  const artifact = await hre.artifacts.readArtifact("ChainShield");
  const deploymentInfo = {
    network: hre.network.name,
    address,
    owner: await deployer.getAddress(),
    abi: artifact.abi,
    deployedAt: new Date().toISOString(),
  };

  const outPath = path.join(__dirname, "..", "deployments.json");
  fs.writeFileSync(outPath, JSON.stringify(deploymentInfo, null, 2));
  console.log("Wrote deployment info to:", outPath);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
