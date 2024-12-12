import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import autoTable from 'jspdf-autotable';
import QRCode from 'qrcode';
import React, { useState } from 'react';
import { productsData } from '../../data/data'; // Import products from data.js
import { ordersData } from '../../data/data'; // Import orders from orders_data.js
import './AddOrder.css'; // Import the CSS file
import Sidebar from '../Sidebar';

const AddOrder = () => {
  const [order, setOrder] = useState({
    customerName: '',
    customerAddress: '',
    customerPhoneNumber: '',
    dateTime: new Date().toISOString().slice(0, 16), // Default to current date and time
    products: [{ product: '', quantity: 1, rate: 0, totalPrice: 0 }],
    status: 'unpaid', // Default status
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setOrder({ ...order, [name]: value });
  };

  const handleProductChange = (e, index) => {
    const selectedProduct = productsData.find(product => product.name === e.target.value);
    const updatedProducts = [...order.products];
    updatedProducts[index] = {
      ...updatedProducts[index],
      product: selectedProduct.name,
      rate: selectedProduct.price,
      totalPrice: selectedProduct.price * updatedProducts[index].quantity
    };
    setOrder({ ...order, products: updatedProducts });
  };

  const handleQuantityChange = (e, index) => {
    const quantity = parseInt(e.target.value, 10);
    const updatedProducts = [...order.products];
    updatedProducts[index] = {
      ...updatedProducts[index],
      quantity: quantity,
      totalPrice: updatedProducts[index].rate * quantity
    };
    setOrder({ ...order, products: updatedProducts });
  };

  const handleAddProduct = () => {
    setOrder({
      ...order,
      products: [...order.products, { product: '', quantity: 1, rate: 0, totalPrice: 0 }]
    });
  };

  const handleRemoveProduct = (index) => {
    const updatedProducts = [...order.products];
    updatedProducts.splice(index, 1);
    setOrder({ ...order, products: updatedProducts });
  };

  const calculateOverallTotal = () => {
    return order.products.reduce((sum, product) => sum + product.totalPrice, 0);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const overallTotalPrice = calculateOverallTotal();
    const newOrder = {
      ...order,
      id: ordersData.length + 1,
      overallTotalPrice: overallTotalPrice
    };
    ordersData.push(newOrder);
    console.log("Order Added:", newOrder);
    // Clear the form
    setOrder({
      customerName: '',
      customerAddress: '',
      customerPhoneNumber: '',
      dateTime: new Date().toISOString().slice(0, 16),
      products: [{ product: '', quantity: 1, rate: 0, totalPrice: 0 }],
      status: 'unpaid', // Reset status to default
    });
  };

  const handlePrint = async () => {
    const doc = new jsPDF();

    // Add Customer Details
    doc.setFontSize(16);
    doc.text("Customer Details", 20, 20);
    doc.setFontSize(12);
    doc.text(`Name: ${order.customerName}`, 20, 30);
    doc.text(`Address: ${order.customerAddress}`, 20, 40);
    doc.text(`Phone Number: ${order.customerPhoneNumber}`, 20, 50);

    // Add Date and Time
    doc.text(`Date and Time: ${new Date(order.dateTime).toLocaleString()}`, 20, 60);

    // Generate QR Code
    doc.setFontSize(16);
    doc.text("Scan your QR", 140, 20);
    const qrCodeData = `Order Details:\nName: ${order.customerName}\nAddress: ${order.customerAddress}\nPhone: ${order.customerPhoneNumber}\nStatus: ${order.status}`;
    try {
      const qrCodeUrl = await QRCode.toDataURL(qrCodeData, { width: 40, height: 40 });
      doc.addImage(qrCodeUrl, 'PNG', 138, 22, 40, 40);
    } catch (err) {
      console.error('Error generating QR code:', err);
    }

    const overallTotalPrice = calculateOverallTotal();

    // Add Product Details
    doc.text("Ordered Products", 20, 80);
    doc.autoTable({
      startY: 86,
      head: [['Product', 'Rate', 'Quantity', 'Total Price']],
      body: order.products.map(product => [
        product.product,
        `Rs. ${product.rate.toFixed(2)}`,
        product.quantity,
        `Rs. ${product.totalPrice.toFixed(2)}`,
      ]),
      theme: 'striped'
    });

    // Add Total Amount
    doc.setFontSize(14);
    doc.text(`Total Bill: Rs. ${overallTotalPrice.toFixed(2)}`, 20, doc.autoTable.previous.finalY + 10);

    // Add Payment Status
    doc.text(`Status: ${order.status}`, 20, doc.autoTable.previous.finalY + 20);

    // Save PDF
    doc.save('order-details.pdf');
  };

  return (
    <>
      <div className='dash-board'>
        <Sidebar />
        <div className="add-order-container">
          <h2>Add New Order</h2>
          <form onSubmit={handleSubmit} className="add-order-form">
            <div className="form-group">
              <label htmlFor="customerName">Customer Name:</label>
              <input
                type="text"
                id="customerName"
                name="customerName"
                value={order.customerName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="customerAddress">Customer Address:</label>
              <input
                type="text"
                id="customerAddress"
                name="customerAddress"
                value={order.customerAddress}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="customerPhoneNumber">Customer Phone Number:</label>
              <input
                type="text"
                id="customerPhoneNumber"
                name="customerPhoneNumber"
                value={order.customerPhoneNumber}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="dateTime">Date and Time:</label>
              <input
                type="datetime-local"
                id="dateTime"
                name="dateTime"
                value={order.dateTime}
                onChange={handleChange}
                required
              />
            </div>

            {/* Status Dropdown */}
            <div className="form-group">
              <label htmlFor="status">Payment Status:</label>
              <select
                id="status"
                name="status"
                value={order.status}
                onChange={handleChange}
                required
              >
                <option value="unpaid">unpaid</option>
                <option value="paid">paid</option>
              </select>
            </div>

            <div className="products-table">
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Rate</th>
                    <th>Quantity</th>
                    <th>Total Price</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {order.products.map((productOrder, index) => (
                    <tr key={index}>
                      <td>
                        <select
                          id={`product-${index}`}
                          name="product"
                          value={productOrder.product}
                          onChange={(e) => handleProductChange(e, index)}
                          required
                        >
                          <option value="">Select a product</option>
                          {productsData.map((product) => (
                            <option key={product.id} value={product.name}>
                              {product.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <input
                          type="text"
                          id={`rate-${index}`}
                          name="rate"
                          value={`₹${productOrder.rate.toFixed(2)}`}
                          readOnly
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          id={`quantity-${index}`}
                          name="quantity"
                          value={productOrder.quantity}
                          onChange={(e) => handleQuantityChange(e, index)}
                          required
                          min="1"
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          id={`totalPrice-${index}`}
                          name="totalPrice"
                          value={`₹${productOrder.totalPrice.toFixed(2)}`}
                          readOnly
                        />
                      </td>
                      <td>
                        <button type="button" className="remove-product-button" onClick={() => handleRemoveProduct(index)}>✖</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button type="button" className="add-product-button" onClick={handleAddProduct}>+ Add Another Product</button>
            </div>

            <div className="total-amount-section">
              <h3>Total Amount: ₹{calculateOverallTotal().toFixed(2)}</h3>
              <button type="button" className="print-button" onClick={handlePrint}>Print Order</button>
            </div>

            <button type="submit" className="submit-button">Add Order</button>
          </form>
        </div>
      </div>
    </>
  );
};

export default AddOrder;
