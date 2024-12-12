import React, { useState ,useEffect } from 'react';
import './styles.css';
import { Link, useLocation } from 'react-router-dom';
import { FaBoxesPacking } from "react-icons/fa6"; 
import { ethers } from "ethers"; // ethers v6
import CardTransactionRegistry from "./Shipment/CardTransactionRegistry.json"; // Import your ABI JSON
import contractConfig from './Shipment/contractAddress.json';



const Sidebar = () => {
    const [isNavbarVisible, setIsNavbarVisible] = useState(false);
    const [openDropdown, setOpenDropdown] = useState(null);
    const location = useLocation(); // To track current URL path
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

    // Check if the link is active based on the current route
    const isActive = (path) => {
       
        return location.pathname === path;
    };

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
                            <Link className="nav_logo" to="/home">
                                <i className='bx bx-layer nav_logo-icon dash' style={{ fontSize: "28px" }}></i>
                                <span className="nav_logo-name"><span style={{ color: "orange" }}>Nirvana</span><br /><span style={{ color: "#87f167" }}>HealthChain</span></span>
                            </Link>

                            <div className="nav_list">
                                <Link
                                    className={`nav_link ${isActive('/home') ? 'active' : ''}`}
                                    to="/home"
                                >
                                    <i className='bx bx-grid-alt nav_icon' style={{ fontSize: "25px" }}></i>
                                    <span className="nav_name">Dashboard</span>
                                </Link>

                                <Link
                                    className={`nav_link ${isActive('/retailship') ? 'active' : ''}`}
                                    to="/retailship"
                                >
                                    <i className='nav_icon' style={{ fontSize: "25px" }}><FaBoxesPacking className='w-1' style={{ width: "30px" }} /></i>
                                    <span className="nav_name">Shipment</span>
                                </Link>

                                <li className={`dropdown ${openDropdown === 'products' ? 'open' : ''}`}>
                                    <Link
                                        className={`dropdown-togg nav_link ${isActive('/products') ? 'active' : ''}`}
                                        onClick={() => toggleDropdown('products')}
                                        to="#"
                                    >
                                        <i className="fa-duotone fa-solid fa-boxes-stacked nav_icon"></i>
                                        <span className="nav_name">Products</span>
                                        <p className="arrow">&#9662;</p>
                                    </Link>
                                    <ul className="dropdown-menu">
                                        <li>
                                            <Link className="dropmenu" to="/addproducts">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-dot" viewBox="0 0 16 16">
                                                    <path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3" />
                                                </svg>
                                                Add Products
                                            </Link>
                                        </li>
                                        <li>
                                            <Link className="dropmenu" to="/products">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-dot" viewBox="0 0 16 16">
                                                    <path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3" />
                                                </svg>
                                                Manage Products
                                            </Link>
                                        </li>
                                    </ul>
                                </li>

                                <li className={`dropdown ${openDropdown === 'orders' ? 'open' : ''}`}>
                                    <Link
                                        className={`dropdown-togg nav_link ${isActive('/orders') ? 'active' : ''}`}
                                        onClick={() => toggleDropdown('orders')}
                                        to="#"
                                    >
                                        <i className="fa-duotone fa-solid fa-cart-shopping nav_icon"></i>
                                        <span className="nav_name">Orders</span>
                                        <p className="arrow">&#9662;</p>
                                    </Link>
                                    <ul className="dropdown-menu">
                                        <li>
                                            <Link className="dropmenu" to="/addorders">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-dot" viewBox="0 0 16 16">
                                                    <path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3" />
                                                </svg>
                                                Add Orders
                                            </Link>
                                        </li>
                                        <li>
                                            <Link className="dropmenu" to="/orders">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-dot" viewBox="0 0 16 16">
                                                    <path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3" />
                                                </svg>
                                                Manage Orders
                                            </Link>
                                        </li>
                                    </ul>
                                </li>

                                <Link
                                    className={`nav_link ${isActive('/warehouse') ? 'active' : ''}`}
                                    to="/warehouse"
                                >
                                    <i className="fa-duotone fa-solid fa-warehouse nav_icon"></i>
                                    <span className="nav_name">Warehouse</span>
                                </Link>
                            </div>
                        </div>

                        <Link
                            to='/login_auth'
                            onClick={lockMetaMask}
                            className={`nav_link ${isActive('/login_auth') ? 'active' : ''}`}
                        >
                            <i className='bx bx-log-out nav_icon' style={{ fontSize: "25px" }}></i>
                            <span className="nav_name" >SignOut</span>
                        </Link>
                    </nav>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
