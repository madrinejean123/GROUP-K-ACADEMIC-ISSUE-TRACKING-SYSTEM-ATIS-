import React, { useState } from 'react';
import { Link } from "react-router-dom";
import PageHeader from "../../Components/PageHeader/PageHeader"; // Import PageHeader
import Footer from "../../Components/Footer/Footer"; // Import Footer
import "../LoginPage/login.css";

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  // Handle form input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <>
      {/* Page Header */}
      <PageHeader />

      <div className="login-container">
        <h2>Login</h2>

        {/* Common Fields */}
        <input type="email" name="email" placeholder="Email" onChange={handleChange} value={formData.email} required />
        <input type="password" name="password" placeholder="Password" onChange={handleChange} value={formData.password} required />

        {/* Forgot Password link */}
        <div className="forgot-password">
          <Link to="/forgot-password">Forgot Password?</Link>
        </div>

        {/* Submit Button */}
        <button type="submit">Login</button>

        {/* Signup Button */}
        <div className="signup-redirect">
          <p>Don't have an account? <Link to="/signup">Sign Up</Link></p>
        </div>
      </div>









      {/* Footer */}
      <Footer />
    </>
  );
};

export default Login;
