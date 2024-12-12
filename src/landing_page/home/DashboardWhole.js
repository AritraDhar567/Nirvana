import React, { useState, useEffect } from "react";
import SideWhole from "../SideWhole.js";
import "./ShipmentTracker.css"; // For styling
import { ethers } from "ethers"; // ethers v6
import CardTransactionRegistry from "./CardTransactionRegistry.json"; // Import your ABI JSON
import contractConfig from '../Shipment/contractAddress.json';



const getTruckPosition = (status) => {
  switch (status) {
    case "PENDING":
      return "0%";
    case "IN_TRANSIT_WHOLESALER":
      return "25%";
    case "WHOLESALER_RECEIVED":
      return "50%";
    case "IN_TRANSIT_RETAILER":
      return "75%";
    case "DELIVERED":
      return "94%";
    default:
      return "0%";
  }
};

const getStatusClass = (status) => {
  switch (status) {
    case "PENDING":
      return "status-pending";
    case "IN_TRANSIT_WHOLESALER":
      return "status-in_transit";
    case "WHOLESALER_RECEIVED":
      return "status-received_by_wholesaler";
    case "IN_TRANSIT_RETAILER":
      return "status-in_transit";
    case "DELIVERED":
      return "status-completed";
    default:
      return "";
  }
};

function DashWhole({ qrData }) {
  const [contract, setContract] = useState(null);
  const [allTransactions, setAllTransactions] = useState([]); // Updated: use for shipment data
  const [showTracker, setShowTracker] = useState([]);
  const [animating, setAnimating] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [walletAddress, setWalletAddress] = useState(null);// for storing connected wallet addresss
  const contractAddress = contractConfig.address;

  useEffect(() => {
    const init = async () => {
      await loadContract();
    };
    init();
  }, []);

  useEffect(() => {
    if (contract && walletAddress) {
      fetchAllTransactions(); // Call this only after the contract and wallet address are set
    }
  }, [contract, walletAddress]); // Adding both contract and walletAddress as dependencies



   const loadContract = async () => {
    if (typeof window.ethereum !== "undefined") {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      
      const checksummedAddress = ethers.getAddress(accounts[0]); // Get the checksummed address
      setWalletAddress(checksummedAddress); // Store the checksummed address
  
      const provider = new ethers.BrowserProvider(window.ethereum); // Create a provider for MetaMask
      const signer = await provider.getSigner(checksummedAddress); // Get the signer for the wallet address
      const cardTransactionRegistry = new ethers.Contract(
        contractAddress,
        CardTransactionRegistry.abi,
        signer
      );
      setContract(cardTransactionRegistry);
    }
  };

  const fetchAllTransactions = async () => {
    if (contract) {
      try {
        const [
          cardIds,
          receiverAddressesW,
          receiverAddressesR,
          dates,
          receiverAddressesM,
          statuses,
        ] = await contract.getAllTransactions();

        // Filter and directly format the transactions for the matching wallet address
        const formattedTransactions = [];
        for (let i = 0; i < cardIds.length; i++) {
            if (receiverAddressesW[i] === walletAddress) {
                formattedTransactions.push({
                    cardId: cardIds[i],
                    receiverAddressW: receiverAddressesW[i],
                    receiverAddressR: receiverAddressesR[i],
                    date: dates[i],
                    receiverAddressesM: receiverAddressesM[i],
                    
                    status: statuses[i] // This will now be a string
                });
            }
        }

        setAllTransactions(formattedTransactions); // Update local state
        setShowTracker(Array(formattedTransactions.length).fill(false)); // Set tracking visibility state
        setAnimating(Array(formattedTransactions.length).fill(false)); // Set animation state
      } catch (error) {
        console.error(
          "Error fetching all transactions:",
          error.message || JSON.stringify(error)
        );
        setErrorMessage("Error fetching all transactions.");
      }
    }
  };

  const toggleTracker = (index) => {
    setShowTracker((prev) => {
      const updated = [...prev];
      updated[index] = !updated[index];
      return updated;
    });

    if (!showTracker[index]) {
      setAnimating((prev) => {
        const updated = [...prev];
        updated[index] = true;
        return updated;
      });

      setTimeout(() => {
        setAnimating((prev) => {
          const updated = [...prev];
          updated[index] = false;
          return updated;
        });
      }, 100); // Increased timeout for smoother effect
    }
  };

  return (
    <div className="dash-board">
      <SideWhole />
      <h1>Wholesaler Dashboard</h1>


      <div className="shipment-container">
        <h1>Shipment Table</h1>
        <table className="shipment-table">
          <thead>
            <tr>
              <th>Cart ID</th>
              <th>Wholesaler Address</th>
              <th>Retailer Address</th>
              <th>Date</th>
              <th>ManuFactureAddress</th>
              
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {allTransactions.map((shipment, index) => (
              <tr key={shipment.cardId}>
                <td>{shipment.cardId}</td>
                <td>{shipment.receiverAddressW}</td>
                <td>{shipment.receiverAddressR}</td>
                <td>{shipment.date}</td>
                <td>{shipment.receiverAddressesM}</td>
               
                <td>
                  <span className={getStatusClass(shipment.status)}>
                    {shipment.status.replace(/_/g, " ")}
                  </span>
                </td>
                <td>
                  <button
                    className={`ship-button ${
                      showTracker[index] ? "hide-tracking" : "show-tracking"
                    }`}
                    onClick={() => toggleTracker(index)}
                  >
                    {showTracker[index] ? "Hide Tracking" : "Show Tracking"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {allTransactions.map(
          (shipment, index) =>
            showTracker[index] && (
              <div key={index} className="shipment-item">
                <h3 className="h3-ship">Shipment #{shipment.cardId}</h3>
                <div className="enhanced-progress-bar">
                  <div className="progress-background"></div>
                  <div
                    className={`truck ${animating[index] ? "animate-truck" : ""}`}
                    style={{
                      left: animating[index] ? "0%" : getTruckPosition(shipment.status),
                    }}
                  >
                    <img src="media/NHC (1).png" width={95} className="truck-img" alt="truck" />
                  </div>
                  <div className="status-dot" style={{ left: "0%" }}></div>
                  <div className="status-dot" style={{ left: "25%" }}></div>
                  <div className="status-dot" style={{ left: "50%" }}></div>
                  <div className="status-dot" style={{ left: "75%" }}></div>
                  <div className="status-dot" style={{ left: "99%" }}></div>
                  <div className="status-checkpoint" style={{ left: "0%" }}>
                    Booking Received
                  </div>
                  <div className="status-checkpoint" style={{ left: "25%" }}>
                    In Transit to Wholesaler
                  </div>
                  <div className="status-checkpoint" style={{ left: "50%" }}>
                    Package Received
                  </div>
                  <div className="status-checkpoint" style={{ left: "75%" }}>
                    In Transit to Retailer
                  </div>
                  <div className="status-checkpoint" style={{ left: "100%" }}>
                    Completed
                  </div>
                </div>
              </div>
            )
        )}
      </div>
    </div>
  );
}

export default DashWhole;
