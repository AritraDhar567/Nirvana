import React, { useState } from 'react';
import { productsData } from '../../data/data'; // Import products from data.js
import { ordersData } from '../../data/data'; // Import orders from orders_data.js
import './Order.css'; // Import the CSS file
import Sidebar from '../Sidebar';
import { v4 as uuidv4 } from 'uuid'; // For generating unique bill IDs
import jsPDF from 'jspdf';
import QRCode from 'qrcode';

const Orders = () => {
  const [orders, setOrders] = useState(ordersData);
  const [editingOrder, setEditingOrder] = useState(null);

  const handleEdit = (order) => {
    setEditingOrder(order);
  };

  const handleDelete = (id) => {
    const updatedOrders = orders.filter(order => order.id !== id);
    setOrders(updatedOrders);
  };

  const calculateOverallTotal = () => {
    return editingOrder?.products?.reduce((sum, product) => sum + product.totalPrice, 0) || 0;
  };

  const handlePrint = async () => {
    if (!editingOrder) return; // Ensure an order is being edited

    const doc = new jsPDF();

    // Add Customer Details
    doc.setFontSize(16);
    doc.text("Customer Details", 20, 20);
    doc.setFontSize(12);
    doc.text(`Name: ${editingOrder.customerName}`, 20, 30);
    doc.text(`Address: ${editingOrder.customerAddress}`, 20, 40);
    doc.text(`Phone Number: ${editingOrder.customerPhoneNumber}`, 20, 50);

    // Generate QR Code
    doc.setFontSize(16);
    doc.text("Scan your QR", 140, 20);
    const qrCodeData = `Order Details:\nName: ${editingOrder.customerName}\nAddress: ${editingOrder.customerAddress}\nPhone: ${editingOrder.customerPhoneNumber}`;
    try {
      const qrCodeUrl = await QRCode.toDataURL(qrCodeData, { width: 40, height: 40 });
      doc.addImage(qrCodeUrl, 'PNG', 138, 22, 40, 40);
    } catch (err) {
      console.error('Error generating QR code:', err);
    }

    // Add Product Details
    doc.text("Ordered Products", 20, 65);
    doc.autoTable({
      startY: 71,
      head: [['Product', 'Rate', 'Quantity', 'Total Price']],
      body: editingOrder.products?.map(product => [
        product.product,
        `Rs. ${product.rate.toFixed(2)}`,
        product.quantity,
        `Rs. ${product.totalPrice.toFixed(2)}`,
      ]) || [],
      theme: 'striped'
    });

    // Add Total Amount
    const overallTotalPrice = calculateOverallTotal();
    doc.setFontSize(14);
    doc.text(`Total Bill: Rs. ${overallTotalPrice.toFixed(2)}`, 20, doc.autoTable.previous.finalY + 10);

    // Save PDF
    doc.save('order-details.pdf');
  };

  const handlePay = () => {
    if (editingOrder) {
      setEditingOrder({ ...editingOrder, status: 'paid' });
    }
  };

  const handleProductChange = (e, index) => {
    if (!editingOrder) return;

    const selectedProduct = productsData.find(product => product.name === e.target.value);
    const updatedProducts = [...editingOrder.products];
    updatedProducts[index] = {
      ...updatedProducts[index],
      product: selectedProduct?.name || '',
      rate: selectedProduct?.price || 0,
      totalPrice: (selectedProduct?.price || 0) * updatedProducts[index].quantity
    };
    setEditingOrder({ ...editingOrder, products: updatedProducts });
  };

  const handleQuantityChange = (e, index) => {
    if (!editingOrder) return;

    const quantity = parseInt(e.target.value, 10);
    const updatedProducts = [...editingOrder.products];
    updatedProducts[index] = {
      ...updatedProducts[index],
      quantity: quantity,
      totalPrice: updatedProducts[index].rate * quantity
    };
    setEditingOrder({ ...editingOrder, products: updatedProducts });
  };

  const handleAddProduct = () => {
    if (editingOrder) {
      setEditingOrder({
        ...editingOrder,
        products: [...editingOrder.products, { product: '', quantity: 1, rate: 0, totalPrice: 0 }]
      });
    }
  };

  const handleRemoveProduct = (index) => {
    if (!editingOrder) return;

    const updatedProducts = [...editingOrder.products];
    updatedProducts.splice(index, 1);
    setEditingOrder({ ...editingOrder, products: updatedProducts });
  };

  const handleSave = () => {
    if (editingOrder) {
      const updatedOrders = orders.map(order =>
        order.id === editingOrder.id ? editingOrder : order
      );
      setOrders(updatedOrders);
      setEditingOrder(null);
    }
  };

  const handleCancel = () => {
    setEditingOrder(null);
  };

  return (
    <>
    <div className='dash-board'>
      <Sidebar />
      <div className="order-container">
        <h2>Order Management</h2>
        <input
          type="text"
          className="search-bar"
          placeholder="Search by Customer Name"
          onChange={(e) => {
            const searchQuery = e.target.value;
            const filteredOrders = ordersData.filter(order =>
              order.customerName.toLowerCase().includes(searchQuery)
            );
            setOrders(filteredOrders);
          }}
        />
        <table className="orders-table">
          <thead>
            <tr>
              <th>Bill ID</th>
              <th>Customer Name</th>
              <th>Phone Number</th>
              <th>Date & Time</th>
              <th>Product Qty</th>
              <th>Total Price</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>BILL#100{order.id}</td>
                <td>{order.customerName}</td>
                <td>{order.customerPhoneNumber}</td>
                <td>{order.dateTime}</td>
                <td>{order.products.length}</td>
                <td>₹{order.products.reduce((total, product) => total + product.totalPrice, 0).toFixed(2)}</td>
                <td>
                  <span className={`status ${order.status}`}>
                    {order.status}
                  </span>
                </td>
                <td>
                  <button className="edit-button" onClick={() => handleEdit(order)}><i class="fa-solid fa-eye"></i></button>
                  <button className="delete-button" onClick={() => handleDelete(order.id)}><i class="fa-solid fa-trash"></i></button>
                  
                </td>
              </tr>
            ))}
          </tbody>
        </table>
          
        {editingOrder && (
          <div className="edit-order-modal">
            <h3>Edit Order</h3>
            <form>
              <label>Customer Name</label>
              <input
                type="text"
                value={editingOrder.customerName || ''}
                onChange={(e) => setEditingOrder({ ...editingOrder, customerName: e.target.value })}
              />
              <label>Customer Phone Number</label>
              <input
                type="text"
                value={editingOrder.customerPhoneNumber || ''}
                onChange={(e) => setEditingOrder({ ...editingOrder, customerPhoneNumber: e.target.value })}
              />
              <label>Customer Address</label>
              <input
                type="text"
                value={editingOrder.customerAddress || ''}
                onChange={(e) => setEditingOrder({ ...editingOrder, customerAddress: e.target.value })}
              />

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
                    {editingOrder.products.map((productOrder, index) => (
                      <tr key={index}>
                        <td>
                          <select
                            value={productOrder.product || ''}
                            onChange={(e) => handleProductChange(e, index)}
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
                            value={`₹${productOrder.rate.toFixed(2)}`}
                            readOnly
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            value={productOrder.quantity}
                            onChange={(e) => handleQuantityChange(e, index)}
                            min="1"
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            value={`₹${productOrder.totalPrice.toFixed(2)}`}
                            readOnly
                          />
                        </td>
                        <td>
                          <button type="button" style={{backgroundColor:"red" , color:"white"}} onClick={() => handleRemoveProduct(index)}>Remove</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <button className="add-pro" type="button" onClick={handleAddProduct}>Add Product</button>
              
              
              <button className="add-pay" type="button" onClick={handlePay}>Pay</button>
              <button className="add-print" type="button" onClick={handlePrint}>Print</button>
              <br></br><br></br>
              <button className="add-save" type="button" onClick={handleSave}>Save</button>
              <button className="add-cancel" type="button" onClick={handleCancel}>Cancel</button>
            </form>
          </div>
        )}
      </div>
      </div>
    </>
  );
};

export default Orders;