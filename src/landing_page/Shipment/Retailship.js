import React, { useState, useEffect,useContext,createContext } from "react";
import { ethers } from 'ethers'; // ethers v6
import axios from 'axios';
import CardTransactionRegistry from "./CardTransactionRegistry.json"; // Import your ABI JSON
import Sidebar from "../Sidebar";

import './Shipment.css'; // Import the CSS file

import contractConfig from './contractAddress.json';

export default function Retailship() {
  const [walletAddress, setWalletAddress] = useState(null);// for storing connected wallet addresss
  const [contract, setContract] = useState(null);
  const [formInput, setFormInput] = useState({
    cardId: "",
    receiverAddressW: "",
    receiverAddressR: "",
    date: "",
    receiverAddressM: "",
  
    
  });
  const [errorMessage, setErrorMessage] = useState(""); // For showing errors related to transactions
  
   const [allTransactions, setAllTransactions] = useState([]); // State to store all transactions


  const contractAddress = contractConfig.address; /// your contract address

  
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
              receiverAddressM,
              
              statuses
            ] = await contract.getAllTransactions();

            // Filter and directly format the transactions for the matching wallet address
            const formattedTransactions = [];
            for (let i = 0; i < cardIds.length; i++) {
                if (receiverAddressesR[i] === walletAddress) {
                    formattedTransactions.push({
                      cardId: cardIds[i],
                      receiverAddressW: receiverAddressesW[i],
                      receiverAddressR: receiverAddressesR[i],
                      date: dates[i],
                      receiverAddressM: receiverAddressM[i],
                      
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




  

  

  // Function to fetch transactions by multiple fields for retail
  const fetchCardTransactionR = async () => {
    if (contract) {
      // const { cardId, receiverAddress, date, distance, pricePerUnit, status } = formInput;
      const { cardId, receiverAddressW,receiverAddressR, date,  } = formInput;
      try {
        const transactionData = await contract.searchCardTransactionR(
          cardId,
          date,
         
          receiverAddressW,
          walletAddress,
          
          
        );
        await transactionData.wait(); // Wait for the transaction to be mined
       
        fetchAllTransactions(); // Refresh the all transactions list after registering
        setErrorMessage(""); // Clear any previous error messages
      } catch (error) {
        const errorMsg = error.reason || error.message || "An unknown error occurred";
        console.error("Error fetching card transaction:", errorMsg);
        setErrorMessage(errorMsg);
      }
    }
  };



  const scanQrCode = async () => {
    try {
      const response = await axios.post("http://127.0.0.1:5000/scan_qr");
      const qrDataString = response.data.qr_data; // Get the string response
      const qrData = JSON.parse(qrDataString);

      const {
        cart_id: cardId,
        recivers_addressW: receiverAddressW,
        recivers_addressR: receiverAddressR,
        Date: date,
        receiverAddressM: receiverAddressM,
        
        
      } = qrData;

      setFormInput({
        cardId: cardId || "",
        receiverAddressW: receiverAddressW || "",
        receiverAddressR: receiverAddressR || "",
        date: date || "",
        receiverAddressM: receiverAddressM || "",
       
        
      });
    } catch (error) {
      console.error("Error scanning QR code:", error.message || JSON.stringify(error));
      setErrorMessage("Error scanning QR code. Please try again.");
    }
  };

  

  return (
    <>


<Sidebar/>
      <div className="dash-board">
      <div className="dashboard-cont">

      <div className="connect-button"  onClick={loadContract}>
  Connected Wallet: {walletAddress ? walletAddress : "No wallet connected"}
</div>    
         
{errorMessage && <p className="dashboard-error-message">{errorMessage}</p>}
          <div className="dashboard-content" >
          <h1 className="dashboard-heading">Fetch Cart Transaction</h1>
          <p style={{fontWeight:"700"}}>Cart ID</p>
          <input
            className="dashboard-input"
            placeholder="Card ID"
            value={formInput.cardId}
            onChange={(e) => setFormInput({ ...formInput, cardId: e.target.value })}
          />
          <p style={{fontWeight:"700"}}> Wholesaler Address</p>
          <input
          
            className="dashboard-input"
            placeholder="Receiver Addressw"
            value={formInput.receiverAddressW}
            onChange={(e) => setFormInput({ ...formInput, receiverAddressW: e.target.value

             })}
          />
           <p style={{fontWeight:"700"}}>Retailer Address</p>
          <input
           disabled={true}                                                  
            className="dashboard-input"
            placeholder="Receiver AddressR"                                                                                          
            value={walletAddress}
            onChange={(e) => setFormInput({ ...formInput, receiverAddressR: e.target.value })}
          />
          <p style={{fontWeight:"700"}}>Date</p>
          <input
            type="date"
            className="dashboard-input"
            placeholder="Date"
            value={formInput.date}
            onChange={(e) => setFormInput({ ...formInput, date: e.target.value })}
          />
          <p style={{fontWeight:"700"}}>ManuFactureAddress</p>
          <input
            className="dashboard-input"
            placeholder="ManuFcatureAddress"
            value={formInput.receiverAddressM}
            onChange={(e) => setFormInput({ ...formInput, receiverAddressM: e.target.value })}
          />
          
          
          {/* <button className="dashboard-button" onClick={fetchCardTransactionWR}>Validate QR as Wholesaler</button>
          <button className="dashboard-button" onClick={fetchCardTransactionW}>Forward Shipment</button>  */}
          <button className="dashboard-button" onClick={fetchCardTransactionR}>Validate QR as Retailer</button>
           {/* <button className="dashboard-register-button" onClick={registerCardTransaction}>Register QR</button>  */}
          {errorMessage && <p className="dashboard-error-message">{errorMessage}</p>}
          </div>
          




        
{/* New table to display all transactions */}
<div className="dashboard-content">
            <h1 className="dashboard-subheading">All Transactions</h1>
            <table className="shipment-track-table">
              <thead>
                <tr>
                <th>Cart ID</th>
          <th>Wholesaler Address</th>
          <th>Retailer Address</th>
          <th>Date</th>
          <th>ManuFactureAddress</th>
          
          <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {allTransactions.map((tx, index) => (
                  <tr key={index}>
                    <td>{tx.cardId}</td>
            <td>{tx.receiverAddressW}</td>
            <td>{tx.receiverAddressR}</td>
            <td>{tx.date}</td>
            <td>{tx.receiverAddressM}</td>
            
            <td>{tx.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
         


             
          <div className="dashboard-content dashboard-qr-data">
          <h1 className="dashboard-heading" style={{marginTop:"0px"}}>QR Data</h1>
          {formInput ? (
            <div>
              <p>Cart ID: {formInput.cardId}</p>
              <p>Wholesaler Address: {formInput.receiverAddressW}</p>
              <p>Retailer Address: {formInput.receiverAddressR}</p>
              <p>Date: {formInput.date}</p>
              <p>ManuFactureAddress: {formInput.receiverAddressM}</p>
              
            </div>
          ) : (
            <p>Loading data...</p>
          )}
        </div>
<div className="button-qr-scan">
        <button className="dashboard-scan-button" onClick={scanQrCode}>Scan QR</button>
         {/* <button className="dashboard-register-button" onClick={registerCardTransaction}>Register QR</button>   */}
        </div>
        
          

        
      </div>
      </div>
    </>
  );
}