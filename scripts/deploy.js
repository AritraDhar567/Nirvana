
// // scripts/deploy.js

// async function main() {
//     // Get the deployer's address
//     const [deployer] = await ethers.getSigners();
    
//     console.log("Deploying contracts with the account:", deployer.address);
    
//     // Get the ContractFactory for the CardTransactionRegistry contract
//     const CardTransactionRegistry = await ethers.getContractFactory("CardTransactionRegistry");
    
//     // Deploy the contract
//     const cardTransactionRegistry = await CardTransactionRegistry.deploy();
    
//     console.log("Deploying transaction hash:", cardTransactionRegistry.deployTransaction.hash);
    
//     // Wait for the contract to be mined
//     await cardTransactionRegistry.deployTransaction.wait();
    
//     console.log("CardTransactionRegistry contract deployed to:", cardTransactionRegistry.address);
//   }
  
//   // Execute the main function and handle errors
//   main()
//     .then(() => process.exit(0))
//     .catch((error) => {
//       console.error(error);
//       process.exit(1);
//     });



// Import the 'fs' module to interact with the file system

const fs = require('fs');
const path = './src/landing_page/Shipment/contractAddress.json';  // Path to where the contract address will be saved

async function main() {
  // Get the deployer's address
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  
  // Get the ContractFactory for the CardTransactionRegistry contract
  const CardTransactionRegistry = await ethers.getContractFactory("CardTransactionRegistry");
  
  // Deploy the contract
  let cardTransactionRegistry;
  try {
    cardTransactionRegistry = await CardTransactionRegistry.deploy();
    console.log("Contract deployment initiated...");
    
    // Wait for the contract to be deployed
    await cardTransactionRegistry.waitForDeployment();
    console.log("Contract successfully deployed");
    
    // Log the contract deployment transaction hash
    console.log("Deploying transaction hash:", cardTransactionRegistry.deploymentTransaction().hash);
  
    // Log the contract address
    console.log("CardTransactionRegistry contract deployed to:", cardTransactionRegistry.target);
  
    // Prepare the contract address to be written to the file
    const contractData = {
      address: cardTransactionRegistry.target,  // `target` holds the deployed contract address
    };
  
    // Write the contract address to a JSON file for the frontend to use
    fs.writeFileSync(path, JSON.stringify(contractData, null, 2));
    console.log("Contract address saved to src/contractAddress.json");

  } catch (deployError) {
    console.error("Error deploying the contract:", deployError);
    process.exit(1);
  }
}

// Execute the main function and handle errors
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });