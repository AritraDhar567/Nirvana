// Sidebar.jsx
import React, { useState, useEffect } from 'react';
import './styles.css'; 
import { Link, useLocation } from 'react-router-dom';
import { FaBoxesPacking } from "react-icons/fa6";
import { ethers } from "ethers"; // ethers v6
import CardTransactionRegistry from "./Shipment/CardTransactionRegistry.json"; // Import your ABI JSON
import contractConfig from './Shipment/contractAddress.json';

const SideManu = () => {
    const [isNavbarVisible, setIsNavbarVisible] = useState(false);
    const [openDropdown, setOpenDropdown] = useState(null);
    const [activeLink, setActiveLink] = useState('dashboard');
    const location = useLocation(); // Get the current path from the router
    const [contract, setContract] = useState(null);
    const contractAddress = contractConfig.address;
    const [walletAddress, setWalletAddress] = useState(null);// for storing connected wallet addresss
    const [errorMessage, setErrorMessage] = useState("");  

    useEffect(() => {
        const init = async () => {
          await loadContract();
        };
        init();
      }, []);
     
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
   
  
      
  const lockMetaMask = async () => {
    try {
      // Revoke permissions for eth_accounts
      await window.ethereum.request({
        method: 'wallet_requestPermissions',
        params: [{ eth_accounts: {} }]
      });
      setWalletAddress(null);
      setContract(null);
      setErrorMessage("Wallet permissions revoked. Reconnect to continue.");
    } catch (error) {
      console.error("Failed to revoke MetaMask permissions:", error);
      setErrorMessage("Failed to revoke MetaMask permissions.");
    }
  };
  

    // Toggle sidebar visibility
    const toggleNavbar = () => {
        setIsNavbarVisible(!isNavbarVisible);
    };

    // Handle dropdown toggle
    const toggleDropdown = (dropdown) => {
        setOpenDropdown(openDropdown === dropdown ? null : dropdown);
    };

    // Set active link
    const handleLinkClick = (link) => {
        if (link==='signout'){
            lockMetaMask();    
  }
        setActiveLink(link);
    };

    // Set active link based on the current URL path
    useEffect(() => {
        const currentPath = location.pathname;

        if (currentPath.includes('/dashmanu')) {
            setActiveLink('dashboard');
        } else if (currentPath.includes('/shipment')) {
            setActiveLink('shipment');
        } else if (currentPath.includes('/productsmanu')) {
            setActiveLink('products');
        } else if (currentPath.includes('/carts')) {
            setActiveLink('cart');
        } else if (currentPath.includes('/warehousemanu')) {
            setActiveLink('warehouse');
        } else if (currentPath.includes('/home')) {
            setActiveLink('home');
        }
    }, [location]);

    return (
        <div className="side-bar">
            <div id="body-pd">
                <header className={`header ${isNavbarVisible ? 'body-pd' : ''}`} id="header">
                    <div className="header_toggle" onClick={toggleNavbar}>
                        <i className={`bx bx-menu ${isNavbarVisible ? 'bx-x' : ''}`} id="header-toggle"></i>
                    </div>
                    <div>
                        <h1 className='nirvana' style={{ marginTop: "12px" }}>NIRVANA <span style={{ color: "blue" }}>-</span> <span className='healthchain'>HealthChain</span></h1>
                    </div>
                    <div className="header_img">
                        <img src="https://i.imgur.com/hczKIze.jpg" alt="Profile" />
                    </div>
                </header>
                <div className={`l-navbar ${isNavbarVisible ? 'show' : ''}`} id="nav-bar">
                    <nav className="nav">
                        <div>
                            <Link
                                className={`nav_logo ${activeLink === 'home' ? 'active' : ''}`}
                                onClick={() => handleLinkClick('home')}
                                to="/home"
                            >
                                <i className='bx bx-layer nav_logo-icon dash' style={{ fontSize: "28px" }}></i>
                                <span className="nav_logo-name"><span style={{ color: "orange" }}>Nirvana</span><br /><span style={{ color: "#87f167" }}>HealthChain</span></span>
                            </Link>
                            <div className="nav_list">
                                <Link
                                    className={`nav_link ${activeLink === 'dashboard' ? 'active' : ''}`}
                                    onClick={() => handleLinkClick('dashboard')}
                                    to="/dashmanu"
                                >
                                    <i className='bx bx-grid-alt nav_icon' style={{ fontSize: "25px" }}></i>
                                    <span className="nav_name">Dashboard</span>
                                </Link>

                                <Link
                                    className={`nav_link ${activeLink === 'shipment' ? 'active' : ''}`}
                                    onClick={() => handleLinkClick('shipment')}
                                    to="/shipment"
                                >
                                    <i className="nav_icon"><FaBoxesPacking className='w-1' style={{ width: "30px" }} /></i>
                                    <span className="nav_name">Shipment</span>
                                </Link>

                                <Link
                                    className={`nav_link ${activeLink === 'products' ? 'active' : ''}`}
                                    onClick={() => handleLinkClick('products')}
                                    to="/productsmanu"
                                >
                                    <i className='fa-duotone fa-solid fa-boxes-stacked nav_icon' style={{ fontSize: "25px" }}></i>
                                    <span className="nav_name">Products</span>
                                </Link>

                                <Link
                                    className={`nav_link ${activeLink === 'cart' ? 'active' : ''}`}
                                    onClick={() => handleLinkClick('cart')}
                                    to="/carts"
                                >
                                    <i className='fa-duotone fa-solid fa-cart-shopping nav_icon' style={{ fontSize: "25px" }}></i>
                                    <span className="nav_name">Cart</span>
                                </Link>

                                <Link
                                    className={`nav_link ${activeLink === 'warehouse' ? 'active' : ''}`}
                                    onClick={() => handleLinkClick('warehouse')}
                                    to="/warehousemanu"
                                >
                                    <i className="fa-duotone fa-solid fa-warehouse nav_icon"></i>
                                    <span className="nav_name">Warehouse</span>
                                </Link>
                            </div>
                        </div>
                        <Link
                            className={`nav_link ${activeLink === 'signout' ? 'active' : ''}`}
                            onClick={() => handleLinkClick('signout')}
                            to="/login_auth"
                        >
                            <i className='bx bx-log-out nav_icon' style={{ fontSize: "25px" }}></i>
                            <span className="nav_name">SignOut</span>
                        </Link>
                    </nav>
                </div>
            </div>
        </div>
    );
};

export default SideManu;
