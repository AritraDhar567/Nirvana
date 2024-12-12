import React from 'react';
import './Dashboard.css'

function Header() {
    return ( 
        <>
      
            <div className="row border-bottom mt-3">
                <h1 className="heading fs-3 text-start ">Welcome Back! , User</h1>
           
                
            </div>
            <div className="info-section">
                <p >Your performance summary this week</p>
            </div>
           
     
        </>
     );
}

export default Header;