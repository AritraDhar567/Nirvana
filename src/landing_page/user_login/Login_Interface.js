import React from 'react';
import { Link } from 'react-router-dom';
import './Auth.css';

function Login_Interface() {
  return (
    <div className='login-bg'>
    <div className="auth-container">
    
      <h2>Login Interface</h2>
     
        
        <Link to='/Manufacture' style={{textDecoration:"none" , color: "#764ba2" }}  type="submit" className="auth-btn text-center ">Login for Manufacturer</Link>
        <Link to='/Wholesaler' style={{textDecoration:"none" , color: "#764ba2" }}  type="submit" className="auth-btn text-center my-5">Login for Wholesaler</Link>
        <Link to='/login' style={{textDecoration:"none" , color: "#764ba2" }}  type="submit" className="auth-btn text-center">Login for Retailer</Link>
     
     
      
    </div>
    </div>
  );
}

export default Login_Interface;