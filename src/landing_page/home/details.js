import React from 'react';
import Sidebar from '../Sidebar';
import Nav from './Nav';
import { Pie, Bar } from 'react-chartjs-2';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement, BarElement, CategoryScale, LinearScale } from 'chart.js';
import './Dashboard.css'
import {productsData , ordersData} from '../../data/data'; // Adjust the path as necessary
import './ProductList.css'; // Ensure this CSS file is created as well

ChartJS.register(Title, Tooltip, Legend, ArcElement, BarElement, CategoryScale, LinearScale);

const calculateTopSellingProducts = () => {
    const productSales = {};

    ordersData.forEach(order => {
        order.products.forEach(item => {
            if (productSales[item.product]) {
                productSales[item.product] += item.totalPrice;
            } else {
                productSales[item.product] = item.totalPrice;
            }
        });
    });

    return Object.entries(productSales)
        .map(([name, totalSales]) => ({
            ...productsData.find(product => product.name === name),
            totalSales
        }))
        .sort((a, b) => b.totalSales - a.totalSales)
        .slice(0, 5); // Top 5 selling products
};

const calculateRestockProducts = () => {
    return productsData.filter(product => product.quantity < 10);
};

const Details = () => {
    const topSellingProducts = calculateTopSellingProducts();
    const restockProducts = calculateRestockProducts();
    const calculateTotalSales = (orders) => {
        const sales = {};
      
        orders.forEach(order => {
          order.products.forEach(item => {
            if (!sales[item.product]) {
              sales[item.product] = 0;
            }
            sales[item.product] += item.totalPrice;
          });
        });
      
        return sales;
      };
      
     const calculateOrderValues = (orders) => {
    const values = orders.map(order => order.overallTotalPrice);
    const average = values.reduce((sum, value) => sum + value, 0) / values.length;
    const highest = Math.max(...values);
    const lowest = Math.min(...values);
    const totalOrders = orders.length; // New total orders calculation
    const totalRevenue = values.reduce((sum, value) => sum + value, 0); // New total revenue calculation
    return { average, highest, lowest, totalOrders, totalRevenue }; // Include new data points
};

      
      // Process data for charts
     
      
      // Pie Chart Data
       // Prepare the data for the top 10 selling products
       const sales = calculateTotalSales(ordersData);
       const sortedSales = Object.entries(sales).sort((a, b) => b[1] - a[1]);
       const top10Products = sortedSales.slice(0, 10);
       const labels = top10Products.map(item => item[0]);
       const data = top10Products.map(item => item[1]);
       
       const { average, highest , lowest} = calculateOrderValues(ordersData);
       const colors =['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF0000', '#8884d8', '#83a6ed', '#8dd1e1', '#82ca9d' , '#33F6FF', '#F6FF33'];
       // Pie Chart Data
       const pieChartData = {
        labels,
         datasets: [
           {
             label: 'Top 10 Selling Products',
             data: data,
             backgroundColor: [
              '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF0000', '#8884d8', '#83a6ed', '#8dd1e1', '#82ca9d' , '#33F6FF', '#F6FF33'
             ],
             borderWidth: 5
           }
         ]
       };
       const chartOptions = {
        cutout: '60%', // Adjust the thickness of the doughnut
        plugins: {
          legend: {
            display: false, // Disable the default legend
          },
        },
      };
       // Bar Chart Data
       const barChartData = {
         labels: ['Average Order Value', 'Highest Order Value' , 'Lowest Order Value'],
         datasets: [
           {
             label: 'Order Values',
             data: [average, highest , lowest],
             backgroundColor: ['#FF6384', '#36A2EB', '#8884d8'],
             borderColor: ['#FF6384', '#36A2EB'],
             borderWidth: 0,
                barPercentage: 0.7, // Adjust the bar width (0.5 means 50% of the available space)
                categoryPercentage: 0.7 // Adjust the spacing between bars
           }
         ]
       };

    const options = {
      scales: {
          x: {
              grid: {
                  display: false, // Disable grid lines for the x-axis
              },
          },
          y: {
              grid: {
                  display: false, // Disable grid lines for the y-axis
              },
          },
      },
  };
    return (
        <>
        <div className='dash-board'>
        <Sidebar/>
        <div className='dashboard-container'>
            <Nav/>
            <div className="product-list">
            <div className="table-container">
                <div className="table-section">
                    <h2>Top Selling Products</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Image</th>
                                <th>Name</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Total Sales</th>
                            </tr>
                        </thead>
                        <tbody>
                            {topSellingProducts.map(product => (
                                <tr key={product.id}>
                                    <td><img src={product.image} alt={product.name} className="table-image" /></td>
                                    <td>{product.name}</td>
                                    <td>{product.category}</td>
                                    <td>₹{product.price.toFixed(2)}</td>
                                    <td>₹{product.totalSales.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="table-section">
                    <h2>Products to Restock</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Image</th>
                                <th>Name</th>
                                <th>Category</th>
                                <th>Quantity</th>
                                <th>Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            {restockProducts.map(product => (
                                <tr key={product.id}>
                                    <td><img src={product.image} alt={product.name} className="table-image" /></td>
                                    <td>{product.name}</td>
                                    <td>{product.category}</td>
                                    <td>{product.quantity}</td>
                                    <td>₹{product.price.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        <div className="statistics">
            <div className='chart-container-pie'>
        <div>
            <h2 className='selling-products'>Top 10 Selling Products</h2>
        <Doughnut data={pieChartData} options={chartOptions} />
        </div>
        <div className="legend">
        {labels.map((label, index) => (
          <div key={index} className="legend-item">
            <span
              className="legend-color"
              style={{ backgroundColor: colors[index] }}
            ></span>
            <span className="legend-label">{label}</span>
          </div>
        ))}
      </div>
        </div>
      <div className="chart-container-bar">
        <h2>Order Value Statistics</h2>
        <Bar data={barChartData}  options={options} />
      </div>
      </div>
        </div>
        </div>
        </>
    );
};

export default Details;
