import React, { useEffect, useState } from 'react';
import { useNavigate, Route, Routes } from 'react-router-dom';

import axios from 'axios';
import SideManu from '../SideManu';

function WarehouseManu() {
  const [userData, setUSerData] = useState([]);
  const [products, setProducts] = useState([]); // Initialize as an empty array
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isShowing, setIsShowing] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const result = await axios("http://127.0.0.1:5000/getProductsManu");
      const drug = result.data;
      console.log(drug);
      setUSerData(drug);
      setProducts(drug); // Set the products state with the fetched data
    } catch (err) {
      console.log("Something went wrong", err);
    }
  };

  const handleDelete = async (id) => {
    try {
        const response = await axios.delete(`http://127.0.0.1:5000/deleteProductManu/${id}`);
        if (response.status === 200 && response.data.success) {
            // Remove the deleted product from the state
            const newProducts = products.filter((product) => product.product_id !== id);
            setProducts(newProducts);
            console.log(`Product with ID ${id} deleted successfully`);
        } else {
            console.error('Failed to delete product');
        }
    } catch (err) {
        console.error("Something went wrong while deleting the product", err);
    }
};

  

  const addProduct = (newProduct) => {
    setProducts([...products, newProduct]);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setIsEditing(true);
  };

  const handleShow = (product) => {
    setSelectedProduct(product);
    setIsShowing(true);
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();
      const updatedProduct = {
        product_id: selectedProduct.product_id,
        name: selectedProduct.name,
        category: selectedProduct.category,
        exp_date: selectedProduct.exp_date,
        price_per_unit: selectedProduct.price_per_unit,
        quantity_of_uom: selectedProduct.quantity_of_uom,
        shelf_num: selectedProduct.shelf_num,
        description: selectedProduct.description,
      };
  
      // Append the JSON stringified product data to the FormData object
      formData.append('data', JSON.stringify(updatedProduct));
  
      // Make an API call to update the product on the backend
      const response = await axios.post('http://127.0.0.1:5000/editProductManu', formData);
  
      if (response.data.success) {
        // Update the product in the state
        const updatedProducts = products.map((product) =>
          product.product_id === selectedProduct.product_id ? updatedProduct : product
        );
        setProducts(updatedProducts);
        setIsEditing(false);
      } else {
        console.error('Failed to update product');
      }
    } catch (error) {
      console.error('Error occurred while updating product:', error);
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSelectedProduct((prevProduct) => ({
      ...prevProduct,
      [name]: name === 'price_per_unit' || name === 'quantity_of_uom' 
        ? parseFloat(value) 
        : name === 'exp_date' 
          ? value // Date input will be in YYYY-MM-DD format
          : value
    }));
  };
  
  
  
  
  const handleCloseModal = () => {
    setIsEditing(false);
    setIsShowing(false);
    setSelectedProduct(null);
  };

  const handleAddProduct = () => {
    navigate('/productsmanu');
  };

  const handlePrint = () => {
    const printContents = document.getElementById('product-table').outerHTML;
    const originalContents = document.body.innerHTML;

    document.body.innerHTML = printContents;
    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload();
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
    <SideManu/>
    <div className='dash-board'>
     
      <div className="product-management-container">
        <h1>Product Inventory</h1>
        <div className="top-bar">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={handleSearch}
            className="search-bar-product"
          />
          <button className="add-product-button" onClick={handleAddProduct}>
            Add Product
          </button>
          <button className="print-button" onClick={handlePrint}>
            Print Table
          </button>
        </div>
        <table id="product-table" className="product-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Category</th>
              <th>Expiry Date</th>
              <th>Price</th>
              <th>Availability</th>
              <th>Quantity</th>
              <th>Shelf No.</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => (
              <tr key={product.product_id}>
                <td>{product.product_id}</td>
                <td>{product.name}</td>
                <td>{product.category}</td>
                <td>{product.exp_date}</td>
                <td>&#x20b9;{product.price_per_unit}</td>
                <td>
                  {product.quantity_of_uom === 0 ? (
                    <span className="status out-of-stock">Out of Stock</span>
                  ) : (
                    <span className="status available">Available</span>
                  )}
                </td>
                <td>{product.quantity_of_uom}</td>
                <td>{product.shelf_num}</td>
                <td>
                  <button
                    className="action-button edit-button"
                    onClick={() => handleEdit(product)}
                  >
                    <i className="fa-solid fa-pen"></i>
                  </button>
                  <button
  className="action-button delete-button"
  onClick={() => handleDelete(product.product_id)}  // Use the correct product ID
>
  <i className="fa-solid fa-trash"></i>
</button>

                  <button
                    className="action-button show-button"
                    onClick={() => handleShow(product)}
                  >
                    <i className="fa-solid fa-eye"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {isEditing && (
          <div className="modal">
            <div className="modal-content">
              <h2>Edit Product</h2>
              <div className="edit-form">
                <label>Name:</label>
                <input
                  type="text"
                  name="name"
                  value={selectedProduct.name}
                  onChange={handleInputChange}
                />
               

                <label>Category:</label>
                <input
                  type="text"
                  name="category"
                  value={selectedProduct.category}
                  onChange={handleInputChange}
                />
               <label>Price:</label>
               <input
  type="number"
  name="price_per_unit"
  value={selectedProduct.price_per_unit}
  onChange={handleInputChange}
/>
<label>Quantity:</label>
<input
  type="number"
  name="quantity_of_uom"
  value={selectedProduct.quantity_of_uom}
  onChange={handleInputChange}
/>

                <label>Shelf No. :</label>
                <input
                  type="text"
                  name="shelfNumber"
                  value={selectedProduct.shelf_num}
                  onChange={handleInputChange}
                />
                <label>Product Image URL:</label>
                <input
                  type="text"
                  name="image"
                  value={selectedProduct.picture_of_the_prod}
                  onChange={handleInputChange}
                />
                <label>Description:</label>
                <textarea
                  name="description"
                  value={selectedProduct.description}
                  onChange={handleInputChange}
                />
              </div>
              <button className="save-button" onClick={handleSave}>
                Save
              </button>
              <button className="cancel-button" onClick={handleCloseModal}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {isShowing && (
          <div className="modal">
            <div className="modal-content">
              <h2>Product Details</h2>
              <p><strong>Name:</strong> {selectedProduct.name}</p>
              <p><strong>Category:</strong> {selectedProduct.category}</p>
              <p><strong>Expiry Date:</strong> {selectedProduct.exp_date}</p>
              <p><strong>Price:</strong> &#x20b9;{selectedProduct.price_per_unit.toFixed(2)}</p>
              <p><strong>Quantity:</strong> {selectedProduct.quantity_of_uom}</p>
              <p><strong>Shelf No. :</strong> {selectedProduct.shelf_num}</p>
              <p><strong>Description:</strong> {selectedProduct.description}</p>
              <img src={selectedProduct.picture_of_the_prod} style={{height:"200px" , width:"200px" , alignSelf:"center"}} alt={selectedProduct.name} className="product-image" />
              <button className="close-button" onClick={handleCloseModal}>
                Close
              </button>
            </div>
          </div>
        )}
      </div>
      </div>
    </>
  );
}

export default WarehouseManu;
