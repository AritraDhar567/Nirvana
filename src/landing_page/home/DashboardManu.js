// import React, { useState, useEffect } from "react";
// import SideManu from "../SideManu";
// import "./ShipmentTracker.css"; // For styling
// import { shipmentData as initialShipmentData } from "./shipmentData";
// import PredictMedications from "./Medication";



import React, { useState, useEffect } from "react";
import SideManu from "../SideManu";
import "./ShipmentTracker.css"; // For styling
import { ethers } from "ethers"; // ethers v6
import CardTransactionRegistry from "./CardTransactionRegistry.json"; // Import your ABI JSON
import contractConfig from '../Shipment/contractAddress.json';
 import PredictMedications from "./Medication";
import Dash from "./Dash";
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register the components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);


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

function DashManu({ }) {
  const [contract, setContract] = useState(null);
  const [allTransactions, setAllTransactions] = useState([]); // Updated: use for shipment data
  const [showTracker, setShowTracker] = useState([]);
  const [animating, setAnimating] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [showMetricsGraph, setShowMetricsGraph] = useState(false);
  const [loading, setLoading] = useState(true);
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
            if (receiverAddressesM[i] === walletAddress) {
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

            // Set the state
            setAllTransactions(formattedTransactions);
            setErrorMessage(""); // Clear any error messages
        } catch (error) {
            console.error("Error fetching all transactions:", error.message || JSON.stringify(error));
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
  const statusCounts = allTransactions.reduce((acc, shipment) => {
    acc[shipment.status] = (acc[shipment.status] || 0) + 1;
    return acc;
  }, {});

  const [productsData, setProductsData] = useState([]);
  const [cartData, setCartData] = useState([]);


  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch products
        const productsResponse = await fetch('http://127.0.0.1:5000/getProductsManu');
        const products = await productsResponse.json();
        setProductsData(products);

        // Fetch cart data
        const cartsResponse = await fetch('http://127.0.0.1:5000/getCartsManu');
        const carts = await cartsResponse.json();
        setCartData(carts);
        setLoading(false);

   
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
       
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return<div><div className='load'> <div className='loader'>Loading...</div></div><p className='lding'>Loading Your Dashboard....</p></div>;
  }
 

  // Calculate metrics
  const totalProducts = productsData.length;
  const totalCarts = cartData.length;
  const totalInventoryValue = productsData.reduce((acc, product) => {
    return acc + (product.price_per_unit * product.quantity_of_uom);
  }, 0);
  const getBarChartData = () => {
    return {
      labels: [
        'Total Products',
        'Total Carts',
        'Pending Shipments',
        'In Transit to Wholesaler',
        'Wholesaler Received',
        'In Transit to Retailer',
        'Delivered Shipments',
      ],
      datasets: [
        {
          label: 'Metrics',
          data: [
            totalProducts,
            totalCarts,
            statusCounts["PENDING"] || 0,
            statusCounts["IN_TRANSIT_WHOLESALER"] || 0,
            statusCounts["WHOLESALER_RECEIVED"] || 0,
            statusCounts["IN_TRANSIT_RETAILER"] || 0,
            statusCounts["DELIVERED"] || 0,
          ],
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
        },
      ],
    };
  };
  const options = {
    scales: {
        x: {
            grid: {
                display: false, // Disable grid lines for the x-axis
            },
        },
        y: {
            grid: {
                display: false, // Disable grid lines for the y-axis
            },
        },
    },
};
  

  return (
    <div className="dash-board">
      <SideManu />
    
      <h1>Manufacturer Dashboard</h1>
         <div className="dashboard-metric">
         <div className="metric-card">
            <h2>{totalProducts}</h2>
            <p>Number of Products</p>
          </div>
          <div className="metric-card">
            <h2>{totalCarts}</h2>
            <p>Number of Carts</p>
          </div>
          <div className="metric-card">
            <h2>&#x20b9;{totalInventoryValue.toFixed(2)}</h2>
            <p>Total Value of Inventory</p>
          </div>
        <div className="metric-card">
          <h2>{statusCounts["PENDING"] || 0}</h2>
          <p>Pending Shipments</p>
        </div>
        <div className="metric-card">
          <h2>{statusCounts["IN_TRANSIT_WHOLESALER"] || 0}</h2>
          <p>In Transit to Wholesaler</p>
        </div>
        <div className="metric-card">
          <h2>{statusCounts["WHOLESALER_RECEIVED"] || 0}</h2>
          <p>Wholesaler Received</p>
        </div>
        <div className="metric-card">
          <h2>{statusCounts["IN_TRANSIT_RETAILER"] || 0}</h2>
          <p>In Transit to Retailer</p>
        </div>
        <div className="metric-card">
          <h2>{statusCounts["DELIVERED"] || 0}</h2>
          <p>Delivered Shipments</p>
        </div>
        <button onClick={() => setShowMetricsGraph(prev => !prev)} className="toggle-graph-button">
        {showMetricsGraph ? "Hide Metrics Graph" : "Show Metrics Graph"}
      </button>

      </div>
      <div style={{marginLeft:"300px"}}>
      {showMetricsGraph && (  <div className="bar-chart-container">
  <h2>Metrics Bar Graph</h2>
  <Bar 
  data={{
    ...getBarChartData(),
    datasets: [
      {
        ...getBarChartData().datasets[0],
        borderRadius: 5, // Set the border radius for each bar
      },
    ],
  }} 
  options={{
    responsive: true,
    scales: {
      x: {
        grid: {
          display: false, // Disable grid lines for the x-axis
        },
        categoryPercentage: 0.8, // Adjust this to control the bar width
        barPercentage: 0.8, // Adjust this to control the gap between bars
      },
      y: {
        beginAtZero: true,
        grid: {
          display: false, // Disable grid lines for the y-axis
        },
      },
    },
  }} 
/>


</div>
     )}
     </div>

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
                    Booking
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



      <PredictMedications/>
    </div>
  );
}

export default DashManu;
