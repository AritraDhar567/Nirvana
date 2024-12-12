import React, { useState, useEffect } from "react";
import axios from "axios";
import "./carts.css";
import SideManu from "../SideManu";
import Modal from 'react-modal';


Modal.setAppElement('#root');


const Cart = () => {
  const [products, setProducts] = useState([
    { product_id: "", quantity: 1, price_per_unit: 0 },
  ]);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [cartData, setCartData] = useState([]);
  const [selectedCart, setSelectedCart] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [cartId, setCartId] = useState("");
  const [usedCartIds, setUsedCartIds] = useState(new Set());
  const [formData, setFormData] = useState({
    cart_id: '',
    receivers_addressW: '',
    receivers_addressR: '',
    date: '',
    distance: '',
    price_per_unit: '',
    status: '',
  });

  const [qrImage, setQrImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false); // Modal state

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Send POST request to Flask server
      const response = await axios.post('http://localhost:5000/generate_qr', formData, {
        responseType: 'blob', // to receive the image as binary
      });

      // Create a URL from the binary data
      const imageUrl = URL.createObjectURL(new Blob([response.data], { type: 'image/png' }));

      // Set the QR image state to display it
      setQrImage(imageUrl);

      // Close modal after submission
      setModalIsOpen(false);
    } catch (error) {
      console.error('Error generating QR code:', error);
    } finally {
      setLoading(false);
    }
  };

  // Open the modal
  const openModal = (cartId) => {
    // Find the selected cart to get its products and their prices
    const selectedCart = cartData.find(cart => cart.cart_id === cartId);
    if (selectedCart) {
        const totalPricePerUnit = selectedCart.products.reduce((total, product) => {
            return total + (product.price_per_unit * product.quantity);
        }, 0);

        setFormData(prevState => ({
            ...prevState,
            cart_id: cartId,
            price_per_unit: String(totalPricePerUnit), // Convert to string before storing
        }));
    }
    setModalIsOpen(true); // Set modal visibility to true
};


  // Close the modal
  const closeModal = () => {
    setModalIsOpen(false);
  };

  

  const generateRandomCartId = () => {
    let newCartId;
    do {
      newCartId = Math.floor(1000 + Math.random() * 9000).toString();
    } while (usedCartIds.has(newCartId));
    setUsedCartIds((prev) => new Set(prev).add(newCartId));
    setCartId(newCartId);
  };

  useEffect(() => {
    axios
      .get("http://localhost:5000/getProductsManu")
      .then((response) => {
        setAvailableProducts(response.data);
      })
      .catch((error) => {
        console.error("Error fetching products:", error);
      });

    fetchCartData();
  }, []);

  const fetchCartData = () => {
    axios
      .get("http://localhost:5000/getCartsManu")
      .then((response) => {
        setCartData(response.data);
        console.log(response.data);
      })
      .catch((error) => {
        console.error("Error fetching cart data:", error);
      });
  };
  const handleDelete = async (id) => {
    try {
        const response = await axios.delete(`http://127.0.0.1:5000/deleteCartManu/${id}`);
        if (response.status === 200 && response.data.success) {
            // Remove the deleted product from the state
            const newCarts = cartData.filter((cart) => cart.cart_id !== id);
            setCartData(newCarts);
            console.log(`Cart with ID ${id} deleted successfully`);
        } else {
            console.error('Failed to delete Cart');
        }
    } catch (err) {
        console.error("Something went wrong while deleting the product", err);
    }
};

  const handleAddProduct = () => {
    setProducts([...products, { product_id: "", quantity: 1, price_per_unit: 0 }]);
  };

  const handleRemoveProduct = (index) => {
    setProducts(products.filter((_, i) => i !== index));
  };

  const handleProductChange = (index, field, value) => {
    const newProducts = [...products];

    // Set the price per unit based on the selected product
    if (field === "product_id") {
      const selectedProduct = availableProducts.find((p) => p.product_id === value);
      newProducts[index] = {
        ...newProducts[index],
        product_id: value,
        price_per_unit: selectedProduct ? selectedProduct.price_per_unit : 0,
      };
    } else {
      newProducts[index][field] = value;
    }

    setProducts(newProducts);
  };

  const handleAddCart = () => {
    axios
      .post("http://localhost:5000/add_to_cart", {
        cart_id: cartId,
        products: products,
      })
      .then(() => {
        alert("Cart added successfully!");
        fetchCartData();
      })
      .catch((error) => {
        console.error("Error adding cart:", error);
      });
  };

  const handleViewCart = (id) => {
    axios
      .get(`http://localhost:5000/get_cart/${id}`)
      .then((response) => {
        setSelectedCart(response.data);
        console.log(response.data)
        setModalVisible(true);
      })
      .catch((error) => {
        console.error("Error viewing cart:", error);
      });
  };

  const closeModl = () => {
    setModalVisible(false);
    setSelectedCart(null);
  };

  const calculateTotals = (cart) => {
    const totalQuantity = cart.products.reduce((sum, p) => sum + p.quantity, 0);
    const totalPrice = cart.products.reduce((sum, p) => sum + p.quantity * p.price_per_unit, 0);
    return { totalQuantity, totalPrice };
  };

  const buttonStyle = {
    backgroundColor: "#007BFF",
    color: "#FFFFFF",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "16px",
    transition: "background-color 0.3s",
    marginLeft: "6px",
  };

  const buttonHoverStyle = {
    backgroundColor: "#0056b3",
  };
  const downloadQrCode = () => {
    const link = document.createElement('a');
    link.href = qrImage;
    link.download = 'QRCode.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  return (
    <>
      <SideManu />
      <div className="dash-board">
        <div className="cart-management-container">
          <h1 className="cart-management-title">Cart Management</h1>

          <div className="cart-management-form">
            <label className="cart-id-label">Cart ID:</label>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <input
                className="cart-id-input"
                type="text"
                value={cartId}
                onChange={(e) => setCartId(e.target.value)}
                placeholder="Enter cart ID"
              />
              <button
                style={buttonStyle}
                onClick={generateRandomCartId}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = buttonHoverStyle.backgroundColor}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = buttonStyle.backgroundColor}
              >
                ID
              </button>
            </div>

            <h3 className="cart-products-title">Add Products</h3>
            {products.map((product, index) => {
  // Ensure that availableProducts is loaded
  if (!availableProducts.length) {
    console.log('Available Products not loaded yet');
    return null; // Prevent rendering until products are loaded
  }

  // Check if product_id is correctly matched (ensure data types are the same)
  const selectedProduct = availableProducts.find(p => String(p.product_id) === String(product.product_id));

  // Log to check if selectedProduct is found correctly
  console.log('Selected Product:', selectedProduct);

  // Calculate price per unit and total price
  const pricePerUnit = selectedProduct ? selectedProduct.price_per_unit : 0;
  const totalPrice = pricePerUnit * product.quantity;

  // Log the total price for debugging
  console.log('Product ID:', product.product_id, 'Quantity:', product.quantity, 'Total Price:', totalPrice);

  return (
    <div key={index} className="cart-product-row">
      <select
        className="cart-product-select"
        value={product.product_id}
        onChange={(e) => handleProductChange(index, "product_id", e.target.value)}
      >
        <option value="">Select Product</option>
        {availableProducts.map((p) => (
          <option key={p.product_id} value={p.product_id}>
            {p.name} - ₹{p.price_per_unit}
          </option>
        ))}
      </select>

      <input
        className="cart-product-quantity"
        type="number"
        value={product.quantity}
        onChange={(e) => handleProductChange(index, "quantity", e.target.value)}
        min="1"
      />

      <button
        className="cart-remove-product-btn"
        onClick={() => handleRemoveProduct(index)}
      >
        <i className="fa-solid fa-trash"></i>
      </button>

      {/* Display Total Price for Each Product */}
      <p className="cart-product-total-price">
        Total Price: ₹{totalPrice.toFixed(2)}
      </p>
    </div>
  );
})}




            <button className="cart-add-product-btn" onClick={handleAddProduct}>
              Add Another Product
            </button>
            <button className="cart-submit-btn" onClick={handleAddCart}>
              Add Cart
            </button>
          </div>
          <div >

          {cartData.map((cart) => (
    <div key={cart.cart_id} style={{ marginTop: "10px" }} className="cart-item">
        <span style={{ fontFamily: "Poppins", fontWeight: "600" }}>Cart ID: {cart.cart_id}</span>
        <button className="generate_qr" onClick={() => openModal(cart.cart_id)}>Generate QR</button>
        {/* Display additional cart details if needed */}
    </div>
))}



 <div className="">
 <div className="">
  <Modal isOpen={modalIsOpen} onRequestClose={closeModal} className="genqr">
                    <h1 style={{fontFamily:"Poppins"}}>Generate QR Code</h1>
                 
                  
                   <form onSubmit={handleSubmit} className="grid-form"  >
                      <label  style={{fontFamily:"Poppins"}}>Cart ID:</label>
                        <input
                            type="text"
                            name="cart_id"
                            value={`${formData.cart_id}`}
                            readOnly // Read-only since it's set by the openModal function
                        />
                        <label  style={{fontFamily:"Poppins"}}>Receiver Address Wholesaler</label>
                        <input
                            type="text"
                            name="receivers_addressW"
                            value={formData.receivers_addressW}
                            onChange={handleChange}
                            placeholder="Receiver's Address (Warehouse)"
                            required
                        />
                        <label  style={{fontFamily:"Poppins"}}>Receiver Address Retailer</label>
                        <input
                            type="text"
                            name="receivers_addressR"
                            value={formData.receivers_addressR}
                            onChange={handleChange}
                            placeholder="Receiver's Address (Recipient)"
                            required
                        />
                        <label  style={{fontFamily:"Poppins"}}>Date</label>
                        <input
                            type="date"
                            name="date"
                            value={formData.date}
                            onChange={handleChange}
                            required
                        />
                        <label  style={{fontFamily:"Poppins"}}>Distance</label>
                        <input
                            type="text"
                            name="distance"
                            value={formData.distance}
                            onChange={handleChange}
                            placeholder="Distance"
                            required
                        />
                        <label  style={{fontFamily:"Poppins"}}>Price</label>
                        <input
                            type="text"
                            name="price_per_unit"
                            value={formData.price_per_unit}
                            onChange={handleChange}
                            placeholder="Price per Unit"
                            required
                        />
                       
                        <button type="submit">Generate QR Code</button>
                    </form>
                    <button onClick={closeModal}>Close</button>
                </Modal>
                </div>
 

                {qrImage && (
  <div style={{ marginTop: '20px', textAlign: 'center' }}>
    <h1 style={{ fontSize: '24px', marginBottom: '10px' }}>Your QR Code:</h1>
    <img 
      src={qrImage} 
      alt="Generated QR Code" 
      style={{ 
        width: '200px',  // Adjusted smaller width for the QR code
        height: '200px', 
        border: '2px solid #4CAF50',  // Green border
        borderRadius: '8px',  // Rounded corners
        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',  // Shadow for depth
        marginBottom: '10px' 
      }} 
    />
    <button 
      onClick={downloadQrCode} 
      style={{ 
        padding: '10px', 
        fontSize: '12px', 
        backgroundColor: '#4CAF50',  // Green background
        marginLeft:"20px",
        color: 'white',  // White text
        border: 'none', 
        borderRadius: '5px', 
        cursor: 'pointer', 
        transition: 'background-color 0.3s, transform 0.3s' 
      }}
      onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#45a049'} // Darker green on hover
      onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#4CAF50'} // Original green on mouse out
    >
      Download QR
    </button>
  </div>
)}

