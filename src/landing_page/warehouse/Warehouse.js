import React, { useState, useEffect } from 'react';
import './warehouse.css'; // Import the CSS file for styling
import { Link, useLocation } from 'react-router-dom';  // Import useLocation to get query params
import Sidebar from '../Sidebar';
import { FaShoppingCart } from 'react-icons/fa';  // Import a cart icon from react-icons
import { AiOutlineClose } from 'react-icons/ai';  // Import a close icon

const Warehouse = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [products, setProducts] = useState([]);  // State to store products
  const [cart, setCart] = useState([]);  // New state for the cart
  const [isCartVisible, setIsCartVisible] = useState(false); // State to toggle cart visibility
  const location = useLocation();  // Get current location for query parameters

  // Extract search term from URL query
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const term = params.get('search');
    if (term) {
      setSearchTerm(term);
    }
  }, [location.search]);

  // Fetch products from the backend when the component mounts
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('http://localhost:5000/getProducts'); // API call to the backend
        const data = await response.json();
        setProducts(data);  // Store the fetched products in state
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };
    fetchProducts();
  }, []);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleViewClick = (product) => {
    setSelectedProduct(product);
  };

  const closeProductDetails = () => { 
    setSelectedProduct(null);
  };

  const handleAddToCart = (product) => {
    const productExists = cart.find((item) => item.product_id === product.product_id);

    if (productExists) {
      setCart(
        cart.map((item) =>
          item.product_id === product.product_id
            ? { ...productExists, quantity: productExists.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const handleRemoveFromCart = (product_id) => {
    setCart(cart.filter((item) => item.product_id !== product_id));
  };

  const handleToggleCart = () => {
    setIsCartVisible(!isCartVisible);  // Toggle the cart sidebar visibility
  };

  const handleIncreaseQuantity = (product_id) => {
    setCart(
      cart.map((item) =>
        item.product_id === product_id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  const handleDecreaseQuantity = (product_id) => {
    setCart(
      cart.map((item) =>
        item.product_id === product_id && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
    );
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const cartTotal = cart.reduce((total, item) => total + item.price_per_unit * item.quantity, 0);

  return (
    <>
      <Sidebar />
      <div className="dash-board">
        <h2 className='warehouse-head'>Warehouse</h2>
        <div className="warehouse">

          {/* Cart Icon and Search Bar */}
         <div className='ecom'>
            <input
              type="text"
              className="search-bar-ecom"
              placeholder="Search products..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <div className='pres'>
              <Link to="/OCR" className='mx-3 px-3 py-2' style={{ backgroundColor: "green", color: "white", textDecoration: "none", fontWeight: "600", borderRadius: "20px" }}>
                Add your Prescription
              </Link>
            </div>
            
            {/* Cart Icon */}
            <div className="cart-icon-container">
              <FaShoppingCart className="cart-icon" onClick={handleToggleCart} />
              {cart.length > 0 && <span className="cart-count">{cart.length}</span>} {/* Show number of items in cart */}
            </div>
            </div>
        

          <div className="shelf-container">
            {['1', '2', '3', '4', '5'].map((shelf) => (
              <div key={shelf} className="shelf">
                <h2 className='shelf-name'>Shelf {shelf}</h2>
                <div className="product-list-warehouse">
                  {filteredProducts
                    .filter((product) => product.shelf_num === shelf)
                    .map((product) => (
                      <div key={product.product_id} className="product-card">
                        <img src={product.picture_of_the_prod} alt={product.name} className="product-image" />
                        <h5 className='mt-6' style={{ fontWeight: "600", color: "blue" }}>{product.name}</h5>
                        <p className='text'>Price: ₹{product.price_per_unit}</p>
                        <p className='text'>
                          Status:
                          <span className={product.quantity_of_uom === 0 ? 'out-of-stock' : 'available'}>
                            {product.quantity_of_uom === 0 ? 'Out of Stock' : 'Available'}
                          </span>
                        </p>
                        <button className='view-button' onClick={() => handleViewClick(product)}>View</button>
                        <button
                          className='add-to-cart-button'
                          onClick={() => handleAddToCart(product)}
                          disabled={product.quantity_of_uom === 0}
                        >
                          {product.quantity_of_uom === 0 ? 'Out of Stock' : 'Add to Cart'}
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>

          {/* Cart Sidebar */}
          {/* Cart Sidebar */}
<div className={`cart ${isCartVisible ? 'visible' : ''}`}>
  <div className="cart-header">
    <h2>Your Cart</h2>
    <AiOutlineClose className="close-cart-icon" onClick={handleToggleCart} /> {/* Close icon */}
  </div>
  {cart.length === 0 ? (
    <p>Your cart is empty.</p>
  ) : (
    <div className="cart-items-container">
      {cart.map((item) => (
        <div key={item.product_id} className="cart-item">
          <img src={item.picture_of_the_prod} alt={item.name} className="cart-item-image" />
          <div className="cart-item-details">
            <h5 className="cart-item-name fs-6">{item.name}</h5>
            <div className="quantity-control">
              <button onClick={() => handleDecreaseQuantity(item.product_id)}>-</button>
              <span>{item.quantity}</span>
              <button onClick={() => handleIncreaseQuantity(item.product_id)}>+</button>
            </div>
            <p className="cart-item-price">Rate - ₹{item.price_per_unit * item.quantity}</p>
          </div>
          <button className='remove-button' onClick={() => handleRemoveFromCart(item.product_id)}>
          <AiOutlineClose className="close-cart-icon"/>
          </button>
        </div>
      ))}
      <div className="cart-total">
        <h4>Total: ₹{cartTotal}</h4>
      </div>
    </div>
  )}
</div>


          {selectedProduct && (
            <>
              <div className="overlay show" onClick={closeProductDetails}></div>
              <div className="popup-show">
                <h2>{selectedProduct.name}</h2>
                <p>Price: ₹{selectedProduct.price_per_unit}</p>
                <p>Shelf: {selectedProduct.shelf_num}</p>
                <p>Status: {selectedProduct.quantity_of_uom === 0 ? 'Out of Stock' : 'Available'}</p>
                <img src={selectedProduct.picture_of_the_prod} alt={selectedProduct.name} className="product-image" style={{width:"150px"}} />
                <br/>
                <button onClick={closeProductDetails}>Close</button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Warehouse;
