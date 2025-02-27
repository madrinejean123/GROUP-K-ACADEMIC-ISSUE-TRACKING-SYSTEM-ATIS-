import React, { useState } from 'react';
import { Link } from "react-router-dom";
import PageHeader from "../../Components/PageHeader/PageHeader"; 
import Footer from "../../Components/Footer/Footer"; 
import "../LoginPage/login.css";

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <>
      
      <PageHeader />

      <div className="login-container">
        <h2>Login</h2>

        
        <input type="email" name="email" placeholder="Email" onChange={handleChange} value={formData.email} required />
        <input type="password" name="password" placeholder="Password" onChange={handleChange} value={formData.password} required />

        
        <div className="forgot-password">
          <Link to="/forgot-password">Forgot Password?</Link>
        </div>

        
        <button type="submit">Login</button>

        
        <div className="signup-redirect">
          <p>Don't have an account? <Link to="/signup">Sign Up</Link></p>
        </div>
      </div>


      
      <Footer />
    </>
  );
};

export default Login;