</div>
</div>

          <h2 className="cart-list-title">Cart List</h2>
          <table className="cart-list-table">
            <thead>
              <tr>
                <th>Cart ID</th>
                <th>Total Quantity</th>
                <th>Total Price</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {cartData.map((cart) => {
                const totals = calculateTotals(cart);
                return (
                  <tr key={cart.cart_id}>
                    <td>{cart.cart_id}</td>
                    <td>{totals.totalQuantity}</td>
                    <td>₹{totals.totalPrice.toFixed(2)}</td>
                    <td>
                      <button
                        className="cart-view-btn"
                        onClick={() => handleViewCart(cart.cart_id)}
                      >
                       <i class="fa-solid fa-eye"></i>
                      </button>
                      <button
  className="action-button delete-button"
  onClick={() => handleDelete(cart.cart_id)}  // Use the correct product ID
>
  <i className="fa-solid fa-trash"></i>
 
</button>







                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {modalVisible && selectedCart && (
            <div className="modal">
              <div className="modal-content">
                <span className="close" onClick={closeModl}>
                  &times;
                </span>
                <h3 className="cart-details-title">Cart Details</h3>

                {/* Log the selectedCart data for debugging */}
                {console.log('Selected Cart:', selectedCart)}

                <div className="card-slider">
                  {selectedCart.products && selectedCart.products.length > 0 ? (
                    selectedCart.products.map((p, index) => (
                      <div key={index} className="card">
                        <h4> {p[1] || 'N/A'}</h4>
                        <p>Quantity: {p[3] || 0}</p>
                        <p>Price per Unit: ₹{p[2] || 0}</p>
                        <p>Total Price: ₹{(p[2] * p[3]).toFixed(2) || 0}</p>
                      </div>
                    ))
                  ) : (
                    <p>No products in this cart.</p>
                  )}
                </div>

                {selectedCart.products && selectedCart.products.length > 0 && (
                  <>
                    <h4>
                      Total Quantity: {selectedCart.products.reduce((sum, p) => sum + p[3], 0)}
                    </h4>
                    <h4>
                      Total Price: ₹
                      {selectedCart.products
                        .reduce((sum, p) => sum + p[2] * p[3], 0)
                        .toFixed(2)}
                    </h4>
                  </>
                )}
              </div>
            </div>
          )}



        </div>
      </div>
    </>
  );
};

export default Cart;
