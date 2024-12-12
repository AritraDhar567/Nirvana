import React, { useState } from 'react';
import './AddProduct.css';
import SideManu from '../SideManu';
function ProductManu() {
  const [product, setProduct] = useState({
    name: '',
    category: '',
    exp_date: '',
    price_per_unit: '',
    quantity_of_uom: '',
    shelf_num: '',
    uom_id:'',
    picture_of_the_prod:null,
    description: '',
    user_id:1,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    // If the field is quantity or price, convert the value to a number
    setProduct((prevProduct) => ({
      ...prevProduct,
      [name]: name === 'quantity_of_uom' || name === 'price_per_unit' ? Number(value) : value,
    }));
  };


  const handleImageChange = (e) => {
    setProduct((prevProduct) => ({
      ...prevProduct,
      image: e.target.files[0],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('data', JSON.stringify(product));
    if (product.image) {
      formData.append('image', product.image);
    }

    try {
      const response = await fetch('http://127.0.0.1:5000/insertProductManu', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Product Added:', result);
        // Handle success (e.g., show a success message, reset form, etc.)
        setProduct({
          name: '',
          category: '',
          exp_date: '',
          price_per_unit: '',
          quantity_of_uom: '',
          shelf_num: '',
          picture_of_the_prod: null,
          uom_id:'',
          description: '',
          user_id:1,
        });
      } else {
        console.error('Failed to add product:', response.statusText);
        // Handle error (e.g., show an error message)
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      // Handle error (e.g., show an error message)
    }
  };

  return (
    <><div className='dash-board'>
      <SideManu />
      <div className="form-container">
        <form className="add-product-form" onSubmit={handleSubmit}>
          <h2>Add Product In Inventory</h2>
          <div className="form-group">
            <label>Product Name:</label>
            <input
              type="text"
              name="name"
              value={product.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Category:</label>
            <input
              type="text"
              name="category"
              value={product.category}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Expiry Date:</label>
            <input
              type="date"
              name="exp_date"
              value={product.expiryDate}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Price:</label>
            <input
              type="number"
              name="price_per_unit"
              value={product.price_per_unit}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Quantity:</label>
            <input
              type="number"
              name="quantity_of_uom"
              value={product.quantity_of_uom}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
  <label>Unit of Measurement (UOM):</label>
  <input
    type="number"
    name="uom_id"
    value={product.uom_id}
    onChange={handleChange}
    required
  />
</div>
          <div className="form-group">
            <label>Shelf No.:</label>
            <input
              type="text"
              name="shelf_num"
              value={product.shelf_num}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Product Image:</label>
            <input
              type="file"
              name="picture_of_the_prod"
              onChange={handleImageChange}
              
            />
          </div>
          <div className="form-group">
            <label>Product Description:</label>
            <textarea
              name="description"
              value={product.description}
              onChange={handleChange}
              required
            ></textarea>
          </div>
          <button type="submit" className="add-button">Add Product</button>
        </form>
      </div>
      </div>
    </>
  );
}

export default ProductManu;