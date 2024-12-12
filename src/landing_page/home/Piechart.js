import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import {productsData} from '../../data/data'; 
import './CategorySalesChart.css'; // Import the CSS file

const CategorySalesChart = () => {
  // Group products by category and calculate the total quantity for each category
  const productCategories = [...new Set(productsData.map(product => product.category))];
  const categoryData = productCategories.map(category => ({
    name: category,
    value: productsData.filter(product => product.category === category).reduce((acc, product) => acc + product.quantity, 0),
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF0000', '#8884d8', '#83a6ed', '#8dd1e1', '#82ca9d'];

  return (
    <div className="chart-container">
      <h3 className="chart-title">Product Quantities by Category</h3>
      <PieChart width={600} height={400} className="pie-chart">
        <Pie
          data={categoryData}
          cx="50%"
          cy="50%"
          innerRadius={90}
          outerRadius={150}
          fill="#8884d8"
          paddingAngle={5}
          dataKey="value"
        >
          {categoryData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip className="custom-tooltip" />
        <Legend layout="vertical" align="right" verticalAlign="middle" />
      </PieChart>
    </div>
  );
};

export default CategorySalesChart;
