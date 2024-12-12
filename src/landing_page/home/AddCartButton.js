import React, { useState } from 'react';
import './AddCartProducts.css';  // Import the CSS file

function AddCartProducts() {
  const [cartId, setCartId] = useState('');
  const [responseMessage, setResponseMessage] = useState('');

  const userId = 1;

  const addCartProducts = async () => {
    if (!cartId) {
      setResponseMessage('Please enter a cart ID');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/addCartToProducts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cart_id: cartId,
          user_id: userId,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setResponseMessage(`Inserted product IDs: ${data.inserted_product_ids.join(', ')}`);
      } else {
        setResponseMessage('Failed to add products to cart');
      }
    } catch (error) {
      setResponseMessage('Error: ' + error.message);
    }
  };

  return (
    <div className="add-cart-products">
      <h2 className="add-cart-title">Add Products from Cart to Products</h2>
      <div className="input-container">
        <label className="input-label">Cart ID: </label>
        <input
          type="text"
          value={cartId}
          onChange={(e) => setCartId(e.target.value)}
          className="cart-input"
        />
      </div>
      <button onClick={addCartProducts} className="add-cart-button">
        Add Cart Products
      </button>
      {responseMessage && <p className="response-message">{responseMessage}</p>}
    </div>
  );
}

export default AddCartProducts;
